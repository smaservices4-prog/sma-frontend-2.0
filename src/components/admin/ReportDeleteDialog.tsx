import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Box
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { Report } from '@/types';
import { storageApi } from '@/api/storage';
import { useAuthErrorHandler } from '@/hooks/useAuthErrorHandler';

interface ReportDeleteDialogProps {
    open: boolean;
    onClose: () => void;
    report: Report | null;
    onDeleteSuccess: () => void;
}

export default function ReportDeleteDialog({ open, onClose, report, onDeleteSuccess }: ReportDeleteDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { checkError } = useAuthErrorHandler();

    const handleDelete = async () => {
        if (!report) return;

        setLoading(true);
        setError(null);

        try {
            const result = await storageApi.deleteReport(report.id);

            // Check for auth errors
            if (result && typeof result === 'object' && 'error' in result) {
                if (checkError(result.error)) {
                    // Auth error handled by hook
                    return;
                }
                // Handle specific errors
                if (result.error.includes('adquirido por usuarios')) {
                    setError(result.error);
                } else {
                    setError('Error al eliminar el reporte: ' + result.error);
                }
                return;
            }
            
            if (result && !result.success) {
                 setError(result.error || 'Error desconocido al eliminar');
                 return;
            }

            onDeleteSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error deleting report:', err);
            setError(err.message || 'Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    if (!report) return null;

    return (
        <Dialog 
            open={open} 
            onClose={loading ? undefined : onClose}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                <Warning /> Eliminar Reporte
            </DialogTitle>
            
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    ¿Estás seguro de que deseas eliminar el reporte <strong>"{report.title}"</strong>?
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Esta acción es irreversible y eliminará permanentemente el archivo y sus datos asociados.
                </Typography>
                
                <Alert severity="warning" sx={{ mt: 2 }}>
                    Nota: No se pueden eliminar reportes que ya hayan sido adquiridos por usuarios (comprados o descargados gratuitamente).
                </Alert>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
                <Button 
                    onClick={onClose} 
                    disabled={loading}
                    variant="outlined"
                >
                    Cancelar
                </Button>
                <Button 
                    onClick={handleDelete} 
                    disabled={loading}
                    variant="contained" 
                    color="error"
                    autoFocus
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {loading ? 'Eliminando...' : 'Eliminar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

