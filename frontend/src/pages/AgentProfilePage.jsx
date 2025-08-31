// src/pages/AgentProfilePage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Box, Paper, Typography, Avatar, Badge, IconButton, Button,
    Chip, TextField, Stack, Divider, Tooltip, Snackbar, Alert, Dialog,
    DialogTitle, DialogContent, DialogActions, InputAdornment, LinearProgress,
    Grid, Skeleton
} from '@mui/material';

import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import KeyIcon from '@mui/icons-material/VpnKey';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

import { getMe, uploadAvatar, updateMe, changePassword, errorToText } from '../api/profile';

const BRAND = '#0B3D91';
const BTN = '#1D4ED8';
const BTN_H = '#1E40AF';
const COVER_URL = `${process.env.PUBLIC_URL || ''}/image1.jpg`;

/* ---------- helpers ---------- */
const isPhone = (v = '') => /^[0-9+()\s-]{6,20}$/.test(v);
function strengthOf(p = '') {
    let s = 0;
    if (p.length >= 8) s += 1;
    if (/[A-Z]/.test(p)) s += 1;
    if (/[a-z]/.test(p)) s += 1;
    if (/[0-9]/.test(p)) s += 1;
    if (/[^A-Za-z0-9]/.test(p)) s += 1;
    return s; // 0..5
}
function PasswordMeter({ value }) {
    const s = strengthOf(value);
    const labels = ['Très faible', 'Faible', 'Moyenne', 'Bonne', 'Excellente'];
    const pct = (s / 5) * 100;
    return (
        <Box sx={{ mt: .5 }}>
            <Box sx={{ height: 6, borderRadius: 999, bgcolor: '#e9eef7', overflow: 'hidden' }}>
                <Box sx={{
                    width: `${pct}%`,
                    height: '100%',
                    transition: 'width .25s ease',
                    background: s < 2 ? '#ef4444'
                        : s < 3 ? '#f59e0b'
                            : s < 4 ? '#10b981'
                                : '#22c55e'
                }}/>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Force : {labels[Math.max(0, Math.min(4, s - 1))] || '—'}
            </Typography>
        </Box>
    );
}
function Row({ icon, label, value }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: .25 }}>
            <Box sx={{ color: BRAND }}>{icon}</Box>
            <Typography sx={{ color: 'text.secondary' }}>{label}</Typography>
            <Box sx={{ flex: 1 }} />
            <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
        </Stack>
    );
}

export default function AgentProfilePage() {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({ nomComplet: '', telephone: '', departement: '' });
    const [initialForm, setInitialForm] = useState(form);

    const [avatarUrl, setAvatarUrl] = useState(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileRef = useRef(null);

    const [toast, setToast] = useState({ open: false, severity: 'success', msg: '' });

    const [pwdOpen, setPwdOpen] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
    const [showPwd, setShowPwd] = useState({ c: false, n: false, cf: false });

    const [copied, setCopied] = useState(false);

    const initials = useMemo(() => {
        const txt = me?.nom_complet ?? me?.nomComplet ?? me?.fullName ?? me?.name ?? '';
        return txt.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('');
    }, [me]);

    const activated     = Boolean(me?.is_activated ?? me?.isActivated ?? me?.activated ?? me?.enabled ?? me?.active);
    const createdAt     = me?.date_creation ?? me?.dateCreation ?? me?.createdAt ?? me?.created ?? null;
    const superviseurId = me?.superviseur_id ?? me?.superviseurId ?? null;
    const userId        = me?.user_id ?? me?.userId ?? me?.user?.id ?? null;
    const role          = me?.role ?? (Array.isArray(me?.authorities) ? me.authorities.join(', ') : me?.authorities) ?? '—';

    const dirty = JSON.stringify(form) !== JSON.stringify(initialForm);

    /* --------- fetch --------- */
    const refresh = async () => {
        try {
            setLoading(true); setErr('');
            const data = await getMe();
            setMe(data);
            const f = {
                nomComplet:  data?.nom_complet ?? data?.nomComplet ?? data?.fullName ?? '',
                telephone:   data?.telephone ?? data?.phone ?? '',
                departement: data?.departement ?? data?.department ?? '',
            };
            setForm(f); setInitialForm(f);
            const fromApi   = data?.photoUrl || data?.avatarUrl || data?.imageUrl || null;
            const fromLocal = localStorage.getItem('avatar-me') || null;
            setAvatarUrl(fromApi || fromLocal || null);
        } catch (e) {
            setErr(errorToText(e));
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { refresh(); }, []); // eslint-disable-line

    /* --------- avatar --------- */
    const onPickAvatar = () => fileRef.current?.click();
    const handleFileChange = async (e) => {
        const file = (e.target.files || [])[0]; e.target.value = '';
        if (!file) return;
        const preview = URL.createObjectURL(file); setAvatarUrl(preview);
        try {
            setAvatarUploading(true);
            const urlFromApi = await uploadAvatar(file);
            if (urlFromApi) { setAvatarUrl(urlFromApi); localStorage.setItem('avatar-me', urlFromApi); }
            setToast({ open: true, severity: 'success', msg: 'Photo mise à jour.' });
        } catch (e2) {
            setToast({ open: true, severity: 'error', msg: errorToText(e2) });
        } finally {
            setAvatarUploading(false);
        }
    };

    /* --------- edit --------- */
    const startEdit = () => setEdit(true);
    const cancelEdit = () => { setEdit(false); setForm(initialForm); };
    const saveBasics = async () => {
        if (form.telephone && !isPhone(form.telephone)) {
            setToast({ open: true, severity: 'warning', msg: 'Téléphone invalide.' });
            return;
        }
        try {
            setLoading(true);
            const payload = {
                nomComplet:  form.nomComplet,
                nom_complet: form.nomComplet,
                telephone:   form.telephone,
                departement: form.departement,
            };
            await updateMe(payload);
            setToast({ open: true, severity: 'success', msg: 'Profil mis à jour.' });
            setEdit(false);
            await refresh();
        } catch (e) {
            setToast({ open: true, severity: 'error', msg: errorToText(e) });
        } finally {
            setLoading(false);
        }
    };

    /* --------- password --------- */
    const closePwd = () => { setPwdOpen(false); setPwd({ current: '', next: '', confirm: '' }); setShowPwd({ c:false,n:false,cf:false }); };
    const submitPwd = async () => {
        if (!pwd.current || !pwd.next || !pwd.confirm) return setToast({ open:true, severity:'warning', msg:'Veuillez remplir tous les champs.' });
        if (pwd.next !== pwd.confirm) return setToast({ open:true, severity:'warning', msg:'La confirmation ne correspond pas.' });
        if (strengthOf(pwd.next) < 3)   return setToast({ open:true, severity:'warning', msg:'Mot de passe trop faible.' });
        try {
            setPwdLoading(true);
            await changePassword({ currentPassword: pwd.current, newPassword: pwd.next });
            setToast({ open: true, severity: 'success', msg: 'Mot de passe changé.' });
            closePwd();
        } catch (e) {
            setToast({ open: true, severity: 'error', msg: errorToText(e) });
        } finally {
            setPwdLoading(false);
        }
    };

    return (
        <Box sx={{ p: 0, width: '100%', maxWidth: '100%' }}>
            {/* styles utilitaires */}
            <style>{`
        .ring-focus .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: ${BRAND} !important; }
        .ring-focus .MuiOutlinedInput-root.Mui-focused { box-shadow: 0 0 0 4px rgba(11,61,145,0.12); transition: box-shadow .15s ease; }
      `}</style>

            {/* BARRE BLEUE CONSERVÉE */}
            <Box sx={{
                background: `linear-gradient(140deg, ${BRAND} 0%, #1E5FD6 45%, #4DA9FF 100%)`,
                color: 'white', py: { xs: 3, md: 4 }, mb: 2,
                boxShadow: '0 12px 36px rgba(11,61,145,0.28)',
                borderBottomLeftRadius: 28, borderBottomRightRadius: 28, width: '100%',
            }}>
                <Box sx={{ px: { xs: 2, md: 3 } }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" gap={2}>
                        <Stack spacing={0.5}>
                            <Typography variant="h4" fontWeight={900} letterSpacing={0.3}>Mon profil</Typography>
                            <Typography sx={{ opacity: 0.95 }}>Gérez vos informations personnelles et la sécurité du compte.</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                            <Button onClick={refresh} startIcon={<RefreshIcon />} variant="outlined"
                                    sx={{ textTransform:'none', color:'white', borderColor:'rgba(255,255,255,0.45)', '&:hover':{ borderColor:'white', bgcolor:'rgba(255,255,255,0.08)' } }}>
                                {loading ? 'Actualisation…' : 'Actualiser'}
                            </Button>
                            {!edit ? (
                                <Button onClick={startEdit} startIcon={<EditIcon />}
                                        sx={{ textTransform:'none', borderRadius:2, fontWeight:800, color:'white', bgcolor:BTN, '&:hover':{ bgcolor:BTN_H } }}>
                                    Modifier
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={cancelEdit} startIcon={<CancelIcon />} variant="outlined"
                                            sx={{ textTransform:'none', color:'white', borderColor:'rgba(255,255,255,0.45)', '&:hover':{ borderColor:'white', bgcolor:'rgba(255,255,255,0.08)' } }}>
                                        Annuler
                                    </Button>
                                    <Button onClick={saveBasics} startIcon={<SaveIcon />} disabled={!dirty}
                                            sx={{ textTransform:'none', borderRadius:2, fontWeight:800, color:'white', bgcolor:dirty?BTN:'#93c5fd', '&:hover':{ bgcolor:BTN_H } }}>
                                        Enregistrer
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Stack>
                </Box>
            </Box>

            {/* COUVERTURE — image statique /image1.jpg */}
            <Box sx={{ px: { xs: 2, md: 3 }, width: '100%', mb: 2 }}>
                <Box sx={{
                    height: { xs: 160, md: 200 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid #E6ECF6',
                    backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.25), rgba(0,0,0,.25)), url("${COVER_URL}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ height: '100%', px: 2.5 }}>
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                <Tooltip title="Changer la photo">
                  <span>
                    <IconButton size="small" onClick={onPickAvatar} disabled={avatarUploading}
                                sx={{ bgcolor: BRAND, color:'white', '&:hover':{ bgcolor:'#093272' }, border:'2px solid #fff' }}>
                      <CameraAltIcon fontSize="small" />
                    </IconButton>
                  </span>
                                </Tooltip>
                            }>
                            {loading ? (
                                <Skeleton variant="circular" width={96} height={96} />
                            ) : (
                                <Avatar
                                    src={avatarUrl || undefined}
                                    alt={me?.nomComplet || 'Avatar'}
                                    sx={{ width:96, height:96, fontSize:28, fontWeight:800, boxShadow:'0 8px 20px rgba(0,0,0,.35)', bgcolor: BRAND, border: '2px solid #fff' }}
                                >
                                    {initials || 'AG'}
                                </Avatar>
                            )}
                        </Badge>
                        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

                        <Stack spacing={.5} sx={{ color: 'white' }}>
                            <Typography variant="h5" fontWeight={900}>
                                {loading ? <Skeleton width={220} sx={{ bgcolor: 'rgba(255,255,255,.3)' }} /> : (me?.nom_complet ?? me?.nomComplet ?? '—')}
                            </Typography>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                {activated
                                    ? <Chip label="Compte activé" color="success" size="small" variant="filled" sx={{ bgcolor: 'rgba(34,197,94,.95)', color: 'white' }} />
                                    : <Chip label="Compte inactif" color="warning" size="small" variant="filled" sx={{ bgcolor: 'rgba(245,158,11,.95)', color: 'white' }} />}
                                <Chip icon={<ShieldIcon />} label={role || '—'} size="small" variant="filled"
                                      sx={{ bgcolor: 'rgba(255,255,255,.2)', color: 'white', '& .MuiChip-icon': { color: 'white' } }} />
                                {createdAt && (
                                    <Chip icon={<CalendarMonthIcon />} label={`Depuis ${new Date(createdAt).toLocaleDateString()}`}
                                          size="small" variant="filled"
                                          sx={{ bgcolor: 'rgba(255,255,255,.2)', color: 'white', '& .MuiChip-icon': { color: 'white' } }} />
                                )}
                            </Stack>
                        </Stack>
                    </Stack>
                    {avatarUploading && <LinearProgress sx={{ bgcolor: 'rgba(255,255,255,.35)' }} />}
                </Box>
            </Box>

            {/* ====== FORMULAIRES EN COLONNE (100% largeur) ====== */}
            <Box sx={{ px: { xs: 2, md: 3 }, pb: 4, width: '100%' }}>
                {/* 1) Informations personnelles */}
                <Paper sx={{ p: 3, border: '1px solid #E6ECF6', width: '100%', borderRadius: 3, background: 'rgba(255,255,255,.96)' }} elevation={0}>
                    <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 2 }}>
                        <PersonIcon sx={{ color: BRAND }} />
                        <Typography variant="h6" fontWeight={800}>Informations personnelles</Typography>
                    </Stack>

                    <Grid container spacing={2} className="ring-focus">
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Nom complet"
                                value={form.nomComplet}
                                onChange={(e) => setForm({ ...form, nomComplet: e.target.value })}
                                InputProps={{ startAdornment: (<InputAdornment position="start"><PersonIcon /></InputAdornment>) }}
                                disabled={!edit}
                                required
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Téléphone"
                                value={form.telephone}
                                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                                InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneIphoneIcon /></InputAdornment>) }}
                                error={Boolean(form.telephone) && !isPhone(form.telephone)}
                                helperText={Boolean(form.telephone) && !isPhone(form.telephone) ? 'Format invalide' : ' '}
                                disabled={!edit}
                                fullWidth
                                autoComplete="tel"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Adresse e-mail"
                                value={me?.email || ''}
                                InputProps={{
                                    readOnly: true,
                                    startAdornment: (<InputAdornment position="start"><EmailIcon /></InputAdornment>),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip title="Copier">
                                                <IconButton size="small" onClick={() => { if (me?.email) navigator.clipboard.writeText(me.email); setCopied(true); setTimeout(()=>setCopied(false), 900); }}>
                                                    {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                                                </IconButton>
                                            </Tooltip>
                                        </InputAdornment>
                                    )
                                }}
                                helperText="L’email est géré par l’administrateur."
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Département"
                                value={form.departement}
                                onChange={(e) => setForm({ ...form, departement: e.target.value })}
                                InputProps={{ startAdornment: (<InputAdornment position="start"><ApartmentIcon /></InputAdornment>) }}
                                disabled={!edit}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField label="ID Utilisateur (User)" value={userId ?? '—'} InputProps={{ readOnly: true }} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="ID Superviseur" value={superviseurId ?? '—'} InputProps={{ readOnly: true }} fullWidth />
                        </Grid>
                    </Grid>
                </Paper>

                {/* 2) Sécurité & statut */}
                <Paper sx={{ mt: 2, p: 3, border: '1px solid #E6ECF6', width: '100%', borderRadius: 3, background: 'rgba(255,255,255,.96)' }} elevation={0}>
                    <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 2 }}>
                        <ShieldIcon sx={{ color: BRAND }} />
                        <Typography variant="h6" fontWeight={800}>Sécurité & statut</Typography>
                    </Stack>

                    <Stack spacing={1.2} sx={{ mb: 2 }}>
                        <Row icon={<ShieldIcon />}        label="Statut du compte" value={activated ? 'Activé' : 'Inactif'} />
                        <Row icon={<PersonIcon />}        label="Rôle"             value={role || '—'} />
                        <Row icon={<CalendarMonthIcon />} label="Création"         value={createdAt ? new Date(createdAt).toLocaleString() : '—'} />
                        <Row icon={<EmailIcon />}         label="Email"            value={me?.email || '—'} />
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                        <Button startIcon={<KeyIcon />} variant="outlined" onClick={() => setPwdOpen(true)} sx={{ textTransform: 'none', borderRadius: 2 }}>
                            Changer le mot de passe
                        </Button>
                        <Box sx={{ flex: 1 }} />
                        {edit ? (
                            <Stack direction="row" spacing={1.2}>
                                <Button onClick={cancelEdit} startIcon={<CancelIcon />} variant="text" sx={{ textTransform: 'none' }}>
                                    Annuler
                                </Button>
                                <Button onClick={saveBasics} startIcon={<SaveIcon />} disabled={!dirty}
                                        sx={{ textTransform:'none', borderRadius:2, fontWeight:800, color:'white', bgcolor:dirty?BTN:'#93c5fd', '&:hover':{ bgcolor:BTN_H } }}>
                                    Enregistrer
                                </Button>
                            </Stack>
                        ) : null}
                    </Stack>

                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                        Besoin d’aide ? Contactez votre superviseur pour les informations non modifiables
                        (email, activation) ou ouvrez un ticket d’assistance.
                    </Typography>
                </Paper>
            </Box>

            {/* Dialog mot de passe */}
            <Dialog open={pwdOpen} onClose={closePwd} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 800 }}>Modifier le mot de passe</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Mot de passe actuel"
                            type={showPwd.c ? 'text' : 'password'}
                            value={pwd.current}
                            onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPwd({ ...showPwd, c: !showPwd.c })}>
                                            {showPwd.c ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            fullWidth
                        />
                        <TextField
                            label="Nouveau mot de passe"
                            type={showPwd.n ? 'text' : 'password'}
                            value={pwd.next}
                            onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPwd({ ...showPwd, n: !showPwd.n })}>
                                            {showPwd.n ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            fullWidth
                        />
                        <PasswordMeter value={pwd.next} />
                        <TextField
                            label="Confirmer le nouveau mot de passe"
                            type={showPwd.cf ? 'text' : 'password'}
                            value={pwd.confirm}
                            onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPwd({ ...showPwd, cf: !showPwd.cf })}>
                                            {showPwd.cf ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={closePwd} variant="text" startIcon={<CancelIcon />} sx={{ textTransform: 'none' }}>Annuler</Button>
                    <Button onClick={submitPwd} startIcon={<SaveIcon />} disabled={pwdLoading}
                            sx={{ textTransform:'none', borderRadius:2, bgcolor:BTN, color:'white', '&:hover':{ bgcolor:BTN_H } }}>
                        {pwdLoading ? 'Traitement…' : 'Enregistrer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar & erreurs */}
            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert severity={toast.severity} variant="filled" onClose={() => setToast({ ...toast, open: false })} sx={{ boxShadow: 3 }}>
                    {toast.msg}
                </Alert>
            </Snackbar>

            {err && (
                <Box sx={{ px: { xs: 2, md: 3 }, pb: 3, width: '100%' }}>
                    <Alert severity="error" onClose={() => setErr('')}>{err}</Alert>
                </Box>
            )}
        </Box>
    );
}
