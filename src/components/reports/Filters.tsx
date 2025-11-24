'use client';

import React, { useState } from 'react';
import {
    Box,
    Button,
    Collapse,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography,
    Paper,
    Chip,
    IconButton,
    Card,
    CardContent,
    Grid,
} from '@mui/material';
import { FilterList, Close, ExpandLess, ExpandMore } from '@mui/icons-material';
import { SearchFilters } from '@/types';

interface FiltersProps {
    year: number | '';
    setYear: (year: number | '') => void;
    status: 'purchased' | 'available' | 'all';
    setStatus: (status: 'purchased' | 'available' | 'all') => void;
}

export default function Filters({ year, setYear, status, setStatus }: FiltersProps) {
    const [expanded, setExpanded] = useState(true);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Card elevation={0} sx={{ mb: 4, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 0 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        cursor: 'pointer',
                        bgcolor: 'background.default',
                    }}
                    onClick={handleExpandClick}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterList color="action" />
                        <Typography variant="subtitle1" fontWeight={600}>
                            Filtros
                        </Typography>
                        {(year || status !== 'all') && (
                            <Chip
                                label="Activos"
                                size="small"
                                color="primary"
                                sx={{ height: 24 }}
                            />
                        )}
                    </Box>
                    <IconButton size="small">
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </Box>

                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Año</InputLabel>
                                    <Select
                                        value={year}
                                        label="Año"
                                        onChange={(e) => setYear(e.target.value as number | '')}
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value={2024}>2024</MenuItem>
                                        <MenuItem value={2023}>2023</MenuItem>
                                        <MenuItem value={2022}>2022</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={status}
                                        label="Estado"
                                        onChange={(e) => setStatus(e.target.value as 'purchased' | 'available' | 'all')}
                                    >
                                        <MenuItem value="all">Todos</MenuItem>
                                        <MenuItem value="purchased">Comprado</MenuItem>
                                        <MenuItem value="available">Disponible</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                    variant="text"
                                    color="inherit"
                                    onClick={() => {
                                        setYear('');
                                        setStatus('all');
                                    }}
                                    disabled={!year && status === 'all'}
                                >
                                    Limpiar filtros
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
}
