import React, { useRef, useState, useEffect } from 'react';
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
    Card,
    CardContent,
    IconButton,
    Grid,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import { storageApi, UploadFileRequest } from '@/api/storage';

interface ReportUploadDialogProps {
    open: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}

interface PriceInput {
    currency: string;
    amount: number;
}

interface ReportMetadata {
    title: string;
    month: string;
    prices: PriceInput[];
    preview_url?: string;
}

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

interface FileEntry {
    id: string;
    file: File;
    metadata: ReportMetadata;
    status: UploadStatus;
    error?: string;
}

const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
const DEFAULT_PRICES: PriceInput[] = [
    { currency: 'ARS', amount: 0 },
    { currency: 'USD', amount: 0 },
    { currency: 'EUR', amount: 0 }
];

const getCurrentMonthValue = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = `${now.getMonth() + 1}`.padStart(2, '0');
    return `${y}-${m}`;
};

const buildFileId = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

const buildMetadataFromFile = (file: File, pricesTemplate: PriceInput[]): ReportMetadata => {
    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
    return {
        title: nameWithoutExtension,
        month: getCurrentMonthValue(),
        prices: pricesTemplate.map(price => ({ ...price })),
        preview_url: ''
    };
};

const validateFileEntry = (entry: FileEntry): string | null => {
    if (!entry.metadata.title.trim()) return 'El título es requerido';
    if (!entry.metadata.month) return 'El mes es requerido';
    if (!entry.metadata.prices.length) return 'Debes ingresar precios';
    const invalidPrices = entry.metadata.prices.filter(price => price.amount <= 0);
    if (invalidPrices.length > 0) {
        const currencies = invalidPrices.map(p => p.currency).join(', ');
        return `Los precios deben ser mayor a 0 para: ${currencies}`;
    }

    const extension = `.${entry.file.name.split('.').pop()?.toLowerCase()}`;
    if (!ACCEPTED_TYPES.includes(extension)) {
        return 'Tipo de archivo no soportado. Solo se permiten PDF, DOC, DOCX, XLS, XLSX';
    }

    return null;
};

const extractFilesFromDataTransfer = (dataTransfer: DataTransfer): File[] => {
    const files: File[] = [];
    if (dataTransfer.items) {
        for (let i = 0; i < dataTransfer.items.length; i += 1) {
            const item = dataTransfer.items[i];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) files.push(file);
            }
        }
    }
    if (files.length === 0 && dataTransfer.files) {
        for (let i = 0; i < dataTransfer.files.length; i += 1) {
            const file = dataTransfer.files[i];
            if (file) files.push(file);
        }
    }
    return files;
};

export default function ReportUploadDialog({ open, onClose, onUploadSuccess }: ReportUploadDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [selectedEntries, setSelectedEntries] = useState<FileEntry[]>([]);
    const [defaultPrices, setDefaultPrices] = useState<PriceInput[]>(DEFAULT_PRICES);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!open) {
            // Reset when dialog closes
            setSelectedEntries([]);
            setDefaultPrices(DEFAULT_PRICES);
            setError(null);
            setSuccess(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [open]);

    const addFiles = (incomingFiles: File[]) => {
        if (incomingFiles.length === 0) return;

        const validFiles: File[] = [];
        const invalid = new Set<string>();

        incomingFiles.forEach(file => {
            const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
            if (!ACCEPTED_TYPES.includes(extension)) {
                invalid.add(extension);
                return;
            }
            validFiles.push(file);
        });

        if (invalid.size > 0) {
            setError('Tipo de archivo no soportado. Solo se permiten PDF, DOC, DOCX, XLS, XLSX');
        }

        if (validFiles.length === 0) return;

        setSelectedEntries(prev => {
            const existingIds = new Set(prev.map(entry => entry.id));
            const newEntries = validFiles
                .filter(file => !existingIds.has(buildFileId(file)))
                .map(file => ({
                    id: buildFileId(file),
                    file,
                    metadata: buildMetadataFromFile(file, defaultPrices),
                    status: 'pending' as UploadStatus
                }));
            return [...prev, ...newEntries];
        });
    };

    const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filesList = e.target.files ? Array.from(e.target.files) : [];
        addFiles(filesList);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const filesList = extractFilesFromDataTransfer(e.dataTransfer);
        addFiles(filesList);
    };

    const handleRemoveSelected = (id: string) => {
        setSelectedEntries(prev => prev.filter(entry => entry.id !== id));
    };

    const updateEntryMetadata = (id: string, updater: (meta: ReportMetadata) => ReportMetadata) => {
        setSelectedEntries(prev =>
            prev.map(entry =>
                entry.id === id ? { ...entry, metadata: updater(entry.metadata) } : entry
            )
        );
    };

    const handleApplyDefaultPricesToAll = () => {
        setSelectedEntries(prev =>
            prev.map(entry => ({
                ...entry,
                metadata: {
                    ...entry.metadata,
                    prices: defaultPrices.map(price => ({ ...price }))
                }
            }))
        );
    };

    const hasValidationErrors = selectedEntries.some(entry => !!validateFileEntry(entry));

    const generateMonthOptions = () => {
        const months = [];
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        const currentYear = new Date().getFullYear();
        // Amplio rango (sin límites prácticos para el admin)
        const startYear = currentYear - 100;
        const endYear = currentYear + 50;

        for (let year = startYear; year <= endYear; year++) {
            for (let month = 0; month < 12; month++) {
                const monthValue = `${year}-${(month + 1).toString().padStart(2, '0')}`;
                const monthLabel = `${monthNames[month]} ${year}`;
                months.push({ value: monthValue, label: monthLabel });
            }
        }
        return months;
    };

    const buildUploadPayload = async (entry: FileEntry): Promise<UploadFileRequest> => {
        const arrayBuffer = await entry.file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const fileData = Array.from(uint8Array);

        return {
            action: 'uploadFile',
            file: {
                name: entry.file.name,
                size: entry.file.size,
                type: entry.file.type
            },
            fileData,
            report_metadata: {
                title: entry.metadata.title.trim(),
                month: `${entry.metadata.month}-01`,
                prices: entry.metadata.prices.map(price => ({
                    currency: price.currency,
                    amount: Number(price.amount)
                })),
                ...(entry.metadata.preview_url?.trim() && { preview_url: entry.metadata.preview_url.trim() })
            }
        };
    };

    const handleUploadReports = async () => {
        setError(null);
        setSuccess(null);

        if (selectedEntries.length === 0) {
            setError('Por favor selecciona al menos un archivo');
            return;
        }

        const firstError = selectedEntries
            .map(entry => validateFileEntry(entry))
            .find(msg => msg !== null);

        if (firstError) {
            setError(firstError);
            return;
        }

        setUploading(true);
        setSelectedEntries(prev => prev.map(entry => ({ ...entry, status: 'uploading', error: undefined })));

        let successCount = 0;
        let failureCount = 0;

        for (const entry of selectedEntries) {
            try {
                const payload = await buildUploadPayload(entry);
                await storageApi.uploadFileWithMetadata(payload);
                successCount += 1;
                setSelectedEntries(prev =>
                    prev.map(item =>
                        item.id === entry.id ? { ...item, status: 'success', error: undefined } : item
                    )
                );
            } catch (err: any) {
                failureCount += 1;
                const message = err?.message || 'Error al subir el reporte';
                setSelectedEntries(prev =>
                    prev.map(item =>
                        item.id === entry.id ? { ...item, status: 'error', error: message } : item
                    )
                );
            }
        }

        if (successCount > 0) {
            setSuccess(`Subidos ${successCount} de ${selectedEntries.length} archivos`);
            onUploadSuccess();
        }

        if (failureCount > 0) {
            setError('Algunos archivos no se pudieron subir. Revisá los errores e intentá de nuevo.');
        } else {
            setTimeout(() => {
                setSelectedEntries([]);
                setDefaultPrices(DEFAULT_PRICES);
                onClose();
            }, 600);
        }

        setUploading(false);
    };

    return (
        <Dialog open={open} onClose={!uploading ? onClose : undefined} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Subir Nuevo Reporte
                {!uploading && (
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>
            <DialogContent dividers>
                <Box>
                    <Box sx={{ mb: 3 }}>
                        <Card
                            sx={{
                                backgroundColor: selectedEntries.length ? '#F0F9F0' : isDragging ? '#E8F5E8' : '#FEF9F5',
                                borderRadius: '8px',
                                border: selectedEntries.length
                                    ? '2px solid #4ADE80'
                                    : isDragging
                                        ? '2px solid #4ADE80'
                                        : '2px dashed rgba(255, 140, 66, 0.3)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handleInputFileChange}
                                    disabled={uploading}
                                    accept={ACCEPTED_TYPES.join(',')}
                                    multiple
                                />

                                {selectedEntries.length === 1 ? (
                                    <Box>
                                        <UploadFileIcon sx={{ fontSize: 48, color: '#4ADE80', mb: 1 }} />
                                        <Typography variant="h6" sx={{ color: '#2C1810', fontWeight: 'bold', mb: 1 }}>
                                            {selectedEntries[0].file.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#8B6F47', mb: 2 }}>
                                            {(selectedEntries[0].file.size / 1024 / 1024).toFixed(2)} MB
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                            disabled={uploading}
                                            sx={{
                                                color: '#FF8C42',
                                                borderColor: '#FF8C42',
                                                '&:hover': { backgroundColor: '#FF8C42', color: '#FFFFFF' }
                                            }}
                                        >
                                            Cambiar archivo
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box>
                                        <UploadFileIcon sx={{
                                            fontSize: 48,
                                            color: isDragging ? '#4ADE80' : '#8B6F47',
                                            mb: 1,
                                            transition: 'color 0.3s ease'
                                        }} />
                                        <Typography variant="h6" sx={{ color: '#2C1810', fontWeight: 'bold', mb: 1 }}>
                                            {isDragging ? 'Soltá los archivos aquí' : 'Arrastrá y soltá o hacé clic para seleccionar (multi)'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#8B6F47', mb: 2 }}>
                                            Soporta PDF, DOC, DOCX, XLS, XLSX
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#4ADE80', fontWeight: 600 }}>
                                            {selectedEntries.length > 0
                                                ? `${selectedEntries.length} archivo(s) listos`
                                                : 'No hay archivos seleccionados'}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                            disabled={uploading}
                                            sx={{
                                                backgroundColor: '#FF8C42',
                                                color: '#FFFFFF',
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                '&:hover': { backgroundColor: '#E67A32' }
                                            }}
                                        >
                                            Seleccionar archivo
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Box>

                    {selectedEntries.length > 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Card sx={{ border: '1px solid rgba(255, 140, 66, 0.2)' }}>
                                <CardContent>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        Precios por defecto (aplicar a todos)
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {defaultPrices.map((price, idx) => (
                                            <Grid item xs={12} sm={4} key={price.currency}>
                                                <TextField
                                                    fullWidth
                                                    label={`Precio ${price.currency}`}
                                                    type="number"
                                                    value={price.amount || ''}
                                                    onChange={(e) => {
                                                        const newPrices = [...defaultPrices];
                                                        newPrices[idx] = { ...newPrices[idx], amount: Number(e.target.value) };
                                                        setDefaultPrices(newPrices);
                                                    }}
                                                    size="small"
                                                    disabled={uploading}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                    <Button
                                        variant="outlined"
                                        sx={{ mt: 2, color: '#FF8C42', borderColor: '#FF8C42' }}
                                        onClick={handleApplyDefaultPricesToAll}
                                        disabled={uploading || selectedEntries.length === 0}
                                    >
                                        Aplicar a todos
                                    </Button>
                                </CardContent>
                            </Card>

                            {selectedEntries.map(entry => (
                                <Card
                                    key={entry.id}
                                    sx={{
                                        border: '1px solid rgba(255, 140, 66, 0.2)',
                                        borderLeft: '4px solid #FF8C42',
                                        backgroundColor: '#FEF9F5'
                                    }}
                                >
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    {entry.file.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#8B6F47' }}>
                                                    {(entry.file.size / 1024 / 1024).toFixed(2)} MB
                                                </Typography>
                                            </Box>
                                            <IconButton
                                                onClick={() => handleRemoveSelected(entry.id)}
                                                disabled={uploading}
                                                sx={{ color: '#E53935' }}
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                        </Box>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Título del reporte"
                                                    value={entry.metadata.title}
                                                    onChange={(e) =>
                                                        updateEntryMetadata(entry.id, meta => ({
                                                            ...meta,
                                                            title: e.target.value
                                                        }))
                                                    }
                                                    disabled={uploading}
                                                    required
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <FormControl
                                                    fullWidth
                                                    required
                                                    sx={{ minWidth: 220 }}
                                                >
                                                    <InputLabel>Mes del reporte</InputLabel>
                                                    <Select
                                                        value={entry.metadata.month}
                                                        label="Mes del reporte"
                                                        onChange={(e) =>
                                                            updateEntryMetadata(entry.id, meta => ({
                                                                ...meta,
                                                                month: e.target.value
                                                            }))
                                                        }
                                                        disabled={uploading}
                                                        MenuProps={{
                                                            PaperProps: { sx: { maxHeight: 320 } }
                                                        }}
                                                        sx={{
                                                            height: 48,
                                                            '& .MuiSelect-select': { display: 'flex', alignItems: 'center' }
                                                        }}
                                                    >
                                                        {generateMonthOptions().map(option => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2C1810', mb: 1 }}>
                                                    Precios por moneda *
                                                </Typography>
                                                <Grid container spacing={1}>
                                                    {entry.metadata.prices.map((price, idx) => (
                                                        <Grid item xs={12} sm={4} key={price.currency}>
                                                            <TextField
                                                                fullWidth
                                                                label={`${price.currency}`}
                                                                type="number"
                                                                value={price.amount || ''}
                                                                onChange={(e) => {
                                                                    const newPrice = Number(e.target.value);
                                                                    updateEntryMetadata(entry.id, meta => {
                                                                        const newPrices = [...meta.prices];
                                                                        newPrices[idx] = { ...newPrices[idx], amount: newPrice };
                                                                        return { ...meta, prices: newPrices };
                                                                    });
                                                                }}
                                                                size="small"
                                                                disabled={uploading}
                                                            />
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="URL de vista previa (opcional)"
                                                    value={entry.metadata.preview_url}
                                                    onChange={(e) =>
                                                        updateEntryMetadata(entry.id, meta => ({
                                                            ...meta,
                                                            preview_url: e.target.value
                                                        }))
                                                    }
                                                    disabled={uploading}
                                                    placeholder="https://ejemplo.com/preview.jpg"
                                                />
                                            </Grid>
                                            {entry.status === 'error' && (
                                                <Grid item xs={12}>
                                                    <Alert severity="error">
                                                        {entry.error || 'Error al subir este archivo'}
                                                    </Alert>
                                                </Grid>
                                            )}
                                            {entry.status === 'success' && (
                                                <Grid item xs={12}>
                                                    <Alert severity="success">
                                                        Subido correctamente
                                                    </Alert>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
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
                    onClick={handleUploadReports}
                    variant="contained"
                    disabled={uploading || selectedEntries.length === 0 || hasValidationErrors}
                    sx={{
                        backgroundColor: '#FF8C42',
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: '#E67A32' }
                    }}
                >
                    {uploading ? 'Subiendo...' : 'Subir Reporte'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

