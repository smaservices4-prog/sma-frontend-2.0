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
    IconButton,
    Card,
    CardContent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Report } from '@/types';
import { storageApi } from '@/api/storage';
import { useAuthErrorHandler } from '@/hooks/useAuthErrorHandler';

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

const THUMBNAIL_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024;

export default function ReportEditDialog({ open, onClose, report, onUpdateSuccess }: ReportEditDialogProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailError, setThumbnailError] = useState<string | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const { checkError } = useAuthErrorHandler();

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
            setThumbnailFile(null);
            setThumbnailError(null);
            setWarning(null);
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
                setThumbnailPreview(null);
            }
        }
    }, [report]);

    useEffect(() => {
        return () => {
            if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        };
    }, [thumbnailPreview]);

    const validateThumbnailFile = (file: File): string | null => {
        if (!THUMBNAIL_ACCEPTED_TYPES.includes(file.type)) {
            return 'Solo se permiten imágenes JPG, PNG o WEBP';
        }
        if (file.size > MAX_THUMBNAIL_SIZE_BYTES) {
            return 'La miniatura no puede superar los 5MB';
        }
        return null;
    };

    const handleThumbnailSelect = (file?: File) => {
        if (!file) {
            setThumbnailFile(null);
            setThumbnailError(null);
            setWarning(null);
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
                setThumbnailPreview(null);
            }
            return;
        }
        const validation = validateThumbnailFile(file);
        if (validation) {
            setThumbnailError(validation);
            setThumbnailFile(null);
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
                setThumbnailPreview(null);
            }
            return;
        }
        setThumbnailFile(file);
        setThumbnailError(null);
        setWarning(null);
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        const previewUrl = URL.createObjectURL(file);
        setThumbnailPreview(previewUrl);
    };

    const buildThumbnailPayload = async (reportId: string, thumbnail: File) => {
        const buffer = await thumbnail.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        const fileData = Array.from(uint8Array);

        return {
            action: 'uploadThumbnail' as const,
            report_id: reportId,
            file: {
                name: thumbnail.name,
                size: thumbnail.size,
                type: thumbnail.type
            },
            fileData
        };
    };

    const handleRetryThumbnail = async () => {
        if (!report || !thumbnailFile) {
            setWarning('No se pudo reintentar la miniatura (falta archivo o ID).');
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            const thumbnailPayload = await buildThumbnailPayload(report.id, thumbnailFile);
            const resp = await storageApi.uploadThumbnail(thumbnailPayload);

            // Check for auth errors
            if (resp && typeof resp === 'object' && 'error' in resp) {
                checkError(resp.error);
                return; // Exit early if auth error was handled
            }

            if (resp.thumbnail_uploaded === false) {
                setWarning(resp.thumbnail_error || 'La miniatura no se pudo subir. Podés reintentar más tarde.');
            } else {
                setWarning(null);
            }
        } catch (err: any) {
            setWarning(err?.message || 'La miniatura no se pudo subir. Podés reintentar más tarde.');
        } finally {
            setUploading(false);
        }
    };

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
        if (thumbnailError) {
            setError(thumbnailError);
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(null);
        setWarning(null);

        try {
            if (!report) {
                throw new Error("No report selected");
            }

            // Format month for backend (YYYY-MM-DD)
            // We append -01 to match the storage format
            const formattedMonth = `${reportMetadata.month}-01`;

            const updateResult = await storageApi.updateMetadata(report.id, {
                title: reportMetadata.title,
                month: formattedMonth,
                prices: reportMetadata.prices,
                preview_url: reportMetadata.preview_url
            });

            // Check for auth errors
            if (updateResult && typeof updateResult === 'object' && 'error' in updateResult) {
                checkError(updateResult.error);
                return; // Exit early if auth error was handled
            }

            if (thumbnailFile) {
                let thumbWarning: string | null = null;
                try {
                    const thumbnailPayload = await buildThumbnailPayload(report.id, thumbnailFile);
                    const thumbnailResponse = await storageApi.uploadThumbnail(thumbnailPayload);

                    // Check for auth errors in thumbnail upload
                    if (thumbnailResponse && typeof thumbnailResponse === 'object' && 'error' in thumbnailResponse) {
                        checkError(thumbnailResponse.error);
                        thumbWarning = 'Authentication required for thumbnail upload';
                    } else if (thumbnailResponse.thumbnail_uploaded === false) {
                        thumbWarning = thumbnailResponse.thumbnail_error || 'La miniatura no se pudo subir. Podés reintentar más tarde.';
                    }
                } catch (thumbErr: any) {
                    thumbWarning = thumbErr?.message || 'La miniatura no se pudo subir. Podés reintentar más tarde.';
                }
                setWarning(thumbWarning);
            }

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
                    <Card
                        sx={{
                            border: '1px solid rgba(255, 140, 66, 0.2)',
                            borderLeft: '4px solid #FF8C42',
                            backgroundColor: '#FEF9F5'
                        }}
                    >
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Título del reporte"
                                    value={reportMetadata.title}
                                    onChange={(e) => setReportMetadata(prev => ({ ...prev, title: e.target.value }))}
                                    disabled={uploading}
                                    required
                                />

                                <FormControl fullWidth required>
                                    <InputLabel>Mes del reporte</InputLabel>
                                    <Select
                                        value={reportMetadata.month}
                                        label="Mes del reporte"
                                        onChange={(e) => setReportMetadata(prev => ({ ...prev, month: e.target.value }))}
                                        disabled={uploading}
                                        MenuProps={{
                                            PaperProps: { sx: { maxHeight: 320 } }
                                        }}
                                        sx={{
                                            height: 48,
                                            '& .MuiSelect-select': { display: 'flex', alignItems: 'center' }
                                        }}
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
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2C1810', mb: 1 }}>
                                    Precios por moneda *
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                                        gap: 1
                                    }}
                                >
                                    {reportMetadata.prices.map((price, index) => (
                                        <TextField
                                            key={price.currency}
                                            fullWidth
                                            label={price.currency}
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
                                        />
                                    ))}
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2C1810', mb: 1 }}>
                                    Miniatura (opcional)
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 72,
                                            height: 72,
                                            borderRadius: 1,
                                            overflow: 'hidden',
                                            bgcolor: '#F5F5F5',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {thumbnailPreview ? (
                                            <Box
                                                component="img"
                                                src={thumbnailPreview}
                                                alt="Miniatura seleccionada"
                                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <Typography variant="caption" sx={{ color: '#8B6F47', px: 1, textAlign: 'center' }}>
                                                Sin vista previa
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                        {thumbnailFile ? (
                                            <>
                                                <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {thumbnailFile.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#8B6F47' }}>
                                                    {(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography variant="body2" sx={{ color: '#8B6F47' }}>
                                                JPG, PNG o WEBP. Máx 5MB.
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            disabled={uploading}
                                            sx={{ color: '#FF8C42', borderColor: '#FF8C42', whiteSpace: 'nowrap' }}
                                        >
                                            Seleccionar imagen
                                            <input
                                                hidden
                                                type="file"
                                                accept={THUMBNAIL_ACCEPTED_TYPES.join(',')}
                                                onChange={(e) => handleThumbnailSelect(e.target.files?.[0])}
                                            />
                                        </Button>
                                        {thumbnailFile && (
                                            <Button
                                                variant="text"
                                                color="inherit"
                                                onClick={() => handleThumbnailSelect(undefined)}
                                                disabled={uploading}
                                            >
                                                Quitar
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                                {thumbnailError && <Alert severity="error" sx={{ mt: 1 }}>{thumbnailError}</Alert>}
                                {warning && (
                                    <Alert severity="warning" sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ flex: 1 }}>
                                            {warning}
                                        </Box>
                                        {report && thumbnailFile && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={handleRetryThumbnail}
                                                disabled={uploading}
                                            >
                                                Reintentar miniatura
                                            </Button>
                                        )}
                                    </Alert>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    {uploading && <LinearProgress sx={{ mt: 3, borderRadius: '4px' }} />}
                    {success && <Alert severity="success" sx={{ mt: 3 }}>{success}</Alert>}
                    {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose} disabled={uploading} color="inherit">
                    Cancelar
                </Button>
                <Button
                    onClick={handleUpdateReport}
                    variant="contained"
                    disabled={uploading || !reportMetadata.title.trim() || !reportMetadata.month || reportMetadata.prices.some(p => p.amount <= 0) || !!thumbnailError}
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
