'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import { SxProps, Theme } from '@mui/material/styles';

interface AppLogoProps {
    size?: 'sm' | 'nav' | 'lg';
    href?: string | null;
    sx?: SxProps<Theme>;
}

export default function AppLogo({ size = 'nav', href, sx }: AppLogoProps) {
    const textStyles = {
        sm: { fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' },
        nav: { fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em' },
        lg: { fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em' },
    }[size];

    const logoContent = (
        <Typography
            component="span"
            className="logo-text"
            sx={{
                fontFamily: 'inherit',
                fontSize: textStyles.fontSize,
                fontWeight: textStyles.fontWeight,
                lineHeight: 1,
                letterSpacing: textStyles.letterSpacing,
                color: 'primary.main',
                transition: 'color 0.2s ease-in-out, transform 0.2s ease-in-out',
            }}
        >
            SCI
        </Typography>
    );

    const rootStyles: SxProps<Theme> = {
        display: 'inline-flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        userSelect: 'none',
        '&:hover .logo-text': {
            color: 'primary.dark',
            transform: 'scale(1.03)',
        },
        ...sx,
    };

    if (href !== null) {
        return (
            <Link href={href || '/'} passHref style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex' }}>
                <Box sx={[
                    rootStyles,
                    { cursor: 'pointer' },
                    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
                ]}>
                    {logoContent}
                </Box>
            </Link>
        );
    }

    return (
        <Box sx={[
            rootStyles,
            ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}>
            {logoContent}
        </Box>
    );
}
