// src/components/AgentTasks.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080';

export default function AgentTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fetchingNext, setFetchingNext] = useState(false);

    const token = localStorage.getItem('token');

    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            if (!token) {
                setError('Session expirée. Veuillez vous reconnecter.');
                setTasks([]);
                return;
            }
            const res = await axios.get(`${API_BASE}/api/tasks/my`, authHeaders);
            const data = Array.isArray(res.data) ? res.data : (res.data?.content ?? res.data ?? []);
            setTasks(data || []);
        } catch (e) {
            console.error(e);
            const msg = e.response?.data?.error || e.response?.data || e.message || 'Erreur lors du chargement des tâches';
            setError(String(msg));
        } finally {
            setLoading(false);
        }
    }, [authHeaders, token]);

    const fetchNextTask = useCallback(async () => {
        setFetchingNext(true);
        setError('');
        try {
            if (!token) {
                setError('Session expirée. Veuillez vous reconnecter.');
                return;
            }
            const res = await axios.post(`${API_BASE}/api/tasks/next`, {}, authHeaders);
            if (res.status === 204 || !res.data) {
                alert('Aucune nouvelle tâche disponible');
                return;
            }
            setTasks((prev) => [res.data, ...prev.filter(t => (t.id ?? t.assignmentId) !== (res.data.id ?? res.data.assignmentId))]);
        } catch (e) {
            console.error(e);
            const msg = e.response?.data?.error || e.response?.data || e.message || 'Impossible de récupérer la prochaine tâche';
            setError(String(msg));
        } finally {
            setFetchingNext(false);
        }
    }, [authHeaders, token]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12 }}>
                <h2 style={{ margin: 0 }}>Mes tâches</h2>
                <div style={{ display:'flex', gap: 8 }}>
                    <button onClick={fetchTasks} disabled={loading} style={{ padding:'8px 12px', cursor: loading ? 'not-allowed' : 'pointer' }} title="Actualiser la liste">
                        {loading ? 'Actualisation…' : 'Actualiser'}
                    </button>
                    <button onClick={fetchNextTask} disabled={fetchingNext} style={{ padding:'8px 12px', cursor: fetchingNext ? 'not-allowed' : 'pointer' }} title="Demander la prochaine tâche">
                        {fetchingNext ? 'Recherche…' : 'Me donner la prochaine tâche'}
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ marginTop: 12, padding: 10, background: '#fde2e1', color: '#b42318', borderRadius: 6 }}>{error}</div>
            )}

            {loading && !tasks.length ? (
                <p style={{ marginTop: 16 }}>Chargement…</p>
            ) : tasks.length === 0 ? (
                <p style={{ marginTop: 16 }}>Aucune tâche en attente pour le moment.</p>
            ) : (
                <ul style={{ marginTop: 16, paddingLeft: 18 }}>
                    {tasks.map((t) => {
                        const id = t.id ?? t.assignmentId ?? t.taskId ?? `${t.demande?.id ?? 'x'}-${t.status ?? 'unknown'}`;
                        const demande = t.demande || t.request || t.ticket || {};
                        const numero = demande.numeroEnregistrement ?? demande.numero ?? demande.reference ?? demande.id ?? '—';
                        const statut = t.status ?? t.assignmentStatus ?? 'ASSIGNED';
                        return (
                            <li key={id} style={{ marginBottom: 8 }}>
                                Demande <strong>{numero}</strong> — statut affectation : <em>{statut}</em>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
