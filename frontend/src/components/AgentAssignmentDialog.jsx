import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Stack, TextField, MenuItem, Button, CircularProgress, Typography
} from '@mui/material';
import { listAgents, bulkReassign } from '../api/workload';

export default function AgentAssignmentDialog({
                                                  open,
                                                  onClose = () => {},
                                                  presetDossierIds = [],
                                              }) {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [targetAgentId, setTargetAgentId] = useState('');
    const [reason, setReason] = useState('');
    const [dossierIdsRaw, setDossierIdsRaw] = useState(presetDossierIds.join('\n'));

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const list = await listAgents();
                if (mounted) setAgents(list.filter(a => a.enabled !== false));
            } finally {
                setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [open]);

    useEffect(() => {
        setDossierIdsRaw(presetDossierIds.join('\n'));
    }, [presetDossierIds]);

    const submit = async () => {
        const ids = dossierIdsRaw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        if (!ids.length || !targetAgentId) return;

        try {
            setSubmitting(true);
            await bulkReassign({ dossierIds: ids, targetAgentId, reason: reason || 'Rééquilibrage' });
            onClose(true);
        } catch (e) {
            alert(typeof e?.response?.data === 'string' ? e.response.data : 'Échec de la réaffectation');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
            <DialogTitle fontWeight={900}>Réaffecter des dossiers</DialogTitle>
            <DialogContent dividers sx={{ pt: 1.5 }}>
                <Stack spacing={1.5}>
                    <TextField
                        label="Dossiers (un N° par ligne)"
                        placeholder={'Ex.\nD-2025-00001\nD-2025-00002'}
                        value={dossierIdsRaw}
                        onChange={(e) => setDossierIdsRaw(e.target.value)}
                        multiline minRows={4}
                        fullWidth
                    />

                    <TextField
                        select
                        fullWidth
                        label="Agent cible"
                        value={targetAgentId}
                        onChange={(e) => setTargetAgentId(e.target.value)}
                        disabled={loading}
                        helperText={loading ? 'Chargement des agents…' : ''}
                    >
                        {loading ? (
                            <MenuItem value="" disabled>
                                <CircularProgress size={16} sx={{ mr: 1 }} /> Chargement…
                            </MenuItem>
                        ) : agents.length ? (
                            agents.map((a) => <MenuItem key={a.id} value={a.id}>{a.label}</MenuItem>)
                        ) : (
                            <MenuItem value="" disabled>Aucun agent disponible</MenuItem>
                        )}
                    </TextField>

                    <TextField
                        label="Motif"
                        placeholder="Ex. Rééquilibrage de la charge"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        fullWidth
                    />

                    <Typography variant="caption" color="text.secondary">
                        Astuce : aussi disponible depuis “Liste des dossiers”.
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(false)}>Annuler</Button>
                <Button
                    onClick={submit}
                    disabled={submitting}
                    variant="contained"
                    sx={{ textTransform: 'none', fontWeight: 900, borderRadius: 2 }}
                >
                    {submitting ? 'En cours…' : 'Confirmer'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
