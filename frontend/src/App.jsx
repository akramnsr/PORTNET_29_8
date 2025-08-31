import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import DrawerSupervisor from './components/DrawerSupervisor';
import DrawerAgent from './components/DrawerAgent';

/* SUPERVISEUR */
import AgentList from './pages/AgentList';
import AgentsWorkload from './pages/AgentsWorkload';
import DossiersListView from './pages/DossiersListView';
import AddAgentForm from './pages/AddAgentForm';
import PowerBIAgentsDetails from './pages/PowerBIAgentsDetails';

/* AGENT */
import AgentDossiersPage from './pages/AgentDossiersPage';
import AgentProfilePage from './pages/AgentProfilePage';
import AgentTasksPage from './pages/AgentTasksPage';
import DemandeForm from './components/DemandeForm';

/* Auth */
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { getPrimaryRole } from './api/auth';

const theme = createTheme({ palette: { background: { default: '#F6F8FC' } } });

function HomeRedirect() {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    const role = (getPrimaryRole() || '').toUpperCase();
    if (role === 'SUPERVISEUR') return <Navigate to="/agents" replace />;
    if (role === 'AGENT')       return <Navigate to="/agent/dossiers" replace />;
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
                    <Route path="/" element={<HomeRedirect />} />

                    {/* SUPERVISEUR */}
                    <Route element={
                        <ProtectedRoute roles={['SUPERVISEUR']}>
                            <DrawerSupervisor />
                        </ProtectedRoute>
                    }>
                        <Route path="/agents" element={<AgentList />} />
                        <Route path="/agents/workload" element={<AgentsWorkload />} />
                        <Route path="/dossiers" element={<DossiersListView />} />
                        <Route path="/superviseur/ajouter-agent" element={<AddAgentForm />} />
                        <Route path="/pbi/agents-details" element={<PowerBIAgentsDetails />} />
                    </Route>

                    {/* AGENT */}
                    <Route element={
                        <ProtectedRoute roles={['AGENT']}>
                            <DrawerAgent />
                        </ProtectedRoute>
                    }>
                        <Route path="/agent/dossiers" element={<AgentDossiersPage />} />
                        <Route path="/agent/taches" element={<AgentTasksPage />} />
                        <Route path="/agent/demande/nouvelle" element={<DemandeForm />} />
                        <Route path="/agent/profil" element={<AgentProfilePage />} />
                        <Route path="/demande/nouvelle" element={<Navigate to="/agent/demande/nouvelle" replace />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}
