'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { commonButtonStyles } from './AccessLayout';

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    message?: string;
}

export default function AuthModal({ open, onClose, message }: AuthModalProps) {
    const router = useRouter();

    const handleLogin = () => {
        // Store current path for return after login
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?returnTo=${encodeURIComponent(currentPath)}`);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(255, 140, 66, 0.2)',
                    boxShadow: '0 4px 20px rgba(255, 140, 66, 0.15)',
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1,
                    color: '#2C1810',
                }}
            >
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    Autenticación requerida
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: '#6B5B4A',
                        '&:hover': {
                            color: '#2C1810',
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pb: 2 }}>
                <Typography variant="body1" sx={{ color: '#2C1810', mb: 2 }}>
                    {message || 'Para continuar con esta acción, necesitas iniciar sesión en tu cuenta.'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B5B4A' }}>
                    Serás redirigido a la página de inicio de sesión. Después de iniciar sesión, podrás continuar con tu solicitud.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        py: 1.6,
                        borderColor: '#E0D0B7',
                        color: '#6B5B4A',
                        '&:hover': {
                            borderColor: '#FF8C42',
                            backgroundColor: 'rgba(255, 140, 66, 0.04)',
                        },
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleLogin}
                    variant="contained"
                    sx={commonButtonStyles}
                >
                    Iniciar Sesión
                </Button>
            </DialogActions>
        </Dialog>
    );
}
