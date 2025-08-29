// src/api/auth.js
import axios from 'axios';

// Base API (variable d'env prioritaire)
const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Instance dédiée auth
const authAPI = axios.create({
    baseURL: `${BASE}/api/auth`,
    headers: { 'Content-Type': 'application/json' },
});

/* =======================
   Helpers token & rôles
   ======================= */
export function getAuthToken() {
    return localStorage.getItem('token') || '';
}

export function setAuthToken(token) {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
}

export function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
}

/** Décoder un JWT sans dépendance externe */
export function parseJwt(tkn) {
    try {
        const base64Url = tkn.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return {};
    }
}

/** Retourne un tableau de rôles (ex: ["ROLE_SUPERVISEUR", "ROLE_AGENT"]) depuis le token (ou le storage) */
export function getRolesFromToken(tokenOpt) {
    const t = tokenOpt || getAuthToken();
    if (!t) return [];
    const p = parseJwt(t);
    const raw = p.roles || p.authorities || p.scopes || p.scope || [];
    if (Array.isArray(raw)) return raw.map(String);
    if (typeof raw === 'string') return raw.split(/[,\s]+/).filter(Boolean);
    return [];
}

/** Rôle principal normalisé (SUPERVISEUR | AGENT | IMPORTATEUR | OPERATEUR | '') */
export function getPrimaryRole() {
    const stored = (localStorage.getItem('role') || '').toUpperCase();
    if (stored) return stored;

    const roles = getRolesFromToken().map(r => r.toUpperCase().replace(/^ROLE_/, ''));
    if (roles.includes('SUPERVISEUR')) return 'SUPERVISEUR';
    if (roles.includes('AGENT')) return 'AGENT';
    if (roles.includes('IMPORTATEUR')) return 'IMPORTATEUR';
    if (roles.includes('OPERATEUR')) return 'OPERATEUR';
    return '';
}

// attacher le token automatiquement sur cette instance si présent
authAPI.interceptors.request.use((config) => {
    const tk = getAuthToken();
    if (tk) config.headers.Authorization = `Bearer ${tk}`;
    return config;
});

/* =======================
   Endpoints
   ======================= */
export async function login(email, password) {
    try {
        const { data } = await authAPI.post('/login', { email, password });
        // attend un champ 'token' renvoyé par le backend
        if (data?.token) setAuthToken(data.token);
        return data;
    } catch (err) {
        const msg = err?.response?.data?.message || err?.response?.data?.error || err.message;
        throw new Error(msg);
    }
}

/** Tente /me puis /whoami selon ton backend */
export async function getCurrentUser() {
    try {
        const { data } = await authAPI.get('/me');
        return data;
    } catch (e1) {
        try {
            const { data } = await authAPI.get('/whoami');
            return data;
        } catch (e2) {
            const msg = e2?.response?.data?.message || e2?.response?.data?.error || e2.message;
            throw new Error(msg);
        }
    }
}
