import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

/* Layout superviseur (menu latéral) */
import DrawerMIC from './components/DrawerMIC';

/* Pages SUPERVISEUR */
import AgentList from './pages/AgentList';
import AgentsWorkload from './pages/AgentsWorkload';
import DossiersListView from './pages/DossiersListView';
import AddAgentForm from './pages/AddAgentForm';
import PowerBIAgentsDetails from './pages/PowerBIAgentsDetails';

/* Pages AGENT */
import DashboardAgent from './pages/DashboardAgent';
import DemandeForm from './components/DemandeForm'; // ✅ bon chemin

/* Auth */
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { getPrimaryRole } from './api/auth'; // ✅ on prend la version correcte

const theme = createTheme({
    palette: { background: { default: '#F6F8FC' } },
});

/* Redirection d’accueil selon rôle */
function HomeRedirect() {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;

    const role = getPrimaryRole();
    if (role === 'SUPERVISEUR') return <Navigate to="/agents" replace />;
    if (role === 'AGENT') return <Navigate to="/dashboard-agent" replace />;
    if (role === 'IMPORTATEUR' || role === 'OPERATEUR')
        return <Navigate to="/dashboard-operateur" replace />;

    return <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />

                    {/* Accueil qui route selon le rôle */}
                    <Route path="/" element={<HomeRedirect />} />

                    {/* ======================== SUPERVISEUR ======================== */}
                    {/* Tout ce bloc est sous le layout DrawerMIC */}
                    <Route
                        element={
                            <ProtectedRoute roles={['SUPERVISEUR']}>
                                <DrawerMIC />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/agents" element={<AgentList />} />
                        <Route path="/agents/workload" element={<AgentsWorkload />} />
                        <Route path="/dossiers" element={<DossiersListView />} />
                        <Route path="/superviseur/ajouter-agent" element={<AddAgentForm />} />
                        <Route path="/pbi/agents-details" element={<PowerBIAgentsDetails />} />
                    </Route>

                    {/* =========================== AGENT =========================== */}
                    <Route
                        path="/dashboard-agent"
                        element={
                            <ProtectedRoute roles={['AGENT']}>
                                <DashboardAgent />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/demande/nouvelle"
                        element={
                            <ProtectedRoute roles={['AGENT']}>
                                <DemandeForm />
                            </ProtectedRoute>
                        }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}
