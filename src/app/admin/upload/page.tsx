'use client';

import { useRef, useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Alert,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    ListItemAvatar,
    Avatar,
    IconButton,
    Paper,
    Divider,
    Chip,
    Dialog,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { storageApi, UploadFileRequest } from '@/api/storage';
import { AdminFileItem } from '@/types';
import { useExchangeRates } from '@/context/ExchangeRateContext';

interface ReportMetadata {
    title: string;
    month: string;
    prices: Array<{
        currency: string;
        amount: number;
    }>;
    preview_url?: string;
}

export default function AdminUploadPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [files, setFiles] = useState<AdminFileItem[]>([]);
    const [deletingFile, setDeletingFile] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Estados para el formulario de metadatos
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

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await storageApi.listFiles();
            setFiles(result.files || []);
        } catch (err: any) {
            setError(err.message || 'Error al cargar archivos');
        } finally {
            setLoading(false);
        }
    };

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
        setSuccess(null);
        setError(null);

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

            await loadFiles();
        } catch (err: any) {
            setError(err.message || 'Error al subir el reporte');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = async (filePath: string) => {
        setDeletingFile(filePath);
        setError(null);
        try {
            await storageApi.deleteFile(filePath);
            setSuccess('Archivo eliminado correctamente');
            await loadFiles();
        } catch (err: any) {
            setError(err.message || 'Error al eliminar el archivo');
        } finally {
            setDeletingFile(null);
        }
    };

    const handleGetFileUrl = async (filePath: string) => {
        try {
            const result = await storageApi.getFileUrl(filePath);
            window.open(result.url, '_blank');
        } catch (err: any) {
            setError(err.message || 'Error al obtener la URL del archivo');
        }
    };

    const handlePreviewFile = async (filePath: string) => {
        setPreviewLoading(true);
        setError(null);
        try {
            const result = await storageApi.getFileUrl(filePath);
            setPreviewUrl(result.url);
            setPreviewOpen(true);
        } catch (err: any) {
            setError(err.message || 'Error al cargar la vista previa');
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleClosePreview = () => {
        setPreviewOpen(false);
        setPreviewUrl(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-ES');
    };

    const isPdfFile = (fileName: string | undefined) => {
        if (!fileName || typeof fileName !== 'string') return false;
        return fileName.toLowerCase().endsWith('.pdf');
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
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 3 }}>
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 8px rgba(255, 140, 66, 0.07)', border: '1px solid rgba(255, 140, 66, 0.2)' }}>
                <Typography variant="h5" sx={{ mb: 3, color: '#2C1810', fontWeight: 'bold', textAlign: 'center' }}>
                    Subir Nuevo Reporte
                </Typography>

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

                            <Box sx={{ textAlign: 'center' }}>
                                <Button
                                    variant="contained"
                                    onClick={handleUploadReport}
                                    disabled={uploading || !selectedFile || !reportMetadata.title.trim() || !reportMetadata.month || reportMetadata.prices.some(p => p.amount <= 0)}
                                    sx={{
                                        backgroundColor: '#FF8C42',
                                        color: '#FFFFFF',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        '&:hover': { backgroundColor: '#E67A32' },
                                        '&:disabled': { backgroundColor: '#FFB88A' }
                                    }}
                                >
                                    {uploading ? 'Subiendo reporte...' : 'Subir reporte'}
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>

                {uploading && <LinearProgress sx={{ mt: 3, borderRadius: '4px' }} />}
                {success && <Alert severity="success" sx={{ mt: 3 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
            </Paper>

            <Paper sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, boxShadow: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#2C1810', fontWeight: 'bold' }}>
                        Archivos subidos
                    </Typography>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={loadFiles}
                        disabled={loading}
                        sx={{ color: '#FF8C42' }}
                    >
                        Actualizar
                    </Button>
                </Box>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {files.length === 0 ? (
                    <Typography sx={{ color: '#8B6F47', textAlign: 'center', py: 4 }}>
                        No hay archivos subidos
                    </Typography>
                ) : (
                    <List>
                        {files.map((file, index) => (
                            <Box key={file.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        gap: 2,
                                        py: 2,
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: '#FF8C42' }}>
                                            <PictureAsPdfIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <Box sx={{ flex: 1, width: '100%' }}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                        {file.title || file.file_path}
                                                    </Typography>

                                                    {file.prices && file.prices.length > 0 && (
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                            {file.prices.map((price, idx) => (
                                                                <Chip
                                                                    key={idx}
                                                                    label={`${price.currency} ${price.amount}`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="caption" sx={{ color: '#8B6F47' }}>
                                                    Creado: {formatDate(file.created_at)}
                                                </Typography>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            {isPdfFile(file.file_path) && (
                                                <IconButton
                                                    onClick={() => handlePreviewFile(file.file_path)}
                                                    disabled={previewLoading}
                                                    sx={{ color: '#2196F3' }}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                onClick={() => handleGetFileUrl(file.file_path)}
                                                sx={{ color: '#FF8C42' }}
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDeleteFile(file.file_path)}
                                                disabled={deletingFile === file.file_path}
                                                sx={{ color: '#E53935' }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </Box>
                                </ListItem>
                                {index < files.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </List>
                )}
            </Paper>

            <Dialog
                open={previewOpen}
                onClose={handleClosePreview}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { height: '90vh', maxHeight: '90vh' }
                }}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                        <Typography variant="h6">Vista Previa</Typography>
                        <Button onClick={handleClosePreview}>Cerrar</Button>
                    </Box>
                    <Box sx={{ flex: 1, bgcolor: '#f5f5f5', p: 2 }}>
                        {previewUrl && (
                            <iframe
                                src={previewUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 'none', backgroundColor: 'white' }}
                                title="PDF Preview"
                            />
                        )}
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
}
