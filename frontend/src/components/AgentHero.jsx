// src/components/AgentHero.jsx
import React from 'react';
import {
    Box, Container, Stack, Typography, TextField,
    InputAdornment, IconButton, Button, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

const PORTNET_BLUE = '#0B3D91';
const BTN_BLUE = '#1D4ED8';
const BTN_BLUE_H = '#1E40AF';

/**
 * AgentHero – bandeau de page unifié pour les pages Agent
 *
 * Props:
 * - title: string
 * - subtitle?: string
 * - chips?: ReactNode[]
 * - search?: { value: string, onChange: (e)=>void, placeholder?: string }
 * - onRefresh?: ()=>void
 * - primaryAction?: { label: string, icon?: ReactNode, onClick: ()=>void }
 * - rightExtra?: ReactNode
 */
export default function AgentHero({
                                      title, subtitle, chips = [], search, onRefresh, primaryAction, rightExtra,
                                  }) {
    return (
        <Box
            sx={{
                background: `linear-gradient(140deg, ${PORTNET_BLUE} 0%, #1E5FD6 45%, #4DA9FF 100%)`,
                color: 'white',
                py: { xs: 3, md: 4 },
                mb: 3,
                boxShadow: '0 12px 36px rgba(11,61,145,0.28)', // ✅ apostrophes correctes
                borderBottomLeftRadius: 28,
                borderBottomRightRadius: 28,
                width: '100%',
            }}
        >
            {/* plein écran : pas de maxWidth */}
            <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, md: 3 } }}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent="space-between"
                    gap={2}
                >
                    {/* Left: title / subtitle / chips */}
                    <Stack spacing={0.5}>
                        <Typography variant="h4" fontWeight={900} letterSpacing={0.3}>
                            {title}
                        </Typography>
                        {subtitle && <Typography sx={{ opacity: 0.95 }}>{subtitle}</Typography>}
                        {chips?.length > 0 && (
                            <Stack direction="row" spacing={1.2} mt={1.2} useFlexGap flexWrap="wrap">
                                {chips.map((chip, i) => (
                                    <React.Fragment key={i}>{chip}</React.Fragment>
                                ))}
                            </Stack>
                        )}
                    </Stack>

                    {/* Right: search / refresh / primary / extras */}
                    <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap">
                        {search && (
                            <TextField
                                size="small"
                                placeholder={search.placeholder || 'Rechercher…'}
                                value={search.value}
                                onChange={search.onChange}
                                sx={{
                                    minWidth: 300,
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    borderRadius: 2,
                                    input: { color: 'white' },
                                    '& .MuiInputBase-root': { color: 'white' },
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
                                    '&:hover fieldset': { borderColor: 'white' },
                                    backdropFilter: 'blur(8px)',
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'white' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}

                        {onRefresh && (
                            <Tooltip title="Rafraîchir">
                <span>
                  <IconButton
                      onClick={onRefresh}
                      sx={{
                          bgcolor: 'rgba(255,255,255,0.15)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
                          backdropFilter: 'blur(6px)',
                      }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </span>
                            </Tooltip>
                        )}

                        {primaryAction && (
                            <Button
                                onClick={primaryAction.onClick}
                                startIcon={primaryAction.icon || null}
                                sx={{
                                    px: 2.1,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    color: 'white',
                                    bgcolor: BTN_BLUE,
                                    boxShadow: '0 10px 22px rgba(0,0,0,0.15)',
                                    '&:hover': { bgcolor: BTN_BLUE_H, transform: 'translateY(-1px)' },
                                    transition: 'all .2s ease',
                                }}
                            >
                                {primaryAction.label}
                            </Button>
                        )}

                        {rightExtra}
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}
