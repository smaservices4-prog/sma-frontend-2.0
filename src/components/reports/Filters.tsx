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
    Stack,
    Typography,
} from '@mui/material';
import { FilterList, ExpandMore } from '@mui/icons-material';
import { useFilters } from '@/context/FilterContext';

function YearSelect({ fullWidth = false }: { fullWidth?: boolean }) {
    const { year, setYear, availableYears } = useFilters();
    const options = React.useMemo(() => ['' as const, ...availableYears], [availableYears]);

    return (
        <FormControl size="small" fullWidth={fullWidth} sx={fullWidth ? { width: '100%' } : { minWidth: 110, width: 'auto' }}>
            <InputLabel>Año</InputLabel>
            <Select
                value={year}
                label="Año"
                onChange={(e) => setYear(e.target.value as number | '')}
            >
                {options.map((option) => (
                    <MenuItem key={option || 'all'} value={option}>
                        {option === '' ? 'Todos' : option}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

function StatusSelect({ fullWidth = false }: { fullWidth?: boolean }) {
    const { status, setStatus, availableStatuses } = useFilters();
    const options = React.useMemo(() => ['all' as const, ...availableStatuses], [availableStatuses]);
    return (
        <FormControl size="small" fullWidth={fullWidth} sx={fullWidth ? { width: '100%' } : { minWidth: 120, width: 'auto' }}>
            <InputLabel>Estado</InputLabel>
            <Select
                value={status}
                label="Estado"
                onChange={(e) => setStatus(e.target.value as 'purchased' | 'available' | 'all')}
            >
                {options.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option === 'all' ? 'Todos' : option === 'purchased' ? 'Comprado' : 'Disponible'}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export function FiltersModal() {
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
                    <YearSelect fullWidth />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <StatusSelect fullWidth />
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

export function FiltersInlineControls() {
    const { year, status, resetFilters } = useFilters();
    const appliedCount = (year ? 1 : 0) + (status !== 'all' ? 1 : 0);

    return (
        <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
                flexWrap: 'wrap',
                rowGap: 0.5,
                columnGap: 1,
            }}
        >
            <Box sx={{ flex: '0 0 auto' }}>
                <YearSelect />
            </Box>
            <Box sx={{ flex: '0 0 auto' }}>
                <StatusSelect />
            </Box>
            {appliedCount > 0 && (
                <Button variant="text" size="small" color="inherit" onClick={resetFilters} sx={{ minWidth: 64 }}>
                    Limpiar
                </Button>
            )}
        </Stack>
    );
}
