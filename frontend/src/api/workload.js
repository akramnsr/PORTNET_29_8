// src/api/workload.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/* Axios + token */
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((cfg) => {
    const t = localStorage.getItem('token');
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
});

/* Helpers */
const toInt = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};
const ymd = (d) => new Date(d ?? Date.now()).toISOString().slice(0, 10); // YYYY-MM-DD
const iso = (d) => new Date(d ?? Date.now()).toISOString();

const mapWorkload = (arr) =>
    (arr || []).map((r, i) => ({
        id: r.id ?? r.agentId ?? r.userId ?? `agent-${i}`,
        agentId: r.agentId ?? r.id ?? r.userId,
        agent: r.agent ?? r.agentName ?? r.fullName ?? r.nom ?? r.nomComplet ?? r.email ?? '—',
        dossiersTotal: toInt(r.dossiersTotal ?? r.total),
        enCours: toInt(r.enCours ?? r.inProgress),
        enRetard: toInt(r.enRetard ?? r.late),
        slaMedianMin: toInt(r.slaMedianMin ?? r.sla_median_min),
        tempsMoyenMin: toInt(r.tempsMoyenMin ?? r.avgHandleMin),
        productiviteJ: toInt(r.productiviteJ ?? r.dailyThroughput),
    }));

async function tryRequests(reqs) {
    let last;
    for (const r of reqs) {
        try {
            const res = await api.get(r.url, { params: r.params });
            return res.data;
        } catch (e) {
            last = e;
            // on continue si 4xx — on réessaie avec un autre format
            if (e?.response?.status >= 500) break;
        }
    }
    throw last;
}

/* === Charge de travail (tableau du haut) === */
export async function getAgentsWorkload(filters = {}) {
    const from = filters.from || Date.now() - 30 * 24 * 60 * 60 * 1000;
    const to = filters.to || Date.now();
    const base = {
        q: filters.q || undefined,
        bureau: filters.bureau || undefined,
        categorie: filters.categorie || undefined,
    };

    try {
        const data = await tryRequests([
            { url: '/api/agents/workload', params: { ...base, from: ymd(from), to: ymd(to) } }, // format “simple”
            { url: '/api/agents/workload', params: { ...base, from: iso(from), to: iso(to) } }, // ISO complet
            { url: '/api/agents/workload', params: base },                                      // sans dates
        ]);

        const arr = Array.isArray(data) ? data : (data?.items || data?.content || []);
        return mapWorkload(arr);
    } catch (e) {
        console.warn('[workload] GET /api/agents/workload → KO, retour []', e?.response?.status, e?.message);
        return [];
    }
}

/* === Journal du dispatch (tableau du bas) === */
export async function getDispatchJournal(filters = {}) {
    const from = filters.from || Date.now() - 30 * 24 * 60 * 60 * 1000;
    const to = filters.to || Date.now();

    try {
        const { data } = await api.get('/api/dispatch/journal', {
            params: {
                q: filters.q || undefined,
                bureau: filters.bureau || undefined,
                categorie: filters.categorie || undefined,
                from: ymd(from),
                to: ymd(to),
            },
        });

        const raw = Array.isArray(data) ? data : (data?.items || data?.content || []);
        const items = raw.map((it, i) => ({
            id: it.id ?? it.eventId ?? i,
            date: it.date ?? it.createdAt ?? it.timestamp ?? it.eventDate,
            dossier: it.dossier ?? it.dossierId ?? it.numero ?? it.reference ?? it.caseNumber ?? '—',
            from: it.from ?? it.fromAgent ?? it.source ?? it.oldAgent ?? it.oldQueue ?? '—',
            toAgent: it.toAgent ?? it.to ?? it.newAgent ?? it.assignee ?? '—',
            by: it.by ?? it.user ?? it.triggeredBy ?? it.performedBy ?? '—',
            motif: it.motif ?? it.reason ?? it.cause ?? '—',
        }));

        return { items, total: data?.total ?? data?.totalElements ?? items.length };
    } catch (e) {
        console.warn('[workload] GET /api/dispatch/journal → KO, retour vide', e?.response?.status, e?.message);
        return { items: [], total: 0 };
    }
}

/* === Opérations === */
export async function bulkReassign(payload) {
    const { data } = await api.post('/api/dossiers/bulk-reassign', payload);
    return data;
}

export async function listAgents() {
    try {
        const { data } = await api.get('/api/agents');
        const arr = Array.isArray(data) ? data : (data?.items || data?.content || []);
        return arr.map((a) => ({
            id: a.id ?? a.agentId ?? a.userId,
            label: a.nomComplet ?? a.fullName ?? a.name ?? a.email ?? `Agent #${a.id}`,
            enabled: a.enabled ?? true,
            email: a.email,
        }));
    } catch (e) {
        console.warn('[workload] GET /api/agents → KO, []', e?.response?.status, e?.message);
        return [];
    }
}
