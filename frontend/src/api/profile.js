// src/api/profile.js
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

/* ---- Auth header ---- */
function authHeader() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Session expirée. Veuillez vous reconnecter.');
    return { Authorization: `Bearer ${token}` };
}

/* ---- Utils ---- */
export function errorToText(e) {
    const d = e?.response?.data;
    if (typeof d === 'string') return d;
    if (d && (d.message || d.error)) return d.message || d.error;
    if (e?.message) return e.message;
    try { return JSON.stringify(d ?? e); } catch { return String(d ?? e); }
}

/* ---- GET me : essaie d'abord /api/agents/me ---- */
export async function getMe() {
    const paths = ['/api/agents/me', '/api/auth/me', '/api/users/me'];
    let lastErr = null;
    for (const p of paths) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const res = await axios.get(`${API}${p}`, { headers: authHeader() });
            return res.data;
        } catch (e) {
            lastErr = e;
            const s = e?.response?.status;
            if (s !== 404) break;
        }
    }
    throw lastErr || new Error('Impossible de charger le profil.');
}

/* ---- UPDATE me : priorité à /api/agents/me ---- */
export async function updateMe(payload) {
    const candidates = [
        { url: '/api/agents/me', method: 'put' },
        { url: '/api/auth/me', method: 'put' },
        { url: '/api/users/me', method: 'put' },
        { url: '/api/agents/me', method: 'patch' },
        { url: '/api/auth/me', method: 'patch' },
        { url: '/api/users/me', method: 'patch' },
    ];
    let lastErr = null;
    for (const { url, method } of candidates) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const res = await axios({
                url: `${API}${url}`,
                method,
                data: payload,
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            });
            return res.data;
        } catch (e) {
            lastErr = e;
            const s = e?.response?.status;
            if (s === 404 || s === 405) continue;
            throw e;
        }
    }
    throw lastErr || new Error('Mise à jour impossible.');
}

/* ---- Upload avatar : on garde les 3 essais ---- */
export async function uploadAvatar(file) {
    const fd = new FormData();
    fd.append('file', file, file.name);

    const paths = [
        { url: '/api/profile/avatar', method: 'post' },
        { url: '/api/agents/me/avatar', method: 'post' },
        { url: '/api/users/me/avatar', method: 'post' },
    ];

    let lastErr = null;
    for (const { url, method } of paths) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const res = await axios({
                url: `${API}${url}`,
                method,
                data: fd,
                headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
            });
            return res.data?.url || res.data?.avatarUrl || res.data?.photoUrl || null;
        } catch (e) {
            lastErr = e;
            const s = e?.response?.status;
            if (s === 404 || s === 405) continue;
            throw e;
        }
    }
    throw lastErr || new Error("Aucun endpoint d'avatar compatible.");
}

/* ---- Change password (inchangé) ---- */
export async function changePassword({ currentPassword, newPassword }) {
    const attempts = [
        {
            url: '/api/auth/change-password',
            method: 'post',
            body: { currentPassword, newPassword, confirmPassword: newPassword },
        },
        {
            url: '/api/users/me/password',
            method: 'post',
            body: { oldPassword: currentPassword, newPassword },
        },
        {
            url: '/api/users/me/password',
            method: 'put',
            body: { password: newPassword, oldPassword: currentPassword },
        },
    ];
    let lastErr = null;
    for (const a of attempts) {
        try {
            // eslint-disable-next-line no-await-in-loop
            await axios({
                url: `${API}${a.url}`,
                method: a.method,
                data: a.body,
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            });
            return true;
        } catch (e) {
            lastErr = e;
            const s = e?.response?.status;
            if (s === 404 || s === 405) continue;
            throw e;
        }
    }
    throw lastErr || new Error('Endpoint de changement de mot de passe indisponible.');
}
