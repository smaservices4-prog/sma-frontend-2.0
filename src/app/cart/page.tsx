'use client';

import React from 'react';
import { Container, Typography, Box, Button, Grid } from '@mui/material';
import { ArrowBack, ShoppingCartOutlined } from '@mui/icons-material';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';

export default function CartPage() {
    const { cartItems } = useCart();
    const hasItems = cartItems.length > 0;

    if (!hasItems) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <ShoppingCartOutlined sx={{ fontSize: 80, color: 'text.disabled' }} />
                </Box>
                <Typography variant="h4" gutterBottom fontWeight={700}>
                    Tu carrito está vacío
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                    Parece que aún no has agregado ningún reporte. Explora nuestro catálogo para encontrar información valiosa.
                </Typography>
                <Link href="/" passHref>
                    <Button variant="contained" size="large" startIcon={<ArrowBack />}>
                        Volver al Catálogo
                    </Button>
                </Link>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Button startIcon={<ArrowBack />} color="inherit">
                        Seguir comprando
                    </Button>
                </Link>
            </Box>

            <Typography variant="h3" component="h1" gutterBottom fontWeight={700} sx={{ mb: 4 }}>
                Mi Carrito ({cartItems.length})
            </Typography>

            <Grid container spacing={4}>
                {/* Cart Items Column */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {cartItems.map((item) => (
                        <CartItem key={item.report.id} item={item} />
                    ))}
                </Grid>

                {/* Summary Column */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <CartSummary />
                </Grid>
            </Grid>
        </Container>
    );
}
