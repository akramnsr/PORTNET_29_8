import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getPrimaryRole } from '../api/auth'; // ✅ source correcte

// Home par défaut selon rôle
const DEFAULT_HOME = {
    SUPERVISEUR: '/agents',
    AGENT: '/dashboard-agent',
    IMPORTATEUR: '/dashboard-operateur',
    OPERATEUR: '/dashboard-operateur',
};

export default function ProtectedRoute({ roles, children }) {
    const location = useLocation();
    const token = localStorage.getItem('token');

    // Pas connecté → login
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Pas de contrainte de rôle → OK
    if (!roles || roles.length === 0) return children;

    // Vérif rôle
    const role = getPrimaryRole(); // retourne SUPERVISEUR | AGENT | …
    if (roles.includes(role)) return children;

    // Rôle non autorisé → renvoyer vers sa home
    const home = DEFAULT_HOME[role] || '/login';
    return <Navigate to={home} replace />;
}
