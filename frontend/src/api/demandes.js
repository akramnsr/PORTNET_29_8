import axios from 'axios';

const API = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

function authHeader() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Session expirée. Veuillez vous reconnecter.');
    return { Authorization: `Bearer ${token}` };
}

/**
 * createDemande({ form, files })
 * Essaie POST sur /api/demandes, /api/dossiers, /api/requests
 */
export async function createDemande({ form, files = [] }) {
    const fd = new FormData();
    fd.append('payload', JSON.stringify(form));
    (files || []).forEach((f) => fd.append('documents', f, f.name));

    const paths = ['/api/demandes', '/api/dossiers', '/api/requests'];

    let lastErr = null;
    for (const p of paths) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const res = await axios.post(`${API}${p}`, fd, {
                headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        } catch (e) {
            const status = e?.response?.status;
            lastErr = e;
            if (status === 404 || status === 405) continue;
            throw e;
        }
    }
    if (lastErr) throw lastErr;
    throw new Error("Aucun endpoint d'API compatible n'a été trouvé.");
}
