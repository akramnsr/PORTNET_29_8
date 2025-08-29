import React, { useCallback, useEffect, useState } from 'react';
import { Box, Stack, Typography, IconButton, Tooltip, Alert, LinearProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { getDispatchJournal } from '../api/workload';

function fmtDate(dt) {
    if (!dt) return '—';
    try { return new Date(dt).toLocaleString('fr-FR'); } catch { return '—'; }
}

export default function DispatchJournalTable({ filters = {} }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    const columns = [
        { field: 'date', headerName: 'Date', width: 180, valueFormatter: (p) => fmtDate(p?.value) },
        { field: 'dossier', headerName: 'Dossier', width: 160 },
        { field: 'from', headerName: 'Depuis', width: 180 },
        { field: 'toAgent', headerName: 'Vers', width: 180 },
        { field: 'by', headerName: 'Par', width: 180 },
        { field: 'motif', headerName: 'Motif', minWidth: 200, flex: 1 },
    ];

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setErr('');
            const { items } = await getDispatchJournal(filters);
            setRows(items);
        } catch {
            setErr('Impossible de charger le journal du dispatch.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={900}>Journal du dispatch</Typography>
                <Tooltip title="Rafraîchir">
                    <span><IconButton onClick={load}><RefreshIcon /></IconButton></span>
                </Tooltip>
            </Stack>

            {loading && <LinearProgress sx={{ mb: 1 }} />}

            {err ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>{err}</Alert>
            ) : (
                <Box sx={{ height: 360, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        getRowId={(r) => r.id}
                        density="compact"
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        sx={{
                            border: '1px solid #E6ECF6',
                            borderRadius: 2,
                            '& .MuiDataGrid-columnHeaders': {
                                bgcolor: '#F3F7FF',
                                color: '#0B3D91',
                                fontWeight: 900,
                                borderBottom: '1px solid #E6ECF6',
                            },
                            '& .MuiDataGrid-row:hover': { backgroundColor: '#F9FBFF' },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}
