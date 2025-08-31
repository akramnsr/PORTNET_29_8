import axios from 'axios';

const API = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

const authHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Session expirée. Veuillez vous reconnecter.');
    return { Authorization: `Bearer ${token}` };
};

const unpack = (data) =>
    (Array.isArray(data) ? data : (data?.content ?? data ?? [])) || [];

/** Normalise un enregistrement dossier pour l’IHM */
export function normalizeDossier(d, idx = 0) {
    const numero = d.numeroEnregistrement ?? d.numero ?? d.reference ?? d.ref ?? d.code ?? d.id ?? `D-${idx}`;
    const type = d.type ?? d.categorie ?? d.category ?? d.nature ?? '—';
    const statut = d.statut ?? d.status ?? '—';
    const createdAt = d.createdAt ?? d.dateCreation ?? d.created ?? d.date ?? d.submittedAt ?? null;
    const resume = d.objet ?? d.titre ?? d.title ?? d.description ?? d.resume ?? '';
    const bureau = d.bureau ?? d.office ?? '';
    const categorie = d.categorie ?? d.category ?? '';
    return { id: d.id ?? numero ?? String(idx), numero, type, statut, date: createdAt, resume, bureau, categorie, _raw: d };
}

/** Transforme /api/tasks/my → liste de dossiers (dédupliqués) */
function tasksToDossiers(tasks = []) {
    const map = new Map();
    tasks.forEach((t, i) => {
        const d = t.demande || t.dossier || t.request || t.ticket || t.case || {};
        const numero = d.numeroEnregistrement ?? d.numero ?? d.reference ?? d.ref ?? d.code ?? d.id ?? `T-${t.id ?? i}`;
        const key = d.id ?? numero;
        const normal = normalizeDossier({
            id: d.id,
            numeroEnregistrement: d.numeroEnregistrement,
            numero: d.numero,
            reference: d.reference,
            type: d.type ?? t.type,
            categorie: d.categorie,
            status: t.status ?? t.assignmentStatus ?? d.status,
            dateCreation: d.dateCreation ?? d.createdAt ?? t.createdAt,
            titre: d.titre,
            objet: d.objet,
            description: d.description,
            bureau: d.bureau,
        }, i);
        if (!map.has(key)) map.set(key, normal);
    });
    return Array.from(map.values());
}

/** ✅ Version sans essais multiples (donc pas de 404 bruités) */
export async function listMyAssignedDossiers(params = {}) {
    try {
        const res = await axios.get(`${API}/api/tasks/my`, { headers: authHeader(), params });
        return tasksToDossiers(unpack(res.data));
    } catch {
        return [];
    }
}
