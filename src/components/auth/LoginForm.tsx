'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Divider,
    Alert,
    InputAdornment,
    IconButton,
    Link as MuiLink,
    CircularProgress
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import GoogleSignInButton from '@/components/auth/providers/GoogleSignInButton';
import FacebookSignInButton from '@/components/auth/providers/FacebookSignInButton';
import { useAuthFormWidth, commonTextFieldStyles, commonButtonStyles, AuthPageLoader } from '@/components/auth/AccessLayout';

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

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signIn } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { mainButtonRef, getProviderButtonWidth, widthReady } = useAuthFormWidth();
    const [showWidthLoader, setShowWidthLoader] = useState(false);

    useEffect(() => {
        if (!widthReady) {
            const t = setTimeout(() => setShowWidthLoader(true), 150);
            return () => clearTimeout(t);
        } else {
            setShowWidthLoader(false);
        }
    }, [widthReady]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Por favor completa todos los campos');
            setLoading(false);
            return;
        }

        try {
            const { error } = await signIn(formData.email, formData.password);

            if (error) {
                throw error;
            }

            // Redirect to returnTo URL if provided, otherwise go to home
            const returnTo = searchParams.get('returnTo');
            router.push(returnTo ? decodeURIComponent(returnTo) : '/');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!widthReady) {
        return <>
            {showWidthLoader && <AuthPageLoader />}
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
                <HiddenMainButton buttonRef={mainButtonRef} />
            </Box>
        </>;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
            {error && (
                <Alert severity="error" sx={{
                    mb: 3,
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

            <TextField
                margin="dense"
                fullWidth
                label="Correo electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
                variant="outlined"
                sx={commonTextFieldStyles}
            />

            <TextField
                margin="dense"
                fullWidth
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                variant="outlined"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Link href="/auth/forgot-password" passHref style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" sx={{ color: '#FF8C42', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}>
                        ¿Olvidaste tu contraseña?
                    </Typography>
                </Link>
            </Box>

            <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                    mt: 3,
                    mb: 2,
                    ...commonButtonStyles
                }}
                ref={mainButtonRef}
            >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
            </Button>

            <Divider sx={{ my: 2, width: '100%', borderColor: '#E0D0B7' }}>
                <Typography variant="body2" sx={{ color: '#6B5B4A' }}>
                    O continúa con
                </Typography>
            </Divider>

            <Box sx={{ mb: 2 }}>
                <GoogleSignInButton
                    onSuccess={() => {
                        const returnTo = searchParams.get('returnTo');
                        router.push(returnTo ? decodeURIComponent(returnTo) : '/');
                    }}
                    onError={(msg) => setError(msg)}
                    widthReady={widthReady}
                    maxWidth={getProviderButtonWidth()}
                />
                <Box sx={{ mt: 1 }}>
                    <FacebookSignInButton
                        onError={(msg) => setError(msg)}
                        widthReady={widthReady}
                        maxWidth={getProviderButtonWidth()}
                    />
                </Box>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#2C1810' }}>
                    ¿No tienes una cuenta?{' '}
                    <MuiLink component={Link} href="/register" sx={{
                        textDecoration: 'none',
                        fontWeight: 'medium',
                        color: '#FF8C42',
                        '&:hover': {
                            color: '#E67A32',
                            textDecoration: 'underline'
                        }
                    }}>
                        Regístrate ahora
                    </MuiLink>
                </Typography>
            </Box>
        </Box>
    );
}
