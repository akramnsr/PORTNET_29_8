// src/pages/DossiersListView.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Box, Container, Paper, Typography, Stack, Button, IconButton, TextField,
    InputAdornment, Chip, Divider, Tooltip, Dialog, DialogTitle, DialogContent,
    DialogActions, CircularProgress, MenuItem, Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    CloudDownload as CloudDownloadIcon,
    AssignmentTurnedIn as AssignmentTurnedInIcon,
    SwapHoriz as SwapHorizIcon,
    Close as CloseIcon,
    Bolt as BoltIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const PORTNET_BLUE = '#0B3D91';
const BTN_BLUE     = '#1D4ED8';
const BTN_BLUE_H   = '#1E40AF';
const BTN_GREEN    = '#16A34A';
const BTN_GREEN_H  = '#15803D';

const STATUTS = ['EN_ATTENTE','EN_COURS','VALIDE','REJETE','ARCHIVE'];

const statutColor = (s) => ({
    EN_ATTENTE: 'default',
    EN_COURS  : 'info',
    VALIDE    : 'success',
    REJETE    : 'error',
    ARCHIVE   : 'warning',
}[s] || 'default');

function fmtDate(dt) { if (!dt) return '—'; try { return new Date(dt).toLocaleString('fr-FR'); } catch { return '—'; } }
function slaChipProps(remainingH) {
    const n = Number.isFinite(+remainingH) ? +remainingH : 0;
    if (n > 8) return { color: 'success', label: `${n}h restant` };
    if (n > 0) return { color: 'warning', label: `${n}h restant` };
    return { color: 'error', label: 'SLA dépassé' };
}

/* Axios + auth header */
const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

/* Fetch dossiers (DB) */
async function fetchDossiers(params = {}) {
    const { data } = await api.get('/api/demandes', { params });
    const arr = Array.isArray(data) ? data : (data?.content ?? data?.items ?? []);

    return arr.map((d) => {
        const idDb   = d.idDb ?? d.id_db ?? d.id;
        const numero = d.numero_enregistrement ?? d.numeroEnregistrement ?? d.numero ?? d.reference ?? d.id;
        const id     = String(numero ?? idDb);

        const bureau =
            (typeof d.bureau === 'string' && d.bureau.trim() !== '' ? d.bureau : '') ||
            d.bureauDouanier?.description || d.bureauDouanier?.code ||
            d.bureau?.nom || (d.bureau_douanier_id ? `Bureau #${d.bureau_douanier_id}` : '') || '—';

        const createdAt = d.createdAt ?? d.created_at ?? d.date_creation ?? d.dateCreation ?? null;

        const agent =
            d.agent?.nomComplet ?? d.agent?.fullName ?? d.derniereAffectation?.agentNom ?? d.agent ?? '-';

        const operateur =
            d.operateur ||
            d.importateur?.raison_sociale ||
            d.importateur?.raisonSociale ||
            d.importateur?.societe ||
            d.importateur?.nomComplet ||
            '—';

        const ice = d.ice || d.importateur?.ice || '—';

        const statut =
            d.statut === 'ACCEPTEE' ? 'VALIDE'
                : d.statut === 'REFUSEE' ? 'REJETE'
                    : (d.statut || 'EN_ATTENTE');

        const montant = Number(d.montant ?? d.totalMontant ?? d.montantTotal ?? 0);
        const slaHours = Number.isFinite(+d.slaHours) ? +d.slaHours : 72;

        return {
            id, idDb,
            categorie: d.categorie || '—',
            bureau,
            statut,
            createdAt,
            slaHours,
            agent,
            ice,
            operateur,
            montant,
        };
    });
}

export default function DossiersListView() {
    const [search, setSearch] = useState('');
    const [statut, setStatut] = useState('');
    const [bureau, setBureau] = useState('');

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [errorDetail, setErrorDetail] = useState(null);

    const [selection, setSelection] = useState([]);
    const [preview, setPreview] = useState(null);
    const [bulkMode, setBulkMode] = useState(null);
    const [bulkValue, setBulkValue] = useState('');

    const loadDossiers = useCallback(async (p = {}) => {
        try {
            setLoading(true);

            // ✅ No mix of ?? and || — compute values explicitly
            const q  = (p.q ?? search)   || undefined;
            const st = (p.statut ?? statut) || undefined;
            const br = (p.bureau ?? bureau) || undefined;

            const now = new Date();
            const data = await fetchDossiers({ q, statut: st, bureau: br });

            const withMeta = data.map(d => {
                const created = d.createdAt ? new Date(d.createdAt) : now;
                const ageHours      = Math.max(0, Math.round((now - created) / 36e5));
                const slaRemainingH = Math.max(0, Math.round((d.slaHours ?? 0) - ageHours));
                return { ...d, ageHours, slaRemainingH };
            });

            setRows(withMeta);
            setError('');
            setErrorDetail(null);
        } catch (e) {
            setRows([]);
            setError(e?.message || 'Erreur de chargement');
            setErrorDetail({ status: e?.response?.status, payload: e?.response?.data });
            console.error('[Dossiers] fetch KO', e);
        } finally {
            setLoading(false);
        }
    }, [search, statut, bureau]);

    useEffect(() => { loadDossiers(); }, [loadDossiers]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rows.filter(r => {
            const hay = `${r.id} ${r.ice} ${r.operateur} ${r.agent} ${r.categorie} ${r.bureau}`.toLowerCase();
            if (q && !hay.includes(q)) return false;
            if (statut && r.statut !== statut) return false;
            if (bureau && r.bureau !== bureau) return false;
            return true;
        });
    }, [rows, search, statut, bureau]);

    const bureauOptions = useMemo(() => {
        const set = new Set();
        rows.forEach(r => { if (r.bureau && r.bureau !== '—') set.add(r.bureau); });
        return Array.from(set);
    }, [rows]);

    const totalCount   = rows.length;
    const attenteCount = rows.filter(r => r.statut === 'EN_ATTENTE').length;
    const encoursCount = rows.filter(r => r.statut === 'EN_COURS').length;
    const valideCount  = rows.filter(r => r.statut === 'VALIDE').length;
    const rejeteCount  = rows.filter(r => r.statut === 'REJETE').length;

    const columns = useMemo(() => [
        { field: 'id', headerName: 'N° Dossier', minWidth: 160, flex: 1 },
        { field: 'categorie', headerName: 'Catégorie', width: 130, renderCell: (p) => <>{p?.value || '—'}</> },
        { field: 'bureau', headerName: 'Bureau', width: 180, renderCell: (p) => <>{p?.value || '—'}</> },
        {
            field: 'statut', headerName: 'Statut', width: 140,
            renderCell: (params) => <Chip size="small" variant="filled" color={statutColor(params?.value)} label={params?.value || '—'} />,
            sortable: true,
        },
        { field: 'createdAt', headerName: 'Créé le', width: 170, valueFormatter: (p) => fmtDate(p?.value) },
        { field: 'agent', headerName: 'Agent', width: 160, renderCell: (p) => <>{p?.value || '-'}</> },
        { field: 'operateur', headerName: 'Opérateur', minWidth: 160, flex: 1, renderCell: (p) => <>{p?.value || '—'}</> },
        { field: 'ice', headerName: 'ICE', width: 140, renderCell: (p) => <>{p?.value || '—'}</> },
        {
            field: 'montant', headerName: 'Montant', width: 130, type: 'number',
            valueFormatter: (p) => `${Number(p?.value ?? 0).toLocaleString('fr-FR')} MAD`
        },
        { field: 'ageHours', headerName: 'Âge (h)', width: 110, type: 'number' },
        {
            field: 'slaRemainingH', headerName: 'SLA', width: 160,
            renderCell: (p) => {
                const props = slaChipProps(p?.value);
                return <Chip size="small" color={props.color} label={props.label} />;
            }
        },
    ], []);

    const onBulkExport = () => {
        const rowsToExport = filtered.filter(r => selection.includes(r.idDb ?? r.id));
        exportToCSV(`dossiers_${new Date().toISOString().slice(0,10)}.csv`, rowsToExport);
    };
    const exportFiltered = () => exportToCSV(`dossiers_filtrés_${new Date().toISOString().slice(0,10)}.csv`, filtered);

    function exportToCSV(filename, rows) {
        const headers = ['id','categorie','bureau','statut','createdAt','slaHours','agent','ice','operateur','montant','ageHours','slaRemainingH'];
        const lines = [headers.join(',')];
        rows.forEach(r => {
            const safe = headers.map(h => {
                const v = r[h] ?? '';
                const s = String(v).replaceAll('"', '""');
                return /[",\n]/.test(s) ? `"${s}"` : s;
            });
            lines.push(safe.join(','));
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    }

    const commitBulk = () => {
        if (bulkMode === 'statut') {
            setRows(prev => prev.map(r => (selection.includes(r.idDb ?? r.id) ? { ...r, statut: bulkValue } : r)));
        } else if (bulkMode === 'assign') {
            setRows(prev => prev.map(r => (selection.includes(r.idDb ?? r.id) ? { ...r, agent: bulkValue } : r)));
        }
        setBulkMode(null); setBulkValue(''); setSelection([]);
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
                            <Typography variant="h4" fontWeight={900} letterSpacing={0.3}>Liste des Dossiers</Typography>
                            <Typography sx={{ opacity: 0.95 }}>
                                Supervision & opérations de masse — recherche, export, assignation, changement de statut.
                            </Typography>
                            <Stack direction="row" spacing={1.2} mt={1.2}>
                                <Chip icon={<BoltIcon />} label={`${totalCount} au total`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', '& .MuiChip-icon': { color: 'white' }, fontWeight: 700, backdropFilter: 'blur(6px)' }} />
                                <Chip label={`${attenteCount} en attente`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 700, backdropFilter: 'blur(6px)' }} />
                                <Chip label={`${encoursCount} en cours`}  sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 700, backdropFilter: 'blur(6px)' }} />
                                <Chip label={`${valideCount} validé${valideCount>1?'s':''}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 700, backdropFilter: 'blur(6px)' }} />
                                <Chip label={`${rejeteCount} rejeté${rejeteCount>1?'s':''}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 700, backdropFilter: 'blur(6px)' }} />
                            </Stack>
                        </Stack>

                        <Stack direction="row" spacing={1.2} alignItems="center">
                            <TextField
                                size="small"
                                placeholder="Rechercher (N° dossier, ICE, opérateur, agent, bureau)…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                sx={{
                                    minWidth: 360, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2,
                                    input: { color: 'white' }, '& .MuiInputBase-root': { color: 'white' },
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.35)' }, '&:hover fieldset': { borderColor: 'white' },
                                    backdropFilter: 'blur(8px)',
                                }}
                                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: 'white' }} /></InputAdornment>) }}
                            />

                            <Tooltip title="Rafraîchir">
                <span>
                  <IconButton
                      onClick={() => loadDossiers()}
                      sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' }, backdropFilter: 'blur(6px)' }}>
                    <RefreshIcon />
                  </IconButton>
                </span>
                            </Tooltip>

                            <Button onClick={exportFiltered} startIcon={<CloudDownloadIcon />}
                                    sx={{ px: 2.1, borderRadius: 2, textTransform: 'none', fontWeight: 800, color: 'white', bgcolor: BTN_BLUE,
                                        boxShadow: '0 10px 22px rgba(0,0,0,0.15)', '&:hover': { bgcolor: BTN_BLUE_H, transform: 'translateY(-1px)' }, transition: 'all .2s ease' }}>
                                Exporter
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {/* CARD TABLEAU */}
            <Container maxWidth="lg">
                <Paper elevation={0} sx={{
                    overflow: 'hidden', borderRadius: 4, bgcolor: 'rgba(255,255,255,0.98)',
                    border: '1px solid #E8EEF7', backdropFilter: 'blur(10px)',
                    boxShadow: '0 18px 40px rgba(16, 44, 84, 0.08)',
                }}>
                    {/* En-tête + filtres */}
                    <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <BoltIcon sx={{ color: PORTNET_BLUE }} />
                            <Typography fontWeight={900} color={PORTNET_BLUE}>Dossiers</Typography>
                        </Stack>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ xs: 'flex-start', md: 'center' }} mt={1}>
                            <Typography variant="body2" color="text.secondary">
                                {filtered.length} résultat{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}.
                            </Typography>

                            <Box sx={{ flexGrow: 1 }} />

                            <TextField size="small" select label="Statut" value={statut} onChange={(e) => setStatut(e.target.value)} sx={{ minWidth: 180 }}>
                                <MenuItem value="">(Tous)</MenuItem>
                                {STATUTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </TextField>

                            <TextField size="small" select label="Bureau" value={bureau} onChange={(e) => setBureau(e.target.value)} sx={{ minWidth: 180 }}>
                                <MenuItem value="">(Tous)</MenuItem>
                                {bureauOptions.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                            </TextField>
                        </Stack>
                    </Box>
                    <Divider />

                    {/* Toolbar sélection */}
                    {selection.length > 0 && (
                        <>
                            <Box sx={{ px: 3, py: 1.25, bgcolor: '#fff7e6', borderTop: '1px solid #ffe0b2', borderBottom: '1px solid #ffe0b2' }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" fontWeight={700}>{selection.length} sélectionné(s)</Typography>
                                    <Button size="small" startIcon={<AssignmentTurnedInIcon />} onClick={() => { setBulkMode('statut'); setBulkValue('EN_COURS'); }}>Changer statut</Button>
                                    <Button size="small" startIcon={<SwapHorizIcon />} onClick={() => { setBulkMode('assign'); setBulkValue(''); }}>Réassigner</Button>
                                    <Button size="small" startIcon={<CloudDownloadIcon />} onClick={onBulkExport}>Exporter la sélection</Button>
                                </Stack>
                            </Box>
                            <Divider />
                        </>
                    )}

                    {/* DataGrid */}
                    <Box sx={{ p: 2, pt: 0 }}>
                        <Box sx={{ height: 'calc(100vh - 310px)', minHeight: 420, width: '100%' }}>
                            <DataGrid
                                density="compact"
                                getRowId={(row) => row.idDb ?? row.id}
                                rows={filtered}
                                columns={columns}
                                checkboxSelection
                                disableRowSelectionOnClick
                                onRowClick={(params) => setPreview(params.row)}
                                loading={loading}
                                rowSelectionModel={selection}
                                onRowSelectionModelChange={(m) => setSelection(m)}
                                pageSizeOptions={[10, 25, 50]}
                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                sx={{
                                    border: '1px solid #E6ECF6',
                                    borderRadius: 2,
                                    '& .MuiDataGrid-columnHeaders': {
                                        bgcolor: '#F3F7FF',
                                        color: PORTNET_BLUE,
                                        fontWeight: 900,
                                        borderBottom: '1px solid #E6ECF6',
                                    },
                                    '& .MuiDataGrid-row:hover': { backgroundColor: '#F9FBFF' },
                                }}
                            />
                        </Box>

                        {error && (
                            <Box sx={{ p: 2 }}>
                                <Alert severity="error" sx={{ borderRadius: 2 }}>
                                    <Typography fontWeight={800}>Erreur de chargement</Typography>
                                    <Typography variant="body2">{String(error)}</Typography>
                                    {errorDetail && (
                                        <Typography variant="caption" sx={{ display: 'block', mt: .5 }}>
                                            Status: <b>{errorDetail.status ?? 'n/a'}</b><br/>
                                            Payload: <code>{typeof errorDetail.payload === 'string' ? errorDetail.payload : JSON.stringify(errorDetail.payload)}</code>
                                        </Typography>
                                    )}
                                </Alert>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Container>

            {/* PREVIEW */}
            <Dialog open={!!preview} onClose={() => setPreview(null)} fullWidth maxWidth="sm"
                    PaperProps={{ sx: { mr: { sm: 2 }, ml: 'auto', width: { sm: 480 }, borderRadius: 3 } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={900}>Dossier {preview?.id}</Typography>
                    <IconButton onClick={() => setPreview(null)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {preview ? (
                        <Stack spacing={1.25}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip size="small" color={statutColor(preview.statut)} label={preview.statut || '—'} />
                                <Chip size="small" {...slaChipProps(preview.slaRemainingH)} />
                            </Stack>
                            <Typography variant="body2"><b>Catégorie:</b> {preview.categorie || '—'}</Typography>
                            <Typography variant="body2"><b>Bureau:</b> {preview.bureau || '—'}</Typography>
                            <Typography variant="body2"><b>Créé le:</b> {fmtDate(preview.createdAt)} ({preview.ageHours}h)</Typography>
                            <Typography variant="body2"><b>Agent:</b> {preview.agent || '-'}</Typography>
                            <Typography variant="body2"><b>Opérateur:</b> {preview.operateur || '—'}{preview.ice && preview.ice !== '—' ? ` (ICE ${preview.ice})` : ''}</Typography>
                            <Typography variant="body2"><b>Montant:</b> {Number(preview.montant ?? 0).toLocaleString('fr-FR')} MAD</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" fontWeight={900}>Pièces jointes</Typography>
                            <Typography variant="body2" color="text.secondary">— (À brancher à votre API)</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" fontWeight={900}>Historique</Typography>
                            <Typography variant="body2" color="text.secondary">— (Timeline à venir)</Typography>
                        </Stack>
                    ) : (
                        <Box sx={{ py: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" startIcon={<AssignmentTurnedInIcon />}
                            onClick={() => { setBulkMode('statut'); setBulkValue(preview?.statut || 'EN_COURS'); setSelection(preview ? [preview.idDb ?? preview.id] : []); }}
                            sx={{ fontWeight: 900, textTransform: 'none', borderRadius: 2, bgcolor: BTN_BLUE, '&:hover': { bgcolor: BTN_BLUE_H } }}>
                        Changer statut
                    </Button>
                    <Button variant="outlined" startIcon={<SwapHorizIcon />}
                            onClick={() => { setBulkMode('assign'); setSelection(preview ? [preview.idDb ?? preview.id] : []); }}
                            sx={{ fontWeight: 900, textTransform: 'none', borderRadius: 2 }}>
                        Réassigner
                    </Button>
                </DialogActions>
            </Dialog>

            {/* BULK modal (local) */}
            <Dialog open={!!bulkMode} onClose={() => setBulkMode(null)} fullWidth maxWidth="sm">
                <DialogTitle fontWeight={900}>
                    {bulkMode === 'statut' ? 'Changer le statut (sélection)' : 'Réassigner à un agent (sélection)'}
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    {bulkMode === 'statut' ? (
                        <TextField fullWidth select label="Nouveau statut" value={bulkValue} onChange={e => setBulkValue(e.target.value)}>
                            {STATUTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                    ) : (
                        <TextField fullWidth label="Agent" placeholder="Ex: S. Amine" value={bulkValue} onChange={e => setBulkValue(e.target.value)} />
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {selection.length} dossier(s) seront mis à jour.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBulkMode(null)}>Annuler</Button>
                    <Button variant="contained" onClick={commitBulk}
                            sx={{ fontWeight: 900, textTransform: 'none', borderRadius: 2, color: 'white', bgcolor: BTN_GREEN, '&:hover': { bgcolor: BTN_GREEN_H } }}>
                        Confirmer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
