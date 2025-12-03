import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Alert,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Report } from '@/types';
import { storageApi } from '@/api/storage';

interface ReportEditDialogProps {
    open: boolean;
    onClose: () => void;
    report: Report | null;
    onUpdateSuccess: () => void;
}

interface ReportMetadata {
    title: string;
    month: string;
    prices: Array<{
        currency: string;
        amount: number;
    }>;
    preview_url?: string;
}

export default function ReportEditDialog({ open, onClose, report, onUpdateSuccess }: ReportEditDialogProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [reportMetadata, setReportMetadata] = useState<ReportMetadata>({
        title: '',
        month: '',
        prices: [
            { currency: 'ARS', amount: 0 },
            { currency: 'USD', amount: 0 },
            { currency: 'EUR', amount: 0 }
        ],
        preview_url: ''
    });

    useEffect(() => {
        if (report) {
            // Parse month from report.month (YYYY-MM-DD) to YYYY-MM
            const month = report.month.substring(0, 7);
            setReportMetadata({
                title: report.title,
                month: month,
                prices: report.prices || [
                     { currency: 'ARS', amount: 0 },
                     { currency: 'USD', amount: 0 },
                     { currency: 'EUR', amount: 0 }
                ],
                preview_url: report.preview_url || ''
            });
        }
    }, [report]);

    const handleUpdateReport = async () => {
         if (!report && !reportMetadata.title.trim()) {
            setError('El título es requerido');
            return;
        }
        if (!reportMetadata.month) {
            setError('El mes es requerido');
            return;
        }

        const invalidPrices = reportMetadata.prices.filter(price => price.amount <= 0);
        if (invalidPrices.length > 0) {
            const currencies = invalidPrices.map(p => p.currency).join(', ');
            setError(`Los precios deben ser mayor a 0 para: ${currencies}`);
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            if (!report) {
                throw new Error("No report selected");
            }

            // Format month for backend (YYYY-MM-DD)
            // We append -01 to match the storage format
            const formattedMonth = `${reportMetadata.month}-01`;

            await storageApi.updateMetadata(report.id, {
                title: reportMetadata.title,
                month: formattedMonth,
                prices: reportMetadata.prices,
                preview_url: reportMetadata.preview_url
            });

            setSuccess('Reporte actualizado correctamente');
            
            setTimeout(() => {
                onUpdateSuccess();
                onClose();
                setSuccess(null);
            }, 1500);
            
        } catch (err: any) {
            setError(err.message || 'Error al actualizar el reporte');
        } finally {
            setUploading(false);
        }
    };
    
    const generateMonthOptions = () => {
        const months = [];
        const currentYear = new Date().getFullYear();
        // Allow editing past reports too
        for (let year = currentYear - 2; year <= currentYear + 2; year++) {
            for (let month = 0; month < 12; month++) {
                 const monthValue = `${year}-${(month + 1).toString().padStart(2, '0')}`;
                const monthNames = [
                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                ];
                const monthLabel = `${monthNames[month]} ${year}`;
                months.push({ value: monthValue, label: monthLabel });
            }
        }
        return months;
    };

    return (
         <Dialog open={open} onClose={!uploading ? onClose : undefined} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Editar Reporte
                {!uploading && (
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>
            <DialogContent dividers>
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Título del reporte"
                                    value={reportMetadata.title}
                                    onChange={(e) => setReportMetadata(prev => ({ ...prev, title: e.target.value }))}
                                    disabled={uploading}
                                    required
                                    sx={{ flex: 1 }}
                                />

                                <FormControl sx={{ flex: 1 }} required>
                                    <InputLabel>Mes del reporte</InputLabel>
                                    <Select
                                        value={reportMetadata.month}
                                        label="Mes del reporte"
                                        onChange={(e) => setReportMetadata(prev => ({ ...prev, month: e.target.value }))}
                                        disabled={uploading}
                                    >
                                        {generateMonthOptions().map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box>
                                <Typography variant="h6" sx={{ color: '#2C1810', fontWeight: 'bold', mb: 2 }}>
                                    Precios por moneda *
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {reportMetadata.prices.map((price, index) => (
                                        <Box
                                            key={price.currency}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                p: 2,
                                                backgroundColor: '#FEF9F5',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255, 140, 66, 0.2)'
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: '60px' }}>
                                                {price.currency}:
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                label={`Precio en ${price.currency}`}
                                                type="number"
                                                value={price.amount || ''}
                                                onChange={(e) => {
                                                    const newPrices = [...reportMetadata.prices];
                                                    newPrices[index] = {
                                                        ...newPrices[index],
                                                        amount: Number(e.target.value)
                                                    };
                                                    setReportMetadata(prev => ({ ...prev, prices: newPrices }));
                                                }}
                                                disabled={uploading}
                                                required
                                                size="small"
                                                sx={{ bgcolor: '#FFFFFF' }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            <TextField
                                fullWidth
                                label="URL de vista previa (opcional)"
                                value={reportMetadata.preview_url}
                                onChange={(e) => setReportMetadata(prev => ({ ...prev, preview_url: e.target.value }))}
                                disabled={uploading}
                                placeholder="https://ejemplo.com/preview.jpg"
                            />
                        </Box>

                {uploading && <LinearProgress sx={{ mt: 3, borderRadius: '4px' }} />}
                {success && <Alert severity="success" sx={{ mt: 3 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose} disabled={uploading} color="inherit">
                    Cancelar
                </Button>
                <Button
                    onClick={handleUpdateReport}
                    variant="contained"
                    disabled={uploading || !reportMetadata.title.trim() || !reportMetadata.month || reportMetadata.prices.some(p => p.amount <= 0)}
                    sx={{
                        backgroundColor: '#FF8C42',
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: '#E67A32' }
                    }}
                >
                    {uploading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
