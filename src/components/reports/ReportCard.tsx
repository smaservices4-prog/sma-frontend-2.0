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
    IconButton,
} from '@mui/material';
import { ShoppingCart, Download, Check, Visibility, Edit, Delete } from '@mui/icons-material';
import { Report } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

interface ReportCardProps {
    report: Report;
    adminView?: boolean;
    onEdit?: (report: Report) => void;
    onDelete?: (reportId: string) => void;
}

export default function ReportCard({ report, adminView = false, onEdit, onDelete }: ReportCardProps) {
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
        if (adminView && onEdit) {
            onEdit(report);
        } else if (purchased) {
            router.push(`/reports/read/${report.id}`);
        } else if (inCart) {
            removeFromCart(report.id);
        } else {
            addToCart(report);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) onDelete(report.id);
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
                border: adminView 
                    ? '1px solid #FF8C42' // Orange border for admin
                    : (inCart ? `2px solid ${theme.palette.primary.main}` : '1px solid #E5E5E5'),
            }}
            elevation={inCart ? 3 : 1}
        >
            {/* Badges */}
            <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1, display: 'flex', gap: 1 }}>
                {purchased && !adminView && (
                    <Chip
                        label="Comprado"
                        color="success"
                        size="small"
                        icon={<Check />}
                        sx={{ fontWeight: 'bold' }}
                    />
                )}
                {inCart && !purchased && !adminView && (
                    <Chip
                        label="En carrito"
                        color="primary"
                        size="small"
                        icon={<ShoppingCart sx={{ fontSize: 16 }} />}
                        sx={{ fontWeight: 'bold' }}
                    />
                )}
                {adminView && (
                     <Chip
                        label="Admin"
                        color="warning"
                        size="small"
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
                        {!purchased || adminView ? `${currencySymbol}${price}` : 'Leer'}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {adminView && onDelete && (
                            <IconButton
                                onClick={handleDelete}
                                size="small"
                                sx={{ 
                                    color: 'error.main', 
                                    border: '1px solid', 
                                    borderColor: 'error.main',
                                    '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.04)' }
                                }}
                            >
                                <Delete />
                            </IconButton>
                        )}

                        <Button
                            variant={inCart && !adminView ? "outlined" : "contained"}
                            color={purchased && !adminView ? "success" : (adminView ? "warning" : "primary")}
                            onClick={handleAction}
                            startIcon={
                                adminView ? <Edit /> :
                                (purchased ? <Visibility /> : <ShoppingCart />)
                            }
                            size="small"
                            sx={{
                                minWidth: adminView ? 100 : 120,
                                fontWeight: 600,
                            }}
                        >
                            {adminView ? 'Editar' : (purchased ? 'Leer' : (inCart ? 'Quitar' : 'Agregar'))}
                        </Button>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
