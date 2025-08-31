import React from 'react';
import {
    Box, Drawer, Toolbar, List, ListItemButton, ListItemIcon, ListItemText,
    Divider, Button
} from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import DescriptionIcon from '@mui/icons-material/Description';
import ChecklistIcon from '@mui/icons-material/Checklist';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

import logo from '../assets/images/PORTNET_LOGO.png';

const DRAWER_WIDTH = 240;
const BRAND = '#0B3D91';

export default function DrawerAgent() {
    const navigate = useNavigate();
    const items = [
        { to: '/agent/dossiers',         label: 'Dossiers affectés', icon: <DescriptionIcon />, end: true },
        { to: '/agent/taches',           label: 'Mes tâches',        icon: <ChecklistIcon /> },
        { to: '/agent/demande/nouvelle', label: 'Nouvelle demande',  icon: <NoteAddIcon /> },
        { to: '/agent/profil',           label: 'Mon profil',        icon: <AccountCircleIcon /> },
    ];

    const logout = () => { localStorage.removeItem('token'); navigate('/login', { replace: true }); };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F6F8FC' }}>
            <Drawer variant="permanent" anchor="left" sx={{
                width: DRAWER_WIDTH, flexShrink: 0,
                '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid #E6ECF6', bgcolor: '#fff' },
            }}>
                <Toolbar sx={{ minHeight: 96, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box component="img" src={logo} alt="PORTNET" sx={{ height: 64, width: 'auto', display: 'block', objectFit: 'contain' }} />
                </Toolbar>
                <Divider />
                <List sx={{ px: 1, py: 1 }}>
                    {items.map((it) => (
                        <ListItemButton key={it.to} component={NavLink} to={it.to} end={it.end}
                                        className={({ isActive }) => (isActive ? 'active' : undefined)}
                                        sx={{ mb: .5, borderRadius: 2, '&.active': { bgcolor: '#EFF4FF' } }}>
                            <ListItemIcon sx={{ minWidth: 36, color: BRAND }}>{it.icon}</ListItemIcon>
                            <ListItemText primary={it.label} primaryTypographyProps={{ fontWeight: 700 }} />
                        </ListItemButton>
                    ))}
                </List>
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ p: 2 }}>
                    <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={logout}
                            sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}>
                        Déconnexion
                    </Button>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, minHeight: '100vh' }}>
                <Outlet />
            </Box>
        </Box>
    );
}
