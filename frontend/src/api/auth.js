// src/api/auth.js
const API = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

export function parseJwt(token) {
    try {
        const [, payload] = String(token).split('.');
        return JSON.parse(atob(payload));
    } catch {
        return {};
    }
}

export function normalizeRole(r) {
    return String(r || '').toUpperCase().replace(/^ROLE_/, '');
}

export function rolesFromPayload(payload = {}) {
    const raw =
        payload.roles ??
        payload.authorities ??
        payload.scope ??
        payload.scopes ??
        [];
    const arr = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(/[,\s]+/) : [];
    const norm = arr.map(normalizeRole).filter(Boolean);
    // supprime doublons, garde l'ordre
    return Array.from(new Set(norm));
}

/**
 * Renvoie le rôle primaire (normalisé) en priorité depuis localStorage,
 * sinon le déduit du token JWT, et le mémorise dans localStorage.
 */
export function getPrimaryRole() {
    let stored = localStorage.getItem('role');
    if (stored) return normalizeRole(stored);

    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = parseJwt(token);
    const roles = rolesFromPayload(payload);

    // Heuristique: privilégie SUPERVISEUR/AGENT s’ils existent
    let role = roles.includes('SUPERVISEUR')
        ? 'SUPERVISEUR'
        : roles.includes('AGENT')
            ? 'AGENT'
            : roles[0] || '';

    if (role) localStorage.setItem('role', role);
    return role;
}

export async function getCurrentUser(token) {
    const t = token || localStorage.getItem('token');
    if (!t) throw new Error('Non authentifié');
    const headers = { Authorization: `Bearer ${t}` };

    // essaie /api/auth/me puis /api/users/me
    const paths = ['/api/auth/me', '/api/users/me'];
    let lastErr = null;
    for (const p of paths) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const res = await fetch(`${API}${p}`, { headers });
            if (res.ok) return await res.json();
            lastErr = new Error(`GET ${p} → ${res.status}`);
        } catch (e) {
            lastErr = e;
        }
    }
    throw lastErr || new Error('Impossible de charger le profil.');
}

// Optionnel: API login si tu veux l’utiliser ailleurs
export async function login(email, password) {
    const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Identifiants invalides');
    return res.json();
}
