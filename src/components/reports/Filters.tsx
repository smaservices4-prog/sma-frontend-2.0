'use client';

import React from 'react';
import {
    Box,
    Button,
    Chip,
    Drawer,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from '@mui/material';
import { FilterList, ExpandMore } from '@mui/icons-material';
import { useFilters } from '@/context/FilterContext';

interface FiltersModalProps {
    yearOptions: number[];
}

function YearSelect({ options }: { options: number[] }) {
    const { year, setYear } = useFilters();
    const optionsWithAll = ['', ...options];

    return (
        <FormControl fullWidth size="small">
            <InputLabel>Año</InputLabel>
            <Select
                value={year}
                label="Año"
                onChange={(e) => setYear(e.target.value as number | '')}
            >
                {optionsWithAll.map((option) => (
                    <MenuItem key={option || 'all'} value={option}>
                        {option === '' ? 'Todos' : option}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

function StatusSelect() {
    const { status, setStatus } = useFilters();
    return (
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
    );
}

export function FiltersModal({ yearOptions }: FiltersModalProps) {
    const { sheetOpen, setSheetOpen, resetFilters } = useFilters();

    return (
        <Drawer
            anchor="bottom"
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            PaperProps={{ sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, p: 2.5 } }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterList color="action" />
                    <Typography variant="subtitle1" fontWeight={600}>
                        Filtros
                    </Typography>
                </Box>
                <IconButton size="small" onClick={() => setSheetOpen(false)}>
                    <ExpandMore />
                </IconButton>
            </Box>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <YearSelect options={yearOptions} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <StatusSelect />
                </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button variant="text" color="inherit" onClick={resetFilters}>
                    Limpiar
                </Button>
                <Button variant="contained" onClick={() => setSheetOpen(false)}>
                    Aplicar
                </Button>
            </Box>
        </Drawer>
    );
}

export function FiltersSummary({ onEdit }: { onEdit: () => void }) {
    const { year, status, resetFilters } = useFilters();
    const hasFilters = Boolean(year) || status !== 'all';

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" color="text.secondary">
                    Filtros
                </Typography>
                {hasFilters ? (
                    <>
                        {year ? <Chip label={`Año ${year}`} onDelete={() => resetFilters()} /> : null}
                        {status !== 'all' ? <Chip label={status === 'purchased' ? 'Comprado' : 'Disponible'} onDelete={() => resetFilters()} /> : null}
                    </>
                ) : (
                    <Chip label="Sin filtros" size="small" variant="outlined" />
                )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {hasFilters && (
                    <Button variant="text" color="inherit" onClick={resetFilters} sx={{ px: 1 }}>
                        Limpiar
                    </Button>
                )}
                <Button variant="outlined" size="small" onClick={onEdit}>
                    Editar filtros
                </Button>
            </Box>
        </Box>
    );
}
