import React, { useEffect, useMemo, useState } from 'react';
import {
    Box, Paper, Button, Table, TableHead, TableBody, TableRow, TableCell, Chip,
    Stack, Typography, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import AgentFiltersBar from '../components/AgentFiltersBar';
import { listMyAssignedDossiers } from '../api/agentDossiers';
import AgentHero from '../components/AgentHero';

const BRAND = '#0B3D91';

const statusColor = (s) => {
    const v = String(s || '').toUpperCase();
    if (v.includes('DONE') || v.includes('TERMIN')) return 'success';
    if (v.includes('REJ')  || v.includes('REFUS'))  return 'error';
    if (v.includes('PEND') || v.includes('ATT'))    return 'warning';
    return 'default';
};

export default function AgentDossiersPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const [filters, setFilters] = useState({ q: '', bureau: '', categorie: '', from: '', to: '' });

    const load = async () => {
        try {
            setLoading(true);
            setErr('');
            const data = await listMyAssignedDossiers({
                q: filters.q || undefined,
                bureau: filters.bureau || undefined,
                categorie: filters.categorie || undefined,
                from: filters.from || undefined,
                to: filters.to || undefined,
            });
            setRows(Array.isArray(data) ? data : []);
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || 'Erreur de chargement';
            setErr(String(msg));
            setRows([]);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []); // eslint-disable-line

    const bureauOptions    = useMemo(() => Array.from(new Set(rows.map(r => r.bureau).filter(Boolean))), [rows]);
    const categorieOptions = useMemo(() => Array.from(new Set(rows.map(r => r.categorie).filter(Boolean))), [rows]);

    const filtered = useMemo(() => {
        const term = (filters.q || '').trim().toLowerCase();
        return rows.filter(r => {
            const okQ    = !term || [r.numero, r.type, r.statut, r.resume].filter(Boolean).some(v => String(v).toLowerCase().includes(term));
            const okB    = !filters.bureau    || r.bureau === filters.bureau;
            const okC    = !filters.categorie || r.categorie === filters.categorie;
            const okFrom = !filters.from      || (r.date && new Date(r.date) >= new Date(filters.from));
            const okTo   = !filters.to        || (r.date && new Date(r.date) <= new Date(filters.to + 'T23:59:59'));
            return okQ && okB && okC && okFrom && okTo;
        });
    }, [rows, filters]);

    const onExport = () => {
        const head = ['numero', 'type', 'statut', 'date', 'resume', 'bureau', 'categorie'];
        const lines = [head.join(';')].concat(filtered.map(r => head.map(k => {
            const v = r[k] ?? '';
            const s = typeof v === 'string' ? v.replace(/;/g, ',').replace(/\n/g, ' ') : String(v ?? '');
            return `"${s}"`;
        }).join(';')));
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'dossiers.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Box sx={{ p: 0 }}>
            <AgentHero
                title="Dossiers affectés"
                subtitle="Vos dossiers en cours — filtrage et export."
                search={{
                    value: filters.q,
                    onChange: (e) => setFilters(v => ({ ...v, q: e.target.value })),
                    placeholder: 'Rechercher (N°, type, statut…)',
                }}
                onRefresh={load}
                rightExtra={
                    <Button
                        onClick={onExport}
                        startIcon={<CloudDownloadIcon />}
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.45)',
                            '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
                        }}
                    >
                        Exporter
                    </Button>
                }
            />

            <Box sx={{ px: 2 }}>
                <AgentFiltersBar
                    value={filters}
                    onChange={setFilters}
                    onRefresh={load}
                    bureauOptions={bureauOptions}
                    categorieOptions={categorieOptions}
                />

                <Paper elevation={0} sx={{ mt: 2, border: '1px solid #E6ECF6' }}>
                    {err && <Box sx={{ p: 1.5, bgcolor: '#fde2e1', color: '#b42318' }}>{err}</Box>}
                    <Box sx={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
                        <Table stickyHeader size="small">
                            <TableHead sx={{ bgcolor: '#F8FAFF' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800, color: BRAND }}>N° dossier</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: BRAND }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: BRAND }}>Statut</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: BRAND }}>Créé le</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: BRAND }}>Résumé</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={5}>Chargement…</TableCell></TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={5}>Aucun dossier trouvé.</TableCell></TableRow>
                                ) : (
                                    filtered.map((r) => (
                                        <TableRow key={r.id} hover>
                                            <TableCell sx={{ fontWeight: 700 }}>{r.numero}</TableCell>
                                            <TableCell>{r.type || '—'}</TableCell>
                                            <TableCell>
                                                <Chip size="small" label={r.statut || '—'} color={statusColor(r.statut)} variant="outlined" />
                                            </TableCell>
                                            <TableCell>{r.date ? new Date(r.date).toLocaleString() : '—'}</TableCell>
                                            <TableCell>{r.resume || '—'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}
