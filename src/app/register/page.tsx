'use client';

import { useState, useEffect, Suspense } from 'react';
import {
    Box, Button, TextField, Typography, Alert, Link as MuiLink,
    Avatar, CircularProgress, Divider,
    IconButton, InputAdornment
} from '@mui/material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AccessLayout, { useAuthFormWidth, useEmailValidation, commonTextFieldStyles, commonButtonStyles, AuthPageLoader } from '@/components/auth/AccessLayout';
import GoogleSignInButton from '@/components/auth/providers/GoogleSignInButton';
import FacebookSignInButton from '@/components/auth/providers/FacebookSignInButton';
import { supabase } from '@/lib/supabase';
import PasswordRequirements from '@/components/auth/PasswordRequirements';

const HiddenMainButton = ({ buttonRef }: { buttonRef: React.Ref<HTMLButtonElement> }) => (
    <Button
        type="button"
        fullWidth
        variant="contained"
        ref={buttonRef}
        sx={{
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
            width: '100%',
            height: 0,
            minHeight: 0,
            padding: 0,
            border: 0,
            m: 0,
            zIndex: -1,
        }}
        tabIndex={-1}
        aria-hidden="true"
        disableRipple
        disableElevation
        disabled
    >
        Medir ancho
    </Button>
);

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Usar hooks extraídos
    const emailValid = useEmailValidation(email);
    const { mainButtonRef, getProviderButtonWidth, widthReady } = useAuthFormWidth();
    const [showWidthLoader, setShowWidthLoader] = useState(false);

    // Persistencia temporal de email con localStorage
    useEffect(() => {
        const savedEmail = localStorage.getItem('signupEmail');
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    useEffect(() => {
        if (email && !message) {
            localStorage.setItem('signupEmail', email);
        } else if (message) {
            // Limpiar datos guardados después de registro exitoso
            localStorage.removeItem('signupEmail');
        }
    }, [email, message]);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (signUpError) {
                setError(signUpError.message);
            } else if (data.user && data.user.identities?.length === 0) {
                setError('Este correo electrónico ya está registrado pero no confirmado. Revisa tu bandeja de entrada para confirmar o intenta iniciar sesión.');
            } else if (data.user) {
                setMessage('¡Te has registrado exitosamente! Te hemos enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace de confirmación para activar tu cuenta.');
                // Limpiar campos después del registro exitoso
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setError('Ocurrió un error inesperado durante el registro.');
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = () => {
        const returnTo = searchParams.get('returnTo');
        router.push(returnTo ? decodeURIComponent(returnTo) : '/');
    };

    const handleGoogleError = (errorMessage: string) => {
        setError(errorMessage);
    };

    const handleFacebookError = (errorMessage: string) => {
        setError(errorMessage);
    };

    useEffect(() => {
        if (!widthReady) {
            const t = setTimeout(() => setShowWidthLoader(true), 150);
            return () => clearTimeout(t);
        } else {
            setShowWidthLoader(false);
        }
    }, [widthReady]);

    if (!widthReady) {
        return <>
            {showWidthLoader && <AuthPageLoader />}
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
                <HiddenMainButton buttonRef={mainButtonRef} />
            </Box>
        </>;
    }

    return (
        <AccessLayout>
            <Avatar sx={{ mb: 1, bgcolor: '#FF8C42' }}>
                <Typography variant="h6" color="white">UI</Typography>
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ mb: 2, color: '#2C1810' }}>
                Crea tu cuenta
            </Typography>

            <Box component="form" onSubmit={handleSignUp} sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
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
                    disabled={loading}
                    variant="outlined"
                    aria-label="Ingresa tu correo electrónico"
                    InputProps={{
                        endAdornment: emailValid ? (
                            <InputAdornment position="end">
                                <CheckCircleIcon sx={{ color: '#28A745', fontSize: 20 }} />
                            </InputAdornment>
                        ) : null,
                    }}
                    sx={{
                        ...commonTextFieldStyles,
                        ...(emailValid && {
                            '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#28A745',
                                borderWidth: '1px'
                            }
                        })
                    }}
                />
                <TextField
                    margin="dense"
                    required
                    fullWidth
                    name="password"
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    aria-label="Ingresa tu contraseña"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    sx={{ color: '#6B5B4A' }}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={commonTextFieldStyles}
                />

                {/* Validación de requisitos de contraseña */}
                <PasswordRequirements password={password} />

                <TextField
                    margin="dense"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirmar contraseña"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    aria-label="Confirma tu contraseña"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    onClick={handleClickShowConfirmPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    sx={{ color: '#6B5B4A' }}
                                >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={commonTextFieldStyles}
                />

                {/* Región live para anuncios */}
                <div aria-live="polite" aria-atomic="true">
                    {error && (
                        <Alert severity="error" sx={{
                            mt: 2,
                            width: '100%',
                            backgroundColor: '#FFF2F2',
                            color: '#D32F2F',
                            '& .MuiAlert-icon': {
                                color: '#D32F2F'
                            }
                        }}>
                            {error}
                        </Alert>
                    )}

                    {message && (
                        <Alert severity="success" sx={{
                            mt: 2,
                            width: '100%',
                            backgroundColor: '#F2FFF2',
                            color: '#2E7D32',
                            '& .MuiAlert-icon': {
                                color: '#2E7D32'
                            }
                        }}>
                            {message}
                        </Alert>
                    )}
                </div>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                        mt: 1.5,
                        mb: 1,
                        ...commonButtonStyles
                    }}
                    disabled={loading || !emailValid}
                    aria-label="Registrarse con email y contraseña"
                    ref={mainButtonRef}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
                </Button>

                <Divider sx={{ my: 1, width: '100%', borderColor: '#E0D0B7' }}>
                    <Typography variant="body2" sx={{ color: '#6B5B4A' }}>O regístrate con</Typography>
                </Divider>

                <GoogleSignInButton maxWidth={getProviderButtonWidth()} widthReady={widthReady} onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
                <Box sx={{ mt: 1 }}>
                    <FacebookSignInButton maxWidth={getProviderButtonWidth()} widthReady={widthReady} onError={handleFacebookError} />
                </Box>

                <Box sx={{ textAlign: 'center', mt: 1.5 }}>
                    <Typography variant="body2" sx={{ color: '#2C1810' }}>
                        ¿Ya tienes una cuenta?{' '}
                        <MuiLink
                            component={Link}
                            href="/login"
                            variant="body2"
                            sx={{
                                textDecoration: 'none',
                                fontWeight: 'medium',
                                color: '#FF8C42',
                                '&:hover': {
                                    color: '#E67A32',
                                    textDecoration: 'underline'
                                },
                                '&:focus': {
                                    outline: '2px solid #FF8C42',
                                    outlineOffset: '2px',
                                    borderRadius: '4px'
                                },
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            Inicia sesión
                        </MuiLink>
                    </Typography>
                </Box>
            </Box>
        </AccessLayout>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<AuthPageLoader />}>
            <RegisterContent />
        </Suspense>
    );
}
