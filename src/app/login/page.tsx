'use client';

import React, { Suspense } from 'react';
import { Typography, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginForm from '@/components/auth/LoginForm';
import AccessLayout from '@/components/auth/AccessLayout';

export default function LoginPage() {
    return (
        <AccessLayout>
            <Avatar sx={{ m: 1, bgcolor: '#FF8C42' }}>
                <LockOutlinedIcon />
            </Avatar>
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
