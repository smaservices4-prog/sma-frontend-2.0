'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
    Chip,
    useTheme,
} from '@mui/material';
import { ShoppingCart, Download, Check, Visibility } from '@mui/icons-material';
import { Report } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

interface ReportCardProps {
    report: Report;
}

export default function ReportCard({ report }: ReportCardProps) {
    const theme = useTheme();
    const { selectedCurrency } = useCurrency();
    const { addToCart, removeFromCart, isInCart } = useCart();
    const router = useRouter();

    const priceObj = report.prices.find((p) => p.currency === selectedCurrency) || report.prices[0];
    const price = priceObj?.amount || 0;
    const currencySymbol = selectedCurrency === 'EUR' ? '€' : '$';

    const inCart = isInCart(report.id);
    const purchased = report.purchased;

    const handleAction = () => {
        if (purchased) {
            router.push(`/reports/read/${report.id}`);
        } else if (inCart) {
            removeFromCart(report.id);
        } else {
            addToCart(report);
        }
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6, // SHADOW_MD/LG
                },
                border: inCart ? `2px solid ${theme.palette.primary.main}` : '1px solid #E5E5E5',
            }}
            elevation={inCart ? 3 : 1}
        >
            {/* Badges */}
            <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1, display: 'flex', gap: 1 }}>
                {purchased && (
                    <Chip
                        label="Comprado"
                        color="success"
                        size="small"
                        icon={<Check />}
                        sx={{ fontWeight: 'bold' }}
                    />
                )}
                {inCart && !purchased && (
                    <Chip
                        label="En carrito"
                        color="primary"
                        size="small"
                        icon={<ShoppingCart sx={{ fontSize: 16 }} />}
                        sx={{ fontWeight: 'bold' }}
                    />
                )}
            </Box>

            <CardMedia
                component="img"
                height="180"
                image={report.preview_url || 'https://placehold.co/600x400/png?text=Reporte'}
                alt={report.title}
                sx={{ objectFit: 'cover' }}
            />

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                    {report.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {new Date(report.month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </Typography>

                <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                        {!purchased ? `${currencySymbol}${price}` : 'Descargar'}
                    </Typography>

                    <Button
                        variant={inCart ? "outlined" : "contained"}
                        color={purchased ? "success" : "primary"}
                        onClick={handleAction}
                        startIcon={purchased ? <Visibility /> : (inCart ? <ShoppingCart /> : <ShoppingCart />)}
                        size="small"
                        sx={{
                            minWidth: 120,
                            fontWeight: 600,
                        }}
                    >
                        {purchased ? 'Leer' : (inCart ? 'Quitar' : 'Agregar')}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
