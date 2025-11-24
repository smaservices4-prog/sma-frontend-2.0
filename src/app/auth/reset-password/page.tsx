'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Button, TextField, Typography, Alert, Avatar, CircularProgress, Link as MuiLink,
    InputAdornment, IconButton
} from '@mui/material';
import Link from 'next/link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AccessLayout, { commonTextFieldStyles, commonButtonStyles } from '@/components/auth/AccessLayout';
import { supabase } from '@/lib/supabase';
import PasswordRequirements from '@/components/auth/PasswordRequirements';
import { useAuth } from '@/context/AuthContext';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { signOut } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isValidRecovery, setIsValidRecovery] = useState(false);
    const [checkedRecovery, setCheckedRecovery] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event, session);
                if (event === 'PASSWORD_RECOVERY') {
                    setIsValidRecovery(true);
                    setCheckedRecovery(true);
                } else if (event === 'SIGNED_IN' && session) {
                    const currentUrl = window.location.pathname;
                    if (currentUrl !== '/auth/reset-password') {
                        // If signed in but not on reset password page, might be invalid flow or just logged in
                        // But if we are here, we expect to reset password
                    }
                }
            }
        );

        // Verificar si ya estamos en un flujo de recovery (URL tiene los parámetros)
        const currentUrl = window.location.href;
        let hasRecoveryParams = false;
        if (currentUrl.includes('access_token') && currentUrl.includes('type=recovery')) {
            hasRecoveryParams = true;
        } else if (window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
            hasRecoveryParams = hashParams.has('access_token') && hashParams.get('type') === 'recovery';
        }

        // Also check if we have a session (Supabase might have already handled the hash)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                // We are logged in, potentially via recovery link
                setIsValidRecovery(true);
                setCheckedRecovery(true);
            }
        });

        if (hasRecoveryParams) {
            setIsValidRecovery(true);
            setCheckedRecovery(true);
        }

        // Si después de 1 segundo no se validó el recovery, marcar como chequeado para mostrar error
        timeoutId = setTimeout(() => {
            setCheckedRecovery(true);
        }, 1000);

        // Cleanup
        return () => {
            subscription.unsubscribe();
            clearTimeout(timeoutId);
        };
    }, [router]);

    // Validación de contraseña
    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'La contraseña debe tener al menos 8 caracteres.';
        }
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        if (!hasLetter) {
            return 'La contraseña debe contener al menos una letra.';
        }
        if (!hasDigit) {
            return 'La contraseña debe contener al menos un número.';
        }
        return null;
    };

    const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        // Validaciones
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);

        try {
            // Según la documentación de Supabase, cuando llegan a esta página después del enlace
            // el usuario ya está autenticado y solo necesitamos usar updateUser
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) {
                throw updateError;
            }

            setSuccess(true);

            // Cerrar sesión y redirigir al login después de 3 segundos
            setTimeout(async () => {
                await signOut();
                router.push('/login');
            }, 3000);

        } catch (err: any) {
            setError(err.message || 'Error al actualizar la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    // Si no es un flujo de recovery válido, mostrar error SOLO si ya se chequeó
    // NOTE: In Next.js we might want to redirect or show a different component
    if (!isValidRecovery && checkedRecovery) {
        // For now, let's just show an error message instead of redirecting to a specific page
        // to keep it simple within this page logic
    }

    if (success) {
        return (
            <AccessLayout>
                <Avatar sx={{ m: 1, bgcolor: '#4ADE80' }}>
                    <CheckCircleIcon sx={{ color: '#fff' }} />
                </Avatar>
                <Typography component="h1" variant="h5" sx={{ mb: 2, color: '#2C1810', fontWeight: 700, textAlign: 'center' }}>
                    ¡Contraseña actualizada!
                </Typography>
                <Typography variant="body1" sx={{ color: '#388E3C', textAlign: 'center', mb: 3, fontWeight: 500 }}>
                    Tu contraseña ha sido actualizada exitosamente.<br />
                    Serás redirigido al inicio de sesión en unos segundos.
                </Typography>
                <CircularProgress sx={{ color: '#4ADE80' }} />
            </AccessLayout>
        );
    }

    return (
        <AccessLayout>
            <Avatar sx={{ m: 1, bgcolor: '#FF8C42' }}>
                <Typography variant="h6" color="white">🔒</Typography>
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ mb: 2, color: '#2C1810', fontWeight: 700, textAlign: 'center' }}>
                Restablecer contraseña
            </Typography>

            {(!isValidRecovery && checkedRecovery) ? (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                    Enlace de recuperación inválido o expirado. Por favor solicita uno nuevo.
                </Alert>
            ) : (
                <Box component="form" onSubmit={handleResetPassword} sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                    <TextField
                        margin="dense"
                        required
                        fullWidth
                        id="new-password"
                        label="Nueva contraseña"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        sx={commonTextFieldStyles}
                        disabled={loading}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword((show) => !show)}
                                        onMouseDown={e => e.preventDefault()}
                                        edge="end"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <TextField
                        margin="dense"
                        required
                        fullWidth
                        id="confirm-password"
                        label="Confirmar nueva contraseña"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        sx={commonTextFieldStyles}
                        disabled={loading}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle confirm password visibility"
                                        onClick={() => setShowConfirmPassword((show) => !show)}
                                        onMouseDown={e => e.preventDefault()}
                                        edge="end"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <PasswordRequirements password={newPassword} />
                    {/* Mensaje de error o éxito */}
                    {error && (
                        <Alert severity="error" sx={{ mt: 2, backgroundColor: 'rgba(229, 57, 53, 0.08)', color: '#B71C1C', border: '1px solid #FF8C42', fontWeight: 500, boxShadow: '0 2px 8px rgba(255, 140, 66, 0.07)', '& .MuiAlert-icon': { color: '#E53935' } }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{ mt: 2, backgroundColor: 'rgba(76, 175, 80, 0.08)', color: '#388E3C', border: '1px solid #4ADE80', fontWeight: 500, boxShadow: '0 2px 8px rgba(76, 175, 80, 0.07)', '& .MuiAlert-icon': { color: '#4ADE80' } }}>
                            ¡Contraseña actualizada exitosamente!
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ ...commonButtonStyles, mt: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Actualizar contraseña'}
                    </Button>
                </Box>
            )}

            <Typography variant="body2" sx={{ mt: 2, color: '#8B6F47', textAlign: 'center' }}>
                ¿Recordaste tu contraseña?{' '}
                <MuiLink component={Link} href="/login" sx={{ color: '#FF8C42', fontWeight: 500, textDecoration: 'none' }}>
                    Volver al inicio de sesión
                </MuiLink>
            </Typography>
        </AccessLayout>
    );
}
