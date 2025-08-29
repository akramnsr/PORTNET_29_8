import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Container, Paper, Stack, Button, Typography, Card, CardContent, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AgentFiltersBar from '../components/AgentFiltersBar';
import DispatchJournalTable from '../components/DispatchJournalTable';
import AgentAssignmentDialog from '../components/AgentAssignmentDialog';
import { getAgentsWorkload } from '../api/workload';

const PORTNET_BLUE = '#0B3D91';

export default function AgentsWorkload() {
    const [filters, setFilters] = useState(() => {
        const today = new Date().toISOString().slice(0, 10);
        return { q: '', bureau: '', categorie: '', from: today, to: today };
    });
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignOpen, setAssignOpen] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getAgentsWorkload({
                q: filters.q || undefined,
                bureau: filters.bureau || undefined,
                categorie: filters.categorie || undefined,
                from: filters.from || undefined,
                to: filters.to || undefined,
            });
            setRows(data);
        } catch (e) {
            setRows([]);
            setError('Impossible de charger la charge de travail (API indisponible).');
            console.warn(e);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    const totals = useMemo(() => {
        const t = { total: 0, retard: 0, prod: 0, slaMedian: 0 };
        if (!rows.length) return t;
        t.total = rows.reduce((s, r) => s + (r.dossiersTotal || 0), 0);
        t.retard = rows.reduce((s, r) => s + (r.enRetard || 0), 0);
        t.prod = Math.round(rows.reduce((s, r) => s + (r.productiviteJ || 0), 0) / rows.length);
        t.slaMedian = Math.round(rows.reduce((s, r) => s + (r.slaMedianMin || 0), 0) / rows.length);
        return t;
    }, [rows]);

    const columns = [
        { field: 'agent', headerName: 'Agent', minWidth: 200, flex: 1 },
        { field: 'dossiersTotal', headerName: 'Total', width: 110, type: 'number' },
        { field: 'enCours', headerName: 'En cours', width: 120, type: 'number' },
        { field: 'enRetard', headerName: 'En retard', width: 120, type: 'number' },
        { field: 'productiviteJ', headerName: 'Prod/j', width: 120, type: 'number' },
        { field: 'slaMedianMin', headerName: 'SLA médian (min)', width: 170, type: 'number' },
        { field: 'tempsMoyenMin', headerName: 'Temps moyen (min)', width: 190, type: 'number' },
    ];

    return (
        <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#F6F8FC', pb: 6 }}>
            {/* HERO */}
            <Box sx={{ background: `linear-gradient(140deg, ${PORTNET_BLUE} 0%, #1E5FD6 45%, #4DA9FF 100%)`, color: 'white', py: 3, mb: 3, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" fontWeight={900}>Agents & charge de travail</Typography>
                    <Typography sx={{ opacity: 0.9 }}>
                        Total dossiers: {totals.total} — En retard: {totals.retard} — Prod moyenne: {totals.prod}/j — SLA médian: {totals.slaMedian} min
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg">
                <Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: 4, bgcolor: 'rgba(255,255,255,0.98)', border: '1px solid #E8EEF7', backdropFilter: 'blur(10px)', mb: 3 }}>
                    <AgentFiltersBar value={filters} onChange={setFilters} onRefresh={load} bureauOptions={[]} categorieOptions={[]} />

                    <Box sx={{ p: 2, pt: 0 }}>
                        {error && (
                            <Alert severity="warning" sx={{ mb: 1, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ height: 440, width: '100%' }}>
                            <DataGrid
                                rows={rows}
                                getRowId={(r) => r.id}
                                columns={columns}
                                loading={loading}
                                density="comfortable"
                                pageSizeOptions={[10, 25, 50]}
                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                sx={{
                                    border: '1px solid #E6ECF6',
                                    borderRadius: 2,
                                    '& .MuiDataGrid-columnHeaders': { bgcolor: '#F3F7FF', color: PORTNET_BLUE, fontWeight: 900, borderBottom: '1px solid #E6ECF6' },
                                    '& .MuiDataGrid-row:hover': { backgroundColor: '#F9FBFF' },
                                }}
                            />
                        </Box>

                        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                            <Button onClick={() => setAssignOpen(true)} variant="outlined" sx={{ textTransform: 'none', fontWeight: 900, borderRadius: 2 }}>
                                Réaffecter des dossiers…
                            </Button>
                        </Stack>
                    </Box>
                </Paper>

                <Card elevation={0} sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.98)', border: '1px solid #E8EEF7' }}>
                    <CardContent>
                        <DispatchJournalTable filters={filters} />
                    </CardContent>
                </Card>
            </Container>

            <AgentAssignmentDialog open={assignOpen} onClose={() => setAssignOpen(false)} presetDossierIds={[]} />
        </Box>
    );
}
