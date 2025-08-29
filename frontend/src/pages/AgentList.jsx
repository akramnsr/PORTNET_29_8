// src/pages/AgentList.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Box, Container, Paper, Typography, Stack, Button, IconButton, TextField,
    InputAdornment, Chip, Table, TableHead, TableRow, TableCell, TableBody,
    Tooltip, Avatar, Divider, Skeleton, Dialog, DialogTitle, DialogContent,
    DialogActions, Alert, Snackbar, CircularProgress,
} from '@mui/material';
import {
    Search as SearchIcon, Refresh as RefreshIcon, Add as AddIcon,
    CheckCircle as CheckCircleIcon, Block as BlockIcon, Person as PersonIcon,
    Email as EmailIcon, LockOpen as LockOpenIcon, Lock as LockIcon,
    AccessTime as AccessTimeIcon, Bolt as BoltIcon, Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const PORTNET_BLUE = '#0B3D91';
const BTN_BLUE = '#1D4ED8';
const BTN_BLUE_H = '#1E40AF';
const BTN_GREEN = '#16A34A';
const BTN_GREEN_H = '#15803D';
const BTN_RED = '#DC2626';
const BTN_RED_H = '#B91C1C';

function initials(fullName = '') {
    const parts = String(fullName).trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase() ?? '').join('');
}

export default function AgentList() {
    const navigate = useNavigate();

    const [agents, setAgents]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [confirm, setConfirm] = useState({ open: false, agent: null, action: 'toggle' });
    const [snack, setSnack]     = useState({ open: false, severity: 'success', msg: '' });
    const [busyId, setBusyId]   = useState(null);

    const token = localStorage.getItem('token');
    const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

    const loadAgents = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/api/agents`, { headers });
            setAgents(res.data || []);
        } catch {
            setSnack({ open: true, severity: 'error', msg: 'Erreur lors de la récupération des agents' });
            setAgents([]);
        } finally {
            setLoading(false);
        }
    }, [headers]);

    useEffect(() => { loadAgents(); }, [loadAgents]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return agents;
        return agents.filter(a =>
            String(a.nomComplet || '').toLowerCase().includes(q) ||
            String(a.email || '').toLowerCase().includes(q)
        );
    }, [agents, search]);

    const activeCount = agents.filter(a => a.enabled).length;
    const inactiveCount = agents.length - activeCount;

    const openConfirm  = (agent, action) => setConfirm({ open: true, agent, action });
    const closeConfirm = () => setConfirm({ open: false, agent: null, action: 'toggle' });

    const doToggle = async () => {
        const agent = confirm.agent;
        if (!agent) return;
        try {
            setBusyId(agent.id);
            const res = await axios.post(`${API_BASE}/api/agents/${agent.id}/toggle-activation`, {}, { headers });
            const newEnabled = typeof res.data === 'object' && res.data !== null ? !!res.data.enabled : !!res.data;
            setAgents(prev => prev.map(a => (a.id === agent.id ? { ...a, enabled: newEnabled } : a)));
            setSnack({ open: true, severity: 'success', msg: newEnabled ? 'Agent activé avec succès' : 'Agent désactivé avec succès' });
        } catch (e) {
            const status = e?.response?.status;
            setSnack({
                open: true,
                severity: 'error',
                msg: status === 404 ? 'Impossible de changer le statut (compte non encore activé).' : 'Erreur lors du changement de statut',
            });
        } finally {
            setBusyId(null);
            closeConfirm();
        }
    };

    const doDelete = async () => {
        const agent = confirm.agent;
        if (!agent) return;
        try {
            setBusyId(agent.id);
            await axios.delete(`${API_BASE}/api/agents/${agent.id}`, { headers });
            setAgents(prev => prev.filter(a => a.id !== agent.id));
            setSnack({ open: true, severity: 'success', msg: 'Agent supprimé avec succès' });
        } catch {
            setSnack({ open: true, severity: 'error', msg: 'Suppression impossible (vérifiez les droits ou les dépendances).' });
        } finally {
            setBusyId(null);
            closeConfirm();
        }
    };

    return (
        <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#F6F8FC', pb: 6 }}>
            {/* HERO */}
            <Box sx={{
                background: `linear-gradient(140deg, ${PORTNET_BLUE} 0%, #1E5FD6 45%, #4DA9FF 100%)`,
                color: 'white', py: { xs: 3, md: 4 }, mb: 3,
                boxShadow: '0 12px 36px rgba(11,61,145,0.28)',
                borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
            }}>
                <Container maxWidth="lg">
                    <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" gap={2}>
                        <Stack spacing={0.5}>
                            <Typography variant="h4" fontWeight={900} letterSpacing={0.3}>Liste des Agents</Typography>
                            <Typography sx={{ opacity: 0.95 }}>Supervision & contrôle d’accès — recherche, activation, suppression.</Typography>
                            <Stack direction="row" spacing={1.2} mt={1.2}>
                                <Chip icon={<CheckCircleIcon />} label={`${activeCount} actif${activeCount > 1 ? 's' : ''}`}
                                      sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', '& .MuiChip-icon': { color: 'white' }, fontWeight: 700, backdropFilter: 'blur(6px)' }} />
                                <Chip icon={<BlockIcon />} label={`${inactiveCount} inactif${inactiveCount > 1 ? 's' : ''}`}
                                      sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', '& .MuiChip-icon': { color: 'white' }, fontWeight: 700, backdropFilter: 'blur(6px)' }} />
                            </Stack>
                        </Stack>

                        <Stack direction="row" spacing={1.2} alignItems="center">
                            <TextField
                                size="small"
                                placeholder="Rechercher (nom ou email)…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                sx={{
                                    minWidth: 300, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2,
                                    input: { color: 'white' }, '& .MuiInputBase-root': { color: 'white' },
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.35)' }, '&:hover fieldset': { borderColor: 'white' },
                                    backdropFilter: 'blur(8px)',
                                }}
                                InputProps={{
                                    startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: 'white' }} /></InputAdornment>),
                                }}
                            />

                            <Tooltip title="Rafraîchir">
                <span>
                  <IconButton onClick={loadAgents}
                              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' }, backdropFilter: 'blur(6px)' }}>
                    <RefreshIcon />
                  </IconButton>
                </span>
                            </Tooltip>

                            <Button onClick={() => navigate('/superviseur/ajouter-agent')} startIcon={<AddIcon />}
                                    sx={{ px: 2.1, borderRadius: 2, textTransform: 'none', fontWeight: 800, color: 'white', bgcolor: BTN_BLUE,
                                        boxShadow: '0 10px 22px rgba(0,0,0,0.15)', '&:hover': { bgcolor: BTN_BLUE_H, transform: 'translateY(-1px)' }, transition: 'all .2s ease' }}>
                                Nouvel agent
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {/* TABLE */}
            <Container maxWidth="lg">
                <Paper elevation={0}
                       sx={{ overflow: 'hidden', borderRadius: 4, bgcolor: 'rgba(255,255,255,0.98)', border: '1px solid #E8EEF7',
                           backdropFilter: 'blur(10px)', boxShadow: '0 18px 40px rgba(16, 44, 84, 0.08)' }}>
                    <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <BoltIcon sx={{ color: PORTNET_BLUE }} />
                            <Typography fontWeight={900} color={PORTNET_BLUE}>Agents</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            {filtered.length} résultat{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}.
                        </Typography>
                    </Box>
                    <Divider />

                    {loading ? (
                        <Box sx={{ p: 3 }}>
                            {[...Array(5)].map((_, i) => (
                                <Stack key={i} direction="row" spacing={2} alignItems="center" sx={{ py: 1 }}>
                                    <Skeleton variant="circular" width={40} height={40} />
                                    <Skeleton variant="text" width="22%" />
                                    <Skeleton variant="text" width="32%" />
                                    <Skeleton variant="text" width="22%" />
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Skeleton variant="rounded" width={240} height={38} />
                                </Stack>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table sx={{
                                minWidth: 880,
                                '& thead th': { position: 'sticky', top: 0, zIndex: 1, bgcolor: '#F3F7FF', color: PORTNET_BLUE, fontWeight: 900, borderBottom: '1px solid #E6ECF6' },
                                '& tbody tr:hover': { backgroundColor: '#F9FBFF' },
                            }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: 64 }} />
                                        <TableCell>Nom complet</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Dernière connexion</TableCell>
                                        <TableCell>État</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.map((a) => {
                                        const last = a.lastLogin ? new Date(a.lastLogin).toLocaleString('fr-FR') : 'Jamais connecté';
                                        const canToggle = a.enabled !== undefined;
                                        const isEnabled = !!a.enabled;
                                        return (
                                            <TableRow key={a.id} hover>
                                                <TableCell>
                                                    <Avatar sx={{ bgcolor: '#EFF4FF', color: PORTNET_BLUE, fontWeight: 900, width: 40, height: 40, border: '2px solid #fff' }}>
                                                        {initials(a.nomComplet)}
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <PersonIcon sx={{ fontSize: 18, color: '#8FA6CE' }} />
                                                        <Typography fontWeight={800}>{a.nomComplet}</Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <EmailIcon sx={{ fontSize: 18, color: '#8FA6CE' }} />
                                                        <Typography color="text.secondary">{a.email}</Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <AccessTimeIcon sx={{ fontSize: 18, color: '#8FA6CE' }} />
                                                        <Typography color="text.secondary">{last}</Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    {isEnabled ? (
                                                        <Chip size="small" icon={<CheckCircleIcon />} label="Activé"
                                                              sx={{ bgcolor: '#EAF8F0', color: BTN_GREEN_H, '& .MuiChip-icon': { color: BTN_GREEN_H }, fontWeight: 800 }} />
                                                    ) : (
                                                        <Chip size="small" icon={<BlockIcon />} label="Désactivé"
                                                              sx={{ bgcolor: '#FFEEF0', color: BTN_RED_H, '& .MuiChip-icon': { color: BTN_RED_H }, fontWeight: 800 }} />
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title={canToggle ? (isEnabled ? 'Désactiver' : 'Activer') : 'Compte non lié'}>
                            <span>
                              <Button
                                  onClick={() => openConfirm(a, 'toggle')}
                                  disabled={!canToggle || busyId === a.id}
                                  startIcon={busyId === a.id ? <CircularProgress size={16} color="inherit" /> : (isEnabled ? <LockIcon /> : <LockOpenIcon />)}
                                  sx={{
                                      borderRadius: 2, fontWeight: 900, textTransform: 'none', px: 2.1,
                                      ...(isEnabled
                                          ? { color: BTN_RED, bgcolor: '#ffffff', border: `1px solid ${BTN_RED}`, '&:hover': { bgcolor: '#FFF1F2', borderColor: BTN_RED_H, color: BTN_RED_H } }
                                          : { color: '#ffffff', bgcolor: BTN_GREEN, '&:hover': { bgcolor: BTN_GREEN_H } }),
                                  }}
                              >
                                {isEnabled ? 'Désactiver' : 'Activer'}
                              </Button>
                            </span>
                                                    </Tooltip>

                                                    <Tooltip title="Supprimer définitivement">
                            <span>
                              <Button
                                  onClick={() => openConfirm(a, 'delete')}
                                  disabled={busyId === a.id}
                                  startIcon={busyId === a.id ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                                  sx={{
                                      ml: 1.2, borderRadius: 2, fontWeight: 900, textTransform: 'none', px: 2.1,
                                      color: BTN_RED, border: `1px solid ${BTN_RED}`, bgcolor: 'transparent',
                                      '&:hover': { bgcolor: '#FFF1F2', borderColor: BTN_RED_H, color: BTN_RED_H },
                                  }}
                              >
                                Supprimer
                              </Button>
                            </span>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}

                                    {filtered.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                                                    <Typography fontWeight={800}>Aucun agent trouvé</Typography>
                                                    <Typography variant="body2">Ajuste ta recherche ou clique sur “Nouvel agent”.</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </Paper>
            </Container>

            {/* Dialogs & Snackbar */}
            <Dialog open={confirm.open} onClose={closeConfirm}>
                <DialogTitle fontWeight={900}>
                    {confirm.action === 'delete'
                        ? 'Supprimer cet agent ?'
                        : (confirm.agent?.enabled ? 'Désactiver cet agent ?' : 'Activer cet agent ?')}
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Typography>
                        {confirm.action === 'delete'
                            ? "Cette action est irréversible. L'agent et son compte seront supprimés."
                            : (confirm.agent?.enabled
                                ? "L'agent ne pourra plus se connecter tant que vous ne le réactivez pas."
                                : "L'agent pourra se connecter à nouveau.")}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirm}>Annuler</Button>
                    {confirm.action === 'delete' ? (
                        <Button onClick={doDelete} variant="contained" startIcon={<DeleteIcon />}
                                sx={{ fontWeight: 900, textTransform: 'none', borderRadius: 2, color: 'white', bgcolor: BTN_RED, '&:hover': { bgcolor: BTN_RED_H } }}>
                            Supprimer
                        </Button>
                    ) : (
                        <Button onClick={doToggle} variant="contained"
                                startIcon={confirm.agent?.enabled ? <LockIcon /> : <LockOpenIcon />}
                                sx={{ fontWeight: 900, textTransform: 'none', borderRadius: 2, color: 'white',
                                    bgcolor: confirm.agent?.enabled ? BTN_RED : BTN_GREEN,
                                    '&:hover': { bgcolor: confirm.agent?.enabled ? BTN_RED_H : BTN_GREEN_H } }}>
                            Confirmer
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={3600} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity} variant="filled" sx={{ fontWeight: 800 }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
