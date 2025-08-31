import React, { useMemo, useRef, useState } from 'react';
import {
    Box, Paper, Typography, Grid, TextField, Stack, Button, Divider, Chip,
    Snackbar, Alert, InputAdornment, MenuItem
} from '@mui/material';

import CategoryIcon from '@mui/icons-material/Category';
import BusinessIcon from '@mui/icons-material/Business';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import NumbersIcon from '@mui/icons-material/Numbers';
import PublicIcon from '@mui/icons-material/Public';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsightsIcon from '@mui/icons-material/Insights';
import VerifiedIcon from '@mui/icons-material/Verified';

import { createDemande } from '../api/demandes';
import AgentHero from './AgentHero';

const BRAND = '#0B3D91';

const initial = {
    categorie: '',
    bureau: '',
    designation: '',
    quantite: '',
    codeSh: '',
    pays: '',
    montant: '',
    devise: 'MAD',
};

const categories = ['Importation', 'Exportation', 'Transit', 'Transbordement'];
const devises    = ['MAD', 'EUR', 'USD', 'GBP'];
const paysList   = ['MA - Maroc', 'FR - France', 'ES - Espagne', 'US - États-Unis', 'CN - Chine', 'TR - Turquie'];

function Row({ label, value }) {
    return (
        <Stack direction="row" spacing={1}>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={700}>{value}</Typography>
        </Stack>
    );
}

export default function DemandeForm() {
    const [form, setForm] = useState(initial);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, severity: 'success', msg: '' });
    const [errors, setErrors] = useState({});
    const dropRef = useRef(null);

    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const validate = () => {
        const e = {};
        if (!form.categorie) e.categorie = 'Obligatoire';
        if (!form.designation) e.designation = 'Obligatoire';
        if (form.quantite && Number(form.quantite) < 0) e.quantite = 'Valeur invalide';
        if (form.montant && Number(form.montant) < 0) e.montant = 'Valeur invalide';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onPickFiles = (pickedList) => {
        const picked = Array.from(pickedList || []);
        if (!picked.length) return;
        const key = (f) => `${f.name}_${f.size}`;
        const map = new Map(files.map((f) => [key(f), f]));
        picked.forEach((f) => map.set(key(f), f));
        setFiles(Array.from(map.values()));
    };

    const onInputChange = (e) => {
        onPickFiles(e.target.files);
        e.target.value = '';
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropRef.current?.classList.remove('drag');
        onPickFiles(e.dataTransfer.files);
    };

    const removeFile = (name, size) =>
        setFiles((arr) => arr.filter((f) => !(f.name === name && f.size === size)));

    const resetForm = () => {
        setForm(initial);
        setFiles([]);
        setErrors({});
    };

    const submit = async () => {
        if (!validate()) {
            setToast({ open: true, severity: 'warning', msg: 'Veuillez corriger les champs requis.' });
            return;
        }
        try {
            setLoading(true);
            await createDemande({ form, files });
            setToast({ open: true, severity: 'success', msg: 'Demande envoyée avec succès.' });
            resetForm();
        } catch (e) {
            const msg = e?.response?.data?.message || e?.response?.data || e?.message || 'Échec de l’envoi';
            setToast({ open: true, severity: 'error', msg: String(msg) });
        } finally {
            setLoading(false);
        }
    };

    const isValid = useMemo(() => {
        if (!form.categorie || !form.designation) return false;
        if (form.quantite && Number(form.quantite) < 0) return false;
        if (form.montant && Number(form.montant) < 0) return false;
        return true;
    }, [form]);

    return (
        <Box sx={{ p: 0 }}>
            <AgentHero
                title="Nouvelle demande"
                subtitle="Soumettez une nouvelle demande et joignez vos documents."
                rightExtra={
                    <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={resetForm}
                        disabled={loading}
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 800, color:'white', borderColor:'rgba(255,255,255,0.45)',
                            '&:hover':{ borderColor:'white', bgcolor:'rgba(255,255,255,0.08)' } }}
                    >
                        Réinitialiser
                    </Button>
                }
            />

            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    {/* Colonne gauche — sections du formulaire */}
                    <Grid item xs={12} md={8}>
                        {/* SECTION 1 — Informations générales */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                border: '1px solid #E6ECF6',
                                borderRadius: 2,
                                background: 'linear-gradient(180deg, rgba(11,61,145,0.05), white)',
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <VerifiedIcon sx={{ color: BRAND }} />
                                <Typography variant="subtitle1" fontWeight={900} sx={{ color: BRAND }}>
                                    Informations générales
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        label="Catégorie *"
                                        value={form.categorie}
                                        onChange={(e) => setField('categorie', e.target.value)}
                                        fullWidth
                                        size="small"
                                        error={!!errors.categorie}
                                        helperText={errors.categorie || ''}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CategoryIcon sx={{ color: BRAND }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    >
                                        {categories.map((c) => (
                                            <MenuItem key={c} value={c}>{c}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Bureau Douanier"
                                        placeholder="Ex. Casablanca Port"
                                        value={form.bureau}
                                        onChange={(e) => setField('bureau', e.target.value)}
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <BusinessIcon sx={{ color: BRAND }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Désignation *"
                                        value={form.designation}
                                        onChange={(e) => setField('designation', e.target.value)}
                                        fullWidth
                                        size="small"
                                        error={!!errors.designation}
                                        helperText={errors.designation || ''}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Inventory2Icon sx={{ color: BRAND }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* SECTION 2 — Marchandise & valeurs */}
                        <Paper
                            elevation={0}
                            sx={{
                                mt: 2,
                                p: 2,
                                border: '1px solid #E6ECF6',
                                borderRadius: 2,
                                background: 'linear-gradient(180deg, rgba(11,61,145,0.04), white)',
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <InsightsIcon sx={{ color: BRAND }} />
                                <Typography variant="subtitle1" fontWeight={900} sx={{ color: BRAND }}>
                                    Marchandise & valeurs
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        label="Quantité"
                                        type="number"
                                        value={form.quantite}
                                        onChange={(e) => setField('quantite', e.target.value)}
                                        fullWidth
                                        size="small"
                                        error={!!errors.quantite}
                                        helperText={errors.quantite || ''}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <NumbersIcon sx={{ color: BRAND }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={6} md={3}>
                                    <TextField
                                        label="Code SH"
                                        value={form.codeSh}
                                        onChange={(e) => setField('codeSh', e.target.value)}
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <NumbersIcon sx={{ color: BRAND }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        label="Pays"
                                        value={form.pays}
                                        onChange={(e) => setField('pays', e.target.value)}
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PublicIcon sx={{ color: BRAND }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    >
                                        {paysList.map((p) => (
                                            <MenuItem key={p} value={p}>{p}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={8} md={6}>
                                    <TextField
                                        label="Montant"
                                        type="number"
                                        value={form.montant}
                                        onChange={(e) => setField('montant', e.target.value)}
                                        fullWidth
                                        size="small"
                                        error={!!errors.montant}
                                        helperText={errors.montant || ''}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CurrencyExchangeIcon sx={{ color: BRAND }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: <InputAdornment position="end">{form.devise}</InputAdornment>,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={4} md={3}>
                                    <TextField
                                        select
                                        label="Devise"
                                        value={form.devise}
                                        onChange={(e) => setField('devise', e.target.value)}
                                        fullWidth
                                        size="small"
                                    >
                                        {devises.map((d) => (
                                            <MenuItem key={d} value={d}>{d}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Colonne droite — documents + récap + actions */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                border: '1px solid #E6ECF6',
                                borderRadius: 2,
                                background: 'white',
                                position: 'sticky',
                                top: 16,
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={900} sx={{ color: BRAND, mb: 1 }}>
                                Documents à joindre
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box
                                ref={dropRef}
                                onDragOver={(e) => { e.preventDefault(); dropRef.current?.classList.add('drag'); }}
                                onDragLeave={() => dropRef.current?.classList.remove('drag')}
                                onDrop={onDrop}
                                sx={{
                                    border: '2px dashed #C9D7F1',
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                    background: 'linear-gradient(180deg, rgba(11,61,145,0.06), rgba(11,61,145,0.02))',
                                    transition: 'all .15s ease',
                                    '&.drag, &:hover': { borderColor: BRAND, background: 'linear-gradient(180deg, rgba(11,61,145,0.09), rgba(11,61,145,0.03))' }
                                }}
                            >
                                <CloudUploadIcon sx={{ fontSize: 42, color: BRAND }} />
                                <Typography sx={{ mt: .5, mb: 1 }}>
                                    Glissez-déposez vos fichiers ici
                                </Typography>
                                <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}
                                        sx={{ textTransform:'none', borderRadius: 2, fontWeight: 800 }}>
                                    Choisir des fichiers
                                    <input type="file" hidden multiple onChange={onInputChange} />
                                </Button>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>
                                    PDF, images, DOCX… (taille max selon serveur)
                                </Typography>
                            </Box>

                            {files.length > 0 && (
                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
                                    {files.map((f) => (
                                        <Chip
                                            key={`${f.name}_${f.size}`}
                                            label={`${f.name} (${Math.ceil(f.size / 1024)} Ko)`}
                                            onDelete={() => removeFile(f.name, f.size)}
                                            deleteIcon={<DeleteIcon />}
                                            variant="outlined"
                                        />
                                    ))}
                                </Stack>
                            )}

                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" fontWeight={900} sx={{ color: BRAND, mb: 1 }}>
                                Récapitulatif
                            </Typography>
                            <Stack spacing={1}>
                                <Row label="Catégorie"   value={form.categorie || '—'} />
                                <Row label="Bureau"       value={form.bureau || '—'} />
                                <Row label="Désignation"  value={form.designation || '—'} />
                                <Row label="Quantité"     value={form.quantite || '—'} />
                                <Row label="Code SH"      value={form.codeSh || '—'} />
                                <Row label="Pays"         value={form.pays || '—'} />
                                <Row label="Montant"      value={form.montant ? `${form.montant} ${form.devise}` : '—'} />
                                <Row label="Fichiers"     value={`${files.length} fichier(s)`} />
                            </Stack>

                            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<SaveIcon />}
                                    disabled={loading}
                                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 800 }}
                                    onClick={() => setToast({ open: true, severity: 'info', msg: 'Brouillon local enregistré (non envoyé).' })}
                                >
                                    Brouillon
                                </Button>
                                <Box sx={{ flexGrow: 1 }} />
                                <Button
                                    variant="contained"
                                    startIcon={<SendIcon />}
                                    disabled={loading || !isValid}
                                    onClick={submit}
                                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 900, bgcolor: BRAND }}
                                >
                                    {loading ? 'Envoi…' : 'Envoyer'}
                                </Button>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            <Snackbar
                open={toast.open}
                autoHideDuration={3400}
                onClose={() => setToast((t) => ({ ...t, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setToast((t) => ({ ...t, open: false }))} severity={toast.severity} sx={{ width: '100%' }}>
                    {typeof toast.msg === 'string' ? toast.msg : 'Une erreur est survenue.'}
                </Alert>
            </Snackbar>
        </Box>
    );
}
