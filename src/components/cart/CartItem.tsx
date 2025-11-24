'use client';

import React from 'react';
import {
    Card,
    Typography,
    Box,
    IconButton,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { CartItem as CartItemType } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
    item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { selectedCurrency } = useCurrency();
    const { removeFromCart } = useCart();

    const priceObj = item.report.prices.find((p) => p.currency === selectedCurrency) || item.report.prices[0];
    const price = priceObj?.amount || 0;
    const currencySymbol = selectedCurrency === 'EUR' ? '€' : '$';

    return (
        <Card
            elevation={0}
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                p: 3,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                transition: 'box-shadow 0.2s',
                '&:hover': {
                    boxShadow: theme.shadows[2], // SHADOW_SM
                },
            }}
        >
            <Box sx={{ flexGrow: 1, mb: { xs: 2, sm: 0 } }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {item.report.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {new Date(item.report.month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: { xs: '100%', sm: 'auto' },
                    gap: 4,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {currencySymbol}{price}
                </Typography>

                <IconButton
                    onClick={() => removeFromCart(item.report.id)}
                    color="error"
                    aria-label="delete"
                    size="small"
                    sx={{
                        border: '1px solid',
                        borderColor: 'error.main',
                        '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'white',
                        }
                    }}
                >
                    <DeleteOutline />
                </IconButton>
            </Box>
        </Card>
    );
}
