// src/components/AgentFiltersBar.jsx
import React from 'react';
import { Stack, TextField, MenuItem, Button, InputAdornment } from '@mui/material';
import { Search as SearchIcon, FilterAlt as FilterAltIcon } from '@mui/icons-material';

export default function AgentFiltersBar({
                                            value = {},
                                            onChange = () => {},
                                            onRefresh = () => {},
                                            bureauOptions = [],
                                            categorieOptions = [],
                                        }) {
    const v = {
        q: value.q ?? '',
        bureau: value.bureau ?? '',
        categorie: value.categorie ?? '',
        from: value.from ?? '',
        to: value.to ?? '',
    };

    const set = (k, val) => onChange({ ...v, [k]: val });

    return (
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
                p: 1.5,
                bgcolor: '#F6F8FC',
                borderBottom: '1px solid #E8EEF7',
                position: 'sticky',
                top: 0,
                zIndex: 2,
            }}
        >
            <TextField
                size="small"
                placeholder="Rechercher un agent, un dossier, un motif…"
                value={v.q}
                onChange={(e) => set('q', e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#8FA6CE' }} />
                        </InputAdornment>
                    ),
                }}
                sx={{ minWidth: 260 }}
            />
            <TextField
                size="small"
                select
                label="Bureau"
                value={v.bureau}
                onChange={(e) => set('bureau', e.target.value)}
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">(Tous)</MenuItem>
                {bureauOptions.map((b) => (
                    <MenuItem key={b} value={b}>{b}</MenuItem>
                ))}
            </TextField>
            <TextField
                size="small"
                select
                label="Catégorie"
                value={v.categorie}
                onChange={(e) => set('categorie', e.target.value)}
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">(Toutes)</MenuItem>
                {categorieOptions.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
            </TextField>
            <TextField
                size="small"
                label="Du"
                type="date"
                value={v.from}
                onChange={(e) => set('from', e.target.value)}
                sx={{ minWidth: 160 }}
                InputLabelProps={{ shrink: true }}
            />
            <TextField
                size="small"
                label="Au"
                type="date"
                value={v.to}
                onChange={(e) => set('to', e.target.value)}
                sx={{ minWidth: 160 }}
                InputLabelProps={{ shrink: true }}
            />

            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                <Button
                    variant="outlined"
                    startIcon={<FilterAltIcon />}
                    onClick={onRefresh}
                    sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
                >
                    Appliquer
                </Button>
            </Stack>
        </Stack>
    );
}
