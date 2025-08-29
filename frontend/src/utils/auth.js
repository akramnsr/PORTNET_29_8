// src/utils/auth.js
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/* =========================
 * APPELS AUTH (API)
 * ========================= */
export async function login(email, password) {
    const response = await axios.post(`${API}/api/auth/login`, { email, password });

    // nom possible du token selon ton backend (token / jwt / access_token)
    const token =
        response.data?.token || response.data?.jwt || response.data?.access_token;

    if (token) {
        localStorage.setItem('token', token);
    }

    // le backend renvoie déjà "role": "SUPERVISEUR" | "AGENT" | "IMPORTATEUR"
    const roleFromApi = (response.data?.role || '').toUpperCase();
    if (roleFromApi) {
        localStorage.setItem('role', roleFromApi);
    }

    return response.data;
}

export async function getCurrentUser(token = localStorage.getItem('token')) {
    try {
        const response = await axios.get(`${API}/api/auth/whoami`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return response.data;
    } catch (error) {
        const message = error.response?.data || error.message;
        throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
}

/* =========================
 * UTILITAIRES JWT / ROLES
 * ========================= */
export function getToken() {
    return localStorage.getItem('token') || '';
}

export function parseJwt(token) {
    try {
        const [, payload] = token.split('.');
        return JSON.parse(atob(payload));
    } catch {
        return {};
    }
}

/** Rôle stocké, sinon déduit du JWT (authorities / roles / realm_access.roles) */
export function getRole() {
    const stored = localStorage.getItem('role');
    if (stored) return stored.toUpperCase();

    const claims = parseJwt(getToken());
    const raw =
        claims?.authorities ||
        claims?.roles ||
        claims?.realm_access?.roles ||
        [];

    const toName = (v) => String(v).replace(/^ROLE_/i, '').toUpperCase();
    const arr = Array.isArray(raw) ? raw.map(toName) : [toName(raw)];
    const found = arr.find((r) => ['SUPERVISEUR', 'AGENT', 'IMPORTATEUR'].includes(r));
    return (found || '').toUpperCase();
}

/** Tous les rôles “normalisés” (ex: ["SUPERVISEUR", ...]) */
export function getRoles() {
    const role = getRole();
    const claims = parseJwt(getToken());
    const auth = claims?.authorities || claims?.roles || [];
    const list = Array.isArray(auth) ? auth : [auth].filter(Boolean);
    const normalized = list.map((x) => String(x).replace(/^ROLE_/i, '').toUpperCase());
    return [...new Set([role, ...normalized].filter(Boolean))];
}

export function hasRole(role) {
    return getRoles().includes(String(role).toUpperCase());
}

export function hasAnyRole(roles = []) {
    const set = new Set(getRoles()); // ex "SUPERVISEUR"
    // tolère aussi les comparaisons "ROLE_*"
    const withPrefix = new Set([...set, ...[...set].map((r) => `ROLE_${r}`)]);
    return roles.some((r) => withPrefix.has(String(r).toUpperCase()));
}

export const isLoggedIn = () => !!getToken();
