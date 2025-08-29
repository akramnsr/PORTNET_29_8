# task_dispatcher.py
import os, traceback
import psycopg2
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

# --- Config DB : locale, explicite, sans SSL
DB_CONFIG = {
    "host": "127.0.0.1",   # pas 'localhost'
    "port": 5432,
    "dbname": "portnet",
    "user": "postgres",
    "password": "sab",     # aligne avec ce que tu as défini dans pgAdmin
    "connect_timeout": 5,
    "sslmode": "disable",
}

DISPATCHER_KEY = os.environ.get("DISPATCHER_KEY", "")  # ex: dev-key

def get_connection():
    """
    Connexion robuste. En cas d'échec, on renvoie un message ASCII (repr) pour éviter l'erreur 0xE9.
    """
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        # ta base est UTF8 (cf. ta capture), donc on cale le client en UTF8
        conn.set_client_encoding("UTF8")
        return conn
    except Exception as e:
        # on encapsule le message original en repr(...) pour éviter les soucis d'accents
        raise RuntimeError(f"DB_CONNECT_FAILED: {repr(e)}")

# ---------- DISPATCH (ne lit aucun champ texte pour éviter tout bruit d'encodage) ----------
def get_agents_with_metrics(conn, max_anomalies=5, min_activity=10, days_activity=7):
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM agents WHERE is_activated = TRUE")
        agents = [row[0] for row in (cur.fetchall() or [])]

        cur.execute("""
            SELECT agent_id, COUNT(*)
            FROM anomaly_detection_results
            WHERE detected_at >= %s
            GROUP BY agent_id
        """, (datetime.now() - timedelta(days=days_activity),))
        anomalies = dict(cur.fetchall() or [])

        cur.execute("""
            SELECT agent_id, COUNT(*)
            FROM agent_activity_logs
            WHERE timestamp >= %s
            GROUP BY agent_id
        """, (datetime.now() - timedelta(days=days_activity),))
        activities = dict(cur.fetchall() or [])

    valid = []
    for agent_id in agents:
        if anomalies.get(agent_id, 0) <= max_anomalies and activities.get(agent_id, 0) >= min_activity:
            valid.append({
                "id": agent_id,
                "nom": None,  # on le remettra quand tout est OK
                "anomalies": anomalies.get(agent_id, 0),
                "activite": activities.get(agent_id, 0)
            })
    return valid

def get_demandes_en_attente(conn):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT id
            FROM demandes
            WHERE statut = 'EN_ATTENTE' AND agent_id IS NULL
            ORDER BY created_at ASC NULLS FIRST, id ASC
        """)
        return [r[0] for r in (cur.fetchall() or [])]

def get_charge_par_agent(conn):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT agent_id, COUNT(*)
            FROM demandes
            WHERE agent_id IS NOT NULL
            GROUP BY agent_id
        """)
        return dict(cur.fetchall() or [])

def dispatcher_demandes():
    conn = None
    try:
        conn = get_connection()

        demandes = get_demandes_en_attente(conn)
        if not demandes:
            return {"message": "Aucune demande en attente a dispatcher."}

        agents = get_agents_with_metrics(conn)
        if not agents:
            return {"error": "Aucun agent valide disponible pour le dispatch."}

        charge = get_charge_par_agent(conn)
        pool = {a["id"]: charge.get(a["id"], 0) for a in agents}

        assigned = []
        with conn.cursor() as cur:
            for dem_id in demandes:
                if not pool: break
                agent_id = min(pool, key=pool.get)
                cur.execute("""
    UPDATE demandes
    SET agent_id = %s,
        assigned_at = NOW()
    WHERE id = %s
      AND statut = 'EN_ATTENTE'        -- on sécurise la transition
    RETURNING id
""", (agent_id, dem_id))
                if cur.fetchone():
                    assigned.append({"demande_id": dem_id, "agent_id": agent_id})
                    pool[agent_id] = pool.get(agent_id, 0) + 1

        conn.commit()
        return {"message": f"{len(assigned)} demande(s) assignees avec succes.", "details": assigned}

    except Exception as e:
        if conn:
            try: conn.rollback()
            except Exception: pass
        return {"error": str(e), "trace": traceback.format_exc()}
    finally:
        if conn:
            try: conn.close()
            except Exception: pass

# -------------------- ROUTES --------------------
@app.route("/__routes")
def __routes():
    routes = sorted([str(r) for r in app.url_map.iter_rules() if r.endpoint != "static"])
    return jsonify({"routes": routes}), 200

@app.route("/dispatcher", methods=["GET"])
def run_dispatcher():
    if DISPATCHER_KEY and request.headers.get("X-Dispatcher-Key") != DISPATCHER_KEY:
        return jsonify({"error": "Unauthorized"}), 401
    res = dispatcher_demandes()
    return jsonify(res), (200 if not res.get("error") else 500)

@app.route("/health")
def health():
    return jsonify({"ok": True}), 200

@app.route("/health/dbcfg")
def health_dbcfg():
    safe = {k: ("***" if k == "password" else v) for k, v in DB_CONFIG.items()}
    return jsonify(safe), 200

@app.route("/health/ping")
def health_ping():
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT 1;")
            one = cur.fetchone()[0]
        conn.close()
        return jsonify({"db_ok": True, "select1": one}), 200
    except Exception as e:
        return jsonify({"db_ok": False, "error": str(e)}), 500

@app.route("/health/enc")
def health_enc():
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("SHOW server_encoding")
            server_enc = cur.fetchone()[0]
            cur.execute("SHOW client_encoding")
            client_enc = cur.fetchone()[0]
        conn.close()
        return jsonify({"server_encoding": server_enc, "client_encoding": client_enc}), 200
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

# -------------------- MAIN --------------------
if __name__ == "__main__":
    print(">>> LOADED FROM:", __file__)
    print(">>> Routes will be:", sorted([str(r) for r in app.url_map.iter_rules() if r.endpoint != "static"]))
    app.run(host="127.0.0.1", port=5003)
