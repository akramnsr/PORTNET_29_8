import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getPrimaryRole } from '../api/auth';

const DEFAULT_HOME = {
    SUPERVISEUR: '/agents',
    AGENT: '/agent/dossiers',           // ✅ corrigé
    IMPORTATEUR: '/dashboard-operateur',
    OPERATEUR: '/dashboard-operateur',
};

export default function ProtectedRoute({ roles, children }) {
    const location = useLocation();
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

    if (!roles || roles.length === 0) return children;

    const role = (getPrimaryRole() || '').toUpperCase();
    if (roles.includes(role)) return children;

    const home = DEFAULT_HOME[role] || '/';
    return <Navigate to={home} replace />;
}
