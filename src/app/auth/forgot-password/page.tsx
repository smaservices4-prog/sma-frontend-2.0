'use client';

import { useState } from 'react';
import {
    Box, Button, TextField, Typography, Alert, Avatar, CircularProgress, Link as MuiLink
} from '@mui/material';
import Link from 'next/link';
import LockResetIcon from '@mui/icons-material/LockReset';
import AccessLayout, { useEmailValidation, commonTextFieldStyles, commonButtonStyles } from '@/components/auth/AccessLayout';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const emailValid = useEmailValidation(email);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!emailValid) {
            setError('Por favor ingresa un correo electrónico válido.');
            return;
        }

        setLoading(true);

        try {
            const { error: resetError } = await resetPassword(email);

            if (resetError) {
                throw resetError;
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Error al enviar el correo de recuperación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AccessLayout>
            <Avatar sx={{ m: 1, bgcolor: '#FF8C42' }}>
                <LockResetIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ mb: 2, color: '#2C1810', fontWeight: 700, textAlign: 'center' }}>
                Recuperar contraseña
            </Typography>

            <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: '#6B5B4A' }}>
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                <TextField
                    margin="dense"
                    required
                    fullWidth
                    id="email"
                    label="Correo electrónico"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={commonTextFieldStyles}
                    disabled={loading || success}
                />

                {error && (
                    <Alert severity="error" sx={{ mt: 2, backgroundColor: 'rgba(229, 57, 53, 0.08)', color: '#B71C1C', border: '1px solid #FF8C42', fontWeight: 500, boxShadow: '0 2px 8px rgba(255, 140, 66, 0.07)', '& .MuiAlert-icon': { color: '#E53935' } }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mt: 2, backgroundColor: 'rgba(76, 175, 80, 0.08)', color: '#388E3C', border: '1px solid #4ADE80', fontWeight: 500, boxShadow: '0 2px 8px rgba(76, 175, 80, 0.07)', '& .MuiAlert-icon': { color: '#4ADE80' } }}>
                        ¡Correo enviado! Revisa tu bandeja de entrada.
                    </Alert>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ ...commonButtonStyles, mt: 2 }}
                    disabled={loading || !emailValid || success}
                >
                    {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Enviar enlace'}
                </Button>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <MuiLink component={Link} href="/login" sx={{ color: '#FF8C42', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                    Volver al inicio de sesión
                </MuiLink>
            </Box>
        </AccessLayout>
    );
}
