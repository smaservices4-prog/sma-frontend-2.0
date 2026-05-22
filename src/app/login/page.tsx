'use client';

import React, { Suspense } from 'react';
import { Typography } from '@mui/material';
import LoginForm from '@/components/auth/LoginForm';
import AccessLayout from '@/components/auth/AccessLayout';
import AppLogo from '@/components/layout/AppLogo';

export default function LoginPage() {
    return (
        <AccessLayout>
            <AppLogo size="lg" href={null} sx={{ m: 1 }} />
            <Typography component="h1" variant="h5" sx={{ mb: 2, color: '#2C1810', fontWeight: 700 }}>
                Bienvenido de nuevo
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                Ingresa tus credenciales para acceder a tu cuenta
            </Typography>

            <Suspense fallback={<div>Cargando...</div>}>
                <LoginForm />
            </Suspense>
        </AccessLayout>
    );
}
