// src/pages/AddAgentForm.jsx
import React, { useMemo, useState } from 'react';
import {
    Box, Container, Paper, Typography, Stack, Button, TextField, Grid,
    InputAdornment, Chip, Divider, Snackbar, Alert, CircularProgress, Tooltip, IconButton
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Business as BusinessIcon,
    Add as AddIcon,
    Refresh as RefreshIcon,
    ArrowBack as ArrowBackIcon,
    Bolt as BoltIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE     = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const PORTNET_BLUE = '#0B3D91';
const BTN_BLUE     = '#1D4ED8';
const BTN_BLUE_H   = '#1E40AF';
const BTN_GREEN    = '#0EA5A0';
const BTN_GREEN_H  = '#0B8E8A';

const INIT = { nomComplet: '', email: '', telephone: '', departement: '' };

export default function AddAgentForm() {
    const navigate = useNavigate();
    const [form, setForm] = useState(INIT);
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, severity: 'success', msg: '' });
    const [heroSearch, setHeroSearch] = useState('');

    const token   = localStorage.getItem('token');
    const headers = token && token !== 'null' && token !== 'undefined' ? { Authorization: `Bearer ${token}` } : {};

    const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()), [form.email]);
    const nameOk  = useMemo(() => form.nomComplet.trim().length >= 3, [form.nomComplet]);
    const telOk   = useMemo(() => {
        if (!form.telephone.trim()) return true;
        return /^(\+?\d[\d\s-]{7,})$/.test(form.telephone.trim());
    }, [form.telephone]);

    const canSubmit = nameOk && emailOk && telOk && !loading;

    const errors = {
        nomComplet: touched.nomComplet && !nameOk ? 'Minimum 3 caractères.' : '',
        email:      touched.email && !emailOk ? 'Email invalide.' : '',
        telephone:  touched.telephone && !telOk ? 'Numéro invalide.' : '',
    };

    const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));
    const markTouched = (name) => setTouched(prev => ({ ...prev, [name]: true }));
    const resetForm = () => { setForm(INIT); setTouched({}); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ nomComplet: true, email: true, telephone: true, departement: true });
        if (!canSubmit) return;

        try {
            setLoading(true);
            await axios.post(`${API_BASE}/api/agents`, form, { headers });
            setSnack({ open: true, severity: 'success', msg: '✅ Agent ajouté avec succès. Email d’activation envoyé.' });
            resetForm();
            setTimeout(() => navigate('/agents'), 800);
        } catch (err) {
            const msg = typeof err?.response?.data === 'string' ? err.response.data : (err?.response?.data?.message || "Impossible d'ajouter l’agent.");
            setSnack({ open: true, severity: 'error', msg: `Erreur : ${msg}` });
        } finally {
            setLoading(false);
        }
    };

    const goSearch = () => {
        const q = heroSearch.trim();
        if (!q) return;
        navigate(`/agents?search=${encodeURIComponent(q)}`);
    };

    const requiredCount = 2;
    const optionalCount = 2;

    return (
        <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#F6F8FC', pb: 6 }}>
            <Box sx={{ background: `linear-gradient(140deg, ${PORTNET_BLUE} 0%, #1E5FD6 45%, #4DA9FF 100%)`, color: 'white', py: { xs: 3, md: 4 }, mb: 3, boxShadow: '0 12px 36px rgba(11,61,145,0.28)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
                <Container maxWidth="lg">
                    <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" gap={2}>
                        <Stack spacing={0.5}>
                            <Typography variant="h4" fontWeight={900} letterSpacing={0.3}>Ajouter un agent</Typography>
                            <Typography sx={{ opacity: 0.95 }}>Création d’un compte agent — informations de contact & rattachement.</Typography>
                            <Stack direction="row" spacing={1.2} mt={1.2}>
                                <Chip label={`${requiredCount} champs obligatoires`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 700, backdropFilter: 'blur(6px)' }} />
                                <Chip label={`${optionalCount} champs optionnels`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 700, backdropFilter: 'blur(6px)' }} />
                            </Stack>
                        </Stack>

                        <Stack direction="row" spacing={1.2} alignItems="center">
                            <TextField
                                size="small"
                                placeholder="Rechercher un agent (nom ou email)…"
                                value={heroSearch}
                                onChange={(e) => setHeroSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && goSearch()}
                                sx={{ minWidth: 320, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, input: { color: 'white' }, '& .MuiInputBase-root': { color: 'white' }, '& fieldset': { borderColor: 'rgba(255,255,255,0.35)' }, '&:hover fieldset': { borderColor: 'white' }, backdropFilter: 'blur(8px)' }}
                                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: 'white' }} /></InputAdornment>) }}
                            />
                            <Tooltip title="Lancer la recherche">
                <span>
                  <IconButton
                      onClick={goSearch}
                      sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' }, backdropFilter: 'blur(6px)' }}
                  >
                    <SearchIcon />
                  </IconButton>
                </span>
                            </Tooltip>

                            <Tooltip title="Retour à la liste">
                <span>
                  <Button
                      onClick={() => navigate('/agents')}
                      startIcon={<ArrowBackIcon />}
                      sx={{ px: 2.1, borderRadius: 2, textTransform: 'none', fontWeight: 800, color: 'white', bgcolor: BTN_BLUE,
                          boxShadow: '0 10px 22px rgba(0,0,0,0.15)', '&:hover': { bgcolor: BTN_BLUE_H, transform: 'translateY(-1px)' }, transition: 'all .2s ease' }}
                  >
                    Retour liste
                  </Button>
                </span>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg">
                <Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: 4, bgcolor: 'rgba(255,255,255,0.98)', border: '1px solid #E8EEF7', backdropFilter: 'blur(10px)', boxShadow: '0 18px 40px rgba(16, 44, 84, 0.08)' }}>
                    <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <BoltIcon sx={{ color: PORTNET_BLUE }} />
                            <Typography fontWeight={900} color={PORTNET_BLUE}>Formulaire</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">Renseigne au minimum le nom complet et l’email. Un lien d’activation sera envoyé.</Typography>
                    </Box>
                    <Divider />

                    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
                        <Grid container spacing={2.4}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Nom complet *"
                                    value={form.nomComplet}
                                    onChange={(e) => setField('nomComplet', e.target.value)}
                                    onBlur={() => markTouched('nomComplet')}
                                    fullWidth
                                    required
                                    error={!!errors.nomComplet}
                                    helperText={errors.nomComplet || 'Ex. : Ahmed El Idrissi'}
                                    InputProps={{ startAdornment: (<InputAdornment position="start"><PersonIcon sx={{ color: '#8FA6CE' }} /></InputAdornment>) }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Email *"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setField('email', e.target.value)}
                                    onBlur={() => markTouched('email')}
                                    fullWidth
                                    required
                                    error={!!errors.email}
                                    helperText={errors.email || 'Ex. : prenom.nom@domaine.com'}
                                    InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon sx={{ color: '#8FA6CE' }} /></InputAdornment>) }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Téléphone"
                                    value={form.telephone}
                                    onChange={(e) => setField('telephone', e.target.value)}
                                    onBlur={() => markTouched('telephone')}
                                    fullWidth
                                    error={!!errors.telephone}
                                    helperText={errors.telephone || 'Ex. : +212 6 12 34 56 78'}
                                    InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneIcon sx={{ color: '#8FA6CE' }} /></InputAdornment>) }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Département"
                                    value={form.departement}
                                    onChange={(e) => setField('departement', e.target.value)}
                                    onBlur={() => markTouched('departement')}
                                    fullWidth
                                    helperText="Ex. : Opérations / Comptabilité"
                                    InputProps={{ startAdornment: (<InputAdornment position="start"><BusinessIcon sx={{ color: '#8FA6CE' }} /></InputAdornment>) }}
                                />
                            </Grid>
                        </Grid>

                        <Stack direction="row" spacing={1.2} sx={{ mt: 3, width: '100%' }} alignItems="center" justifyContent="flex-end" flexWrap="wrap">
                            <Button
                                onClick={resetForm}
                                startIcon={<RefreshIcon />}
                                sx={{ borderRadius: 2, fontWeight: 900, textTransform: 'none', px: 2.1, color: BTN_BLUE, border: `1px solid ${BTN_BLUE}`,
                                    bgcolor: 'transparent', '&:hover': { bgcolor: '#EFF6FF', borderColor: BTN_BLUE_H, color: BTN_BLUE_H }, minWidth: 160 }}
                            >
                                Réinitialiser
                            </Button>

                            <Button
                                type="submit"
                                disabled={!canSubmit}
                                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                                sx={{ borderRadius: 2, fontWeight: 900, textTransform: 'none', px: 2.1, color: BTN_BLUE, border: `1px solid ${BTN_GREEN}`,
                                    bgcolor: '#FFFFFF', '&:hover': { bgcolor: '#F0FAF9', borderColor: BTN_GREEN_H, color: BTN_BLUE_H }, minWidth: 180 }}
                            >
                                {loading ? 'Création en cours…' : "Créer l'agent"}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Container>

            <Snackbar
                open={snack.open}
                autoHideDuration={3600}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnack(s => ({ ...s, open: false }))}
                    severity={snack.severity}
                    variant="filled"
                    sx={{ fontWeight: 800 }}
                >
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
