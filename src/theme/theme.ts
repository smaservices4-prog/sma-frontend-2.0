'use client';

import { createTheme } from '@mui/material/styles';
import { Inter } from 'next/font/google';

const inter = Inter({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const theme = createTheme({
    palette: {
        primary: {
            main: '#FF8C42', // PRIMARY_ORANGE
            dark: '#E67A32', // ORANGE_DARK
            light: '#FFF4ED', // ORANGE_TINT
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#1A1A1A', // NEUTRAL_900
            light: '#6B6B6B', // NEUTRAL_600
            dark: '#000000',
            contrastText: '#FFFFFF',
        },
        error: {
            main: '#EF4444', // ERROR
        },
        success: {
            main: '#10B981', // SUCCESS
        },
        warning: {
            main: '#F59E0B', // WARNING
        },
        info: {
            main: '#3B82F6', // INFO
        },
        background: {
            default: '#FFFFFF', // WHITE
            paper: '#F5F5F5', // NEUTRAL_100
        },
        text: {
            primary: '#1A1A1A', // NEUTRAL_900
            secondary: '#6B6B6B', // NEUTRAL_600
            disabled: '#A8A8A8', // NEUTRAL_400
        },
        // Custom colors can be added via module augmentation if needed
        // For now mapping standard palette
    },
    typography: {
        fontFamily: inter.style.fontFamily,
        h1: {
            fontSize: '3rem', // 48px
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            color: '#1A1A1A',
        },
        h2: {
            fontSize: '2.25rem', // 36px
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            color: '#1A1A1A',
        },
        h3: {
            fontSize: '1.5rem', // 24px
            fontWeight: 600,
            lineHeight: 1.4,
            color: '#1A1A1A',
        },
        h4: {
            fontSize: '1.25rem', // 20px
            fontWeight: 600,
            lineHeight: 1.4,
            color: '#2E2E2E', // NEUTRAL_800
        },
        body1: {
            fontSize: '1rem', // 16px
            fontWeight: 400,
            lineHeight: 1.6,
            color: '#2E2E2E', // NEUTRAL_800
        },
        body2: {
            fontSize: '0.875rem', // 14px
            fontWeight: 400,
            lineHeight: 1.5,
            color: '#6B6B6B', // NEUTRAL_600
        },
        caption: {
            fontSize: '0.75rem', // 12px
            fontWeight: 400,
            lineHeight: 1.4,
            color: '#6B6B6B', // NEUTRAL_600
        },
    },
    shape: {
        borderRadius: 8, // RADIUS_MD
    },
    spacing: 8, // 8px grid
    shadows: [
        'none',
        '0 1px 2px rgba(0, 0, 0, 0.05)', // SHADOW_XS
        '0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)', // SHADOW_SM
        '0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)', // SHADOW_MD
        '0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)', // SHADOW_LG
        '0 16px 32px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)', // SHADOW_XL
        // ... fill the rest to match MUI expectation or leave default for higher elevations
        'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)', // SHADOW_SM
                    transition: 'all 0.2s ease-in-out',
                },
                containedPrimary: {
                    '&:hover': {
                        backgroundColor: '#E67A32', // ORANGE_DARK
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)', // SHADOW_MD
                    },
                },
            },
        },
    },
});

export default theme;
