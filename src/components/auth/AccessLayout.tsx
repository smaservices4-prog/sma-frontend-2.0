'use client';

import { Box, Paper, SxProps, Theme, CircularProgress } from '@mui/material';
import React, { useRef, useState, useEffect } from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    rightColumnPaperSx?: SxProps<Theme>;
    formContainerSx?: SxProps<Theme>;
}

// Hook personalizado para manejar el width dinámico del formulario
export const useAuthFormWidth = () => {
    const mainButtonRef = useRef<HTMLButtonElement>(null);
    const [buttonWidth, setButtonWidth] = useState<number>(320);
    const [widthReady, setWidthReady] = useState<boolean>(false);

    useEffect(() => {
        const checkWidth = () => {
            if (mainButtonRef.current) {
                setButtonWidth(mainButtonRef.current.offsetWidth);
                setWidthReady(true);
            }
        };
        const timeouts = [100, 200, 500].map((ms) => setTimeout(checkWidth, ms));
        window.addEventListener('resize', checkWidth);
        return () => {
            timeouts.forEach(clearTimeout);
            window.removeEventListener('resize', checkWidth);
        };
    }, []);

    return {
        mainButtonRef,
        buttonWidth,
        widthReady,
        getProviderButtonWidth: () => Math.min(buttonWidth, 400)
    };
};

// Hook personalizado para manejar validaciones comunes
export const useEmailValidation = (email: string) => {
    const [emailValid, setEmailValid] = useState(false);

    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailValid(email.length > 0 && emailRegex.test(email));
    }, [email]);

    return emailValid;
};

// Estilos comunes para los campos de texto
export const commonTextFieldStyles = {
    borderRadius: 1,
    "& .MuiOutlinedInput-root": {
        backgroundColor: '#FFFFFF',
        borderRadius: 1,
        color: '#2C1810',
        transition: 'all 0.2s ease-in-out',
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FF8C42',
            borderWidth: '2px'
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FF8C42',
            borderWidth: '2px',
            boxShadow: '0 0 0 3px rgba(255, 140, 66, 0.1)'
        }
    },
    "& .MuiInputLabel-root": {
        color: '#6B5B4A',
        '&.Mui-focused': {
            color: '#FF8C42'
        }
    }
};

// Estilos comunes para botones principales
export const commonButtonStyles = {
    py: 1.5,
    borderRadius: '8px',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    backgroundColor: '#FF8C42',
    color: '#FFFFFF',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: '#E67A32',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(255, 140, 66, 0.3)'
    },
    '&:focus': {
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(255, 140, 66, 0.3)'
    },
    '&:active': {
        transform: 'translateY(0px)'
    },
    '&:disabled': {
        backgroundColor: '#FFB88A',
        color: '#FFFFFF',
        transform: 'none',
        boxShadow: 'none'
    }
};

export const AccessLayout: React.FC<AuthLayoutProps> = ({
    children,
    rightColumnPaperSx,
    formContainerSx
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'center',
                minHeight: '100vh',
                height: { xs: '100vh', sm: 'auto' },
                width: '100%',
                maxWidth: '100vw',
                backgroundColor: '#FEF9F5',
                padding: { xs: 0, sm: 1.5, md: 2 },
                boxSizing: 'border-box',
                overflow: { xs: 'hidden', sm: 'visible' }
            }}
        >
            <Box
                component={Paper}
                elevation={0}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: { xs: 'flex-start', sm: 'flex-start' },
                    padding: { xs: 2, sm: 2.5, md: 3 },
                    borderRadius: { xs: 0, sm: 3 },
                    backgroundColor: '#FFFFFF',
                    color: '#2C1810',
                    width: '100%',
                    maxWidth: { xs: '100%', sm: 420, md: 450 },
                    height: { xs: '100%', sm: 'auto' },
                    maxHeight: 'none',
                    boxShadow: { xs: 'none', sm: '0 4px 20px rgba(255, 140, 66, 0.15)' },
                    border: { xs: 'none', sm: '1px solid rgba(255, 140, 66, 0.2)' },
                    boxSizing: 'border-box',
                    overflow: { xs: 'auto', sm: 'visible' },
                    ...rightColumnPaperSx,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: '100%',
                        flex: 1,
                        boxSizing: 'border-box',
                        paddingTop: { xs: 2, sm: 0 },
                        paddingBottom: { xs: 2, sm: 0 },
                        justifyContent: { xs: 'flex-start', sm: 'flex-start' },
                        ...formContainerSx
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export const AuthPageLoader = () => (
    <Box
        sx={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FEF9F5',
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0
        }}
    >
        <CircularProgress size={48} thickness={4} sx={{ color: '#FF8C42' }} />
    </Box>
);

export default AccessLayout;
