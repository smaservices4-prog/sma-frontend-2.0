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
    reportId?: string;
    thumbnailFile?: File;
    thumbnailError?: string;
    thumbnailPreview?: string;
    thumbnailUploaded?: boolean;
    thumbnailUploadWarning?: string;
}

const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
const THUMBNAIL_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024;
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

const validateThumbnailFile = (file: File): string | null => {
    if (!THUMBNAIL_ACCEPTED_TYPES.includes(file.type)) {
        return 'Solo se permiten imágenes JPG, PNG o WEBP';
    }
    if (file.size > MAX_THUMBNAIL_SIZE_BYTES) {
        return 'La miniatura no puede superar los 5MB';
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
    const [warning, setWarning] = useState<string | null>(null);

    const [selectedEntries, setSelectedEntries] = useState<FileEntry[]>([]);
    const [defaultPrices, setDefaultPrices] = useState<PriceInput[]>(DEFAULT_PRICES);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!open) {
            // Revoke any preview URLs to avoid leaks
            selectedEntries.forEach(entry => {
                if (entry.thumbnailPreview) URL.revokeObjectURL(entry.thumbnailPreview);
            });
            // Reset when dialog closes
            setSelectedEntries([]);
            setDefaultPrices(DEFAULT_PRICES);
            setError(null);
            setSuccess(null);
            setWarning(null);
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

    const handleThumbnailSelect = (entryId: string, file?: File) => {
        setSelectedEntries(prev =>
            prev.map(entry => {
                if (entry.id !== entryId) return entry;
                if (entry.thumbnailPreview) URL.revokeObjectURL(entry.thumbnailPreview);
                if (!file) {
                    return { ...entry, thumbnailFile: undefined, thumbnailError: undefined, thumbnailPreview: undefined };
                }
                const errorMsg = validateThumbnailFile(file);
                if (errorMsg) {
                    return { ...entry, thumbnailFile: undefined, thumbnailError: errorMsg, thumbnailPreview: undefined };
                }
                const previewUrl = URL.createObjectURL(file);
                return { ...entry, thumbnailFile: file, thumbnailError: undefined, thumbnailPreview: previewUrl };
            })
        );
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
        setSelectedEntries(prev => {
            const updated = prev.filter(entry => {
                if (entry.id === id && entry.thumbnailPreview) {
                    URL.revokeObjectURL(entry.thumbnailPreview);
                }
                return entry.id !== id;
            });
            updateWarningFromEntries(updated);
            return updated;
        });
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

    const hasValidationErrors = selectedEntries.some(entry => !!validateFileEntry(entry) || !!entry.thumbnailError);

    const updateWarningFromEntries = (entries: FileEntry[]) => {
        const hasWarning = entries.some(e => e.thumbnailUploadWarning);
        setWarning(hasWarning ? 'Algunas miniaturas no se subieron. Podés reintentar la carga de miniatura.' : null);
    };

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
                }))
            }
        };
    };

    const buildThumbnailPayload = async (reportId: string, thumbnail: File) => {
        const arrayBuffer = await thumbnail.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
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

    const retryThumbnailUpload = async (entryId: string) => {
        const entry = selectedEntries.find(e => e.id === entryId);
        if (!entry || !entry.thumbnailFile || !entry.reportId) {
            setWarning('No se pudo reintentar la miniatura (falta archivo o ID de reporte).');
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            const thumbnailPayload = await buildThumbnailPayload(entry.reportId, entry.thumbnailFile);
            const resp = await storageApi.uploadThumbnail(thumbnailPayload);
            setSelectedEntries(prev => {
                const updated = prev.map(item => {
                    if (item.id !== entryId) return item;
                    const warn = resp.thumbnail_uploaded === false
                        ? resp.thumbnail_error || 'La miniatura no se pudo subir. Podés reintentar más tarde.'
                        : undefined;
                    return {
                        ...item,
                        thumbnailUploaded: resp.thumbnail_uploaded !== false,
                        thumbnailUploadWarning: warn
                    };
                });
                updateWarningFromEntries(updated);
                return updated;
            });
        } catch (err: any) {
            const warn = err?.message || 'La miniatura no se pudo subir. Podés reintentar más tarde.';
            setSelectedEntries(prev => {
                const updated = prev.map(item =>
                    item.id === entryId
                        ? { ...item, thumbnailUploaded: false, thumbnailUploadWarning: warn }
                        : item
                );
                updateWarningFromEntries(updated);
                return updated;
            });
        } finally {
            setUploading(false);
        }
    };

    const handleUploadReports = async () => {
        setError(null);
        setSuccess(null);
        setWarning(null);

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
                const uploadResponse = await storageApi.uploadFileWithMetadata(payload);

                let thumbnailWarning: string | undefined;
                let thumbnailUploaded: boolean | undefined;

                if (entry.thumbnailFile) {
                    try {
                        const thumbnailPayload = await buildThumbnailPayload(uploadResponse.report_id, entry.thumbnailFile);
                        const thumbnailResponse = await storageApi.uploadThumbnail(thumbnailPayload);

                        if (thumbnailResponse.thumbnail_uploaded === false) {
                            thumbnailWarning = thumbnailResponse.thumbnail_error || 'La miniatura no se pudo subir. Podés reintentar más tarde.';
                            thumbnailUploaded = false;
                        } else {
                            thumbnailUploaded = true;
                        }
                    } catch (thumbErr: any) {
                        thumbnailWarning = thumbErr?.message || 'La miniatura no se pudo subir. Podés reintentar más tarde.';
                        thumbnailUploaded = false;
                    }
                }

                successCount += 1;
                setSelectedEntries(prev => {
                    const updated: FileEntry[] = prev.map(item =>
                        item.id === entry.id
                            ? {
                                ...item,
                                status: 'success' as UploadStatus,
                                error: undefined,
                                reportId: uploadResponse.report_id,
                                thumbnailUploaded,
                                thumbnailUploadWarning: thumbnailWarning
                            }
                            : item
                    );
                    updateWarningFromEntries(updated);
                    return updated;
                });
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
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                                            gap: 2
                                        }}
                                    >
                                        {defaultPrices.map((price, idx) => (
                                            <TextField
                                                key={price.currency}
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
                                        ))}
                                    </Box>
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

                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
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
                                                {entry.metadata.prices.map((price, idx) => (
                                                    <TextField
                                                        key={price.currency}
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
                                                ))}
                                            </Box>
                                        </Box>

                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2C1810', mb: 1 }}>
                                                Miniatura (opcional)
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, minWidth: 0 }}>
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
                                                        {entry.thumbnailPreview ? (
                                                            <Box
                                                                component="img"
                                                                src={entry.thumbnailPreview}
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
                                                        {entry.thumbnailFile ? (
                                                            <>
                                                                <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {entry.thumbnailFile.name}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: '#8B6F47' }}>
                                                                    {(entry.thumbnailFile.size / 1024 / 1024).toFixed(2)} MB
                                                                </Typography>
                                                            </>
                                                        ) : (
                                                            <Typography variant="body2" sx={{ color: '#8B6F47' }}>
                                                                JPG, PNG o WEBP. Máx 5MB.
                                                            </Typography>
                                                        )}
                                                    </Box>
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
                                                            onChange={(e) => handleThumbnailSelect(entry.id, e.target.files?.[0])}
                                                        />
                                                    </Button>
                                                    {entry.thumbnailFile && (
                                                        <Button
                                                            variant="text"
                                                            color="inherit"
                                                            onClick={() => handleThumbnailSelect(entry.id, undefined)}
                                                            disabled={uploading}
                                                        >
                                                            Quitar
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Box>
                                            {entry.thumbnailError && (
                                                <Alert severity="error" sx={{ mt: 1 }}>
                                                    {entry.thumbnailError}
                                                </Alert>
                                            )}
                                            {entry.thumbnailUploadWarning && (
                                                <Alert severity="warning" sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        {entry.thumbnailUploadWarning}
                                                    </Box>
                                                    {entry.thumbnailFile && entry.reportId && (
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => retryThumbnailUpload(entry.id)}
                                                            disabled={uploading}
                                                        >
                                                            Reintentar miniatura
                                                        </Button>
                                                    )}
                                                </Alert>
                                            )}
                                        </Box>

                                        {entry.status === 'error' && (
                                            <Alert severity="error">
                                                {entry.error || 'Error al subir este archivo'}
                                            </Alert>
                                        )}
                                        {entry.status === 'success' && (
                                            <Alert severity="success">
                                                Subido correctamente
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </Box>

                {uploading && <LinearProgress sx={{ mt: 3, borderRadius: '4px' }} />}
                {success && <Alert severity="success" sx={{ mt: 3 }}>{success}</Alert>}
                {warning && <Alert severity="warning" sx={{ mt: 3 }}>{warning}</Alert>}
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

