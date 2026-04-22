'use client';

import { useState, useEffect, useRef } from 'react';
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
import {
    clearUrlFragmentAndQueryPreservingPath,
    exchangePkceCodeOnce,
    getPkceCodeFromSearchParams,
    getRecoveryErrorMessageFromUrl,
    hasImplicitRecoveryTokensInHash,
    hasImplicitRecoveryTokensInSearch,
} from '@/lib/auth/resetPasswordUrl';
import { translateAuthError } from '@/lib/auth/translateAuthError';

const IMPLICIT_RECOVERY_POLL_MS = 250;
const IMPLICIT_RECOVERY_MAX_ATTEMPTS = 24;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

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
    const [linkError, setLinkError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const bootstrapCompleteRef = useRef(false);

    useEffect(() => {
        bootstrapCompleteRef.current = false;

        const finishValid = () => {
            if (bootstrapCompleteRef.current) {
                return;
            }
            bootstrapCompleteRef.current = true;
            setLinkError(null);
            setIsValidRecovery(true);
            setCheckedRecovery(true);
        };

        const finishInvalid = (message?: string | null) => {
            if (bootstrapCompleteRef.current) {
                return;
            }
            bootstrapCompleteRef.current = true;
            setLinkError(message ?? null);
            setIsValidRecovery(false);
            setCheckedRecovery(true);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                finishValid();
                clearUrlFragmentAndQueryPreservingPath();
            }
        });

        const run = async () => {
            if (typeof window === 'undefined') {
                return;
            }

            const searchParams = new URLSearchParams(window.location.search);
            const urlErrorMessage = getRecoveryErrorMessageFromUrl(searchParams);
            if (urlErrorMessage) {
                finishInvalid(urlErrorMessage);
                return;
            }

            const pkceCode = getPkceCodeFromSearchParams(searchParams);
            if (pkceCode) {
                clearUrlFragmentAndQueryPreservingPath();
                const { error: exchangeError } = await exchangePkceCodeOnce(supabase, pkceCode);
                if (bootstrapCompleteRef.current) {
                    return;
                }
                if (exchangeError) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        finishValid();
                        return;
                    }
                    const message =
                        exchangeError.message.includes('code verifier') || exchangeError.message.includes('code_verifier')
                            ? 'Abrí el enlace en el mismo navegador donde solicitaste el correo, o solicitá un enlace nuevo.'
                            : translateAuthError(exchangeError);
                    finishInvalid(message);
                    return;
                }
                finishValid();
                return;
            }

            if (
                hasImplicitRecoveryTokensInHash(window.location.hash) ||
                hasImplicitRecoveryTokensInSearch(searchParams)
            ) {
                for (let attempt = 0; attempt < IMPLICIT_RECOVERY_MAX_ATTEMPTS; attempt++) {
                    if (bootstrapCompleteRef.current) {
                        return;
                    }
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        clearUrlFragmentAndQueryPreservingPath();
                        finishValid();
                        return;
                    }
                    await sleep(IMPLICIT_RECOVERY_POLL_MS);
                }
                if (!bootstrapCompleteRef.current) {
                    finishInvalid(
                        'No se pudo completar el enlace de recuperación. Solicitá uno nuevo o abrilo en el mismo dispositivo.'
                    );
                }
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                finishValid();
                return;
            }

            finishInvalid();
        };

        void run();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

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
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) {
                throw updateError;
            }

            setSuccess(true);

            setTimeout(async () => {
                await signOut();
                router.push('/login');
            }, 3000);

        } catch (err: unknown) {
            setError(translateAuthError(err, 'Error al actualizar la contraseña.'));
        } finally {
            setLoading(false);
        }
    };

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

            {!checkedRecovery ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, gap: 2 }}>
                    <CircularProgress sx={{ color: '#FF8C42' }} />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Verificando enlace de recuperación…
                    </Typography>
                </Box>
            ) : (checkedRecovery && !isValidRecovery) ? (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                    {linkError ?? 'Enlace de recuperación inválido o expirado. Por favor solicita uno nuevo.'}
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
