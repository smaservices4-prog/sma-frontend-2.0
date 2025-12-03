import React, { useRef, useState } from 'react';
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
    Card,
    CardContent,
    IconButton
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import { storageApi, UploadFileRequest } from '@/api/storage';

interface ReportUploadDialogProps {
    open: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
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

export default function ReportUploadDialog({ open, onClose, onUploadSuccess }: ReportUploadDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
        setReportMetadata(prev => ({
            ...prev,
            title: nameWithoutExtension
        }));
    };

    const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
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

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const acceptedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

            if (acceptedTypes.includes(fileExtension)) {
                handleFileSelect(file);
            } else {
                setError('Tipo de archivo no soportado. Solo se permiten PDF, DOC, DOCX, XLS, XLSX');
            }
        }
    };

    const handleUploadReport = async () => {
        if (!selectedFile) {
            setError('Por favor selecciona un archivo');
            return;
        }

        if (!reportMetadata.title.trim()) {
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
            const arrayBuffer = await selectedFile.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const fileData = Array.from(uint8Array);

            const requestData: UploadFileRequest = {
                action: "uploadFile",
                file: {
                    name: selectedFile.name,
                    size: selectedFile.size,
                    type: selectedFile.type
                },
                fileData,
                report_metadata: {
                    title: reportMetadata.title.trim(),
                    month: `${reportMetadata.month}-01`,
                    prices: reportMetadata.prices.map(price => ({
                        currency: price.currency,
                        amount: Number(price.amount)
                    })),
                    ...(reportMetadata.preview_url?.trim() && { preview_url: reportMetadata.preview_url.trim() })
                }
            };

            await storageApi.uploadFileWithMetadata(requestData);
            setSuccess(`Reporte subido correctamente: ${reportMetadata.title}`);

            // Reset form
            setSelectedFile(null);
            setReportMetadata({
                title: '',
                month: '',
                prices: [
                    { currency: 'ARS', amount: 0 },
                    { currency: 'USD', amount: 0 },
                    { currency: 'EUR', amount: 0 }
                ],
                preview_url: ''
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            
            setTimeout(() => {
                onUploadSuccess();
                onClose();
                setSuccess(null);
            }, 1500);

        } catch (err: any) {
            setError(err.message || 'Error al subir el reporte');
        } finally {
            setUploading(false);
        }
    };

    const generateMonthOptions = () => {
        const months = [];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        for (let year = currentYear; year <= currentYear + 2; year++) {
            for (let month = 0; month < 12; month++) {
                if (year === currentYear && month < currentMonth) continue;

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
                                backgroundColor: selectedFile ? '#F0F9F0' : isDragging ? '#E8F5E8' : '#FEF9F5',
                                borderRadius: '8px',
                                border: selectedFile
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
                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                />

                                {selectedFile ? (
                                    <Box>
                                        <UploadFileIcon sx={{ fontSize: 48, color: '#4ADE80', mb: 1 }} />
                                        <Typography variant="h6" sx={{ color: '#2C1810', fontWeight: 'bold', mb: 1 }}>
                                            {selectedFile.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#8B6F47', mb: 2 }}>
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
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
                                            {isDragging ? 'Suelta el archivo aquí' : 'Arrastra y suelta o haz clic para seleccionar'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#8B6F47', mb: 2 }}>
                                            Soporta PDF, DOC, DOCX, XLS, XLSX
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

                    {selectedFile && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                    onClick={handleUploadReport}
                    variant="contained"
                    disabled={uploading || !selectedFile || !reportMetadata.title.trim() || !reportMetadata.month || reportMetadata.prices.some(p => p.amount <= 0)}
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

