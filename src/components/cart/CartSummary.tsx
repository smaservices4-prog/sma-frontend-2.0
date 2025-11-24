'use client';

import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Divider,
    Stack,
    Alert,
    Button,
} from '@mui/material';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import PaypalCheckout from '@/components/checkout/PaypalCheckout';
import MercadoPagoCheckout from '@/components/checkout/MercadoPagoCheckout';

export default function CartSummary() {
    const { cartItems } = useCart();
    const { formatPrice, selectedCurrency } = useCurrency();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [paypalLoaded, setPaypalLoaded] = useState(false);
    const [mpLoaded, setMpLoaded] = useState(false);

    const cartTotal = cartItems.reduce((sum, item) => {
        const priceObj = item.report.prices.find((p) => p.currency === selectedCurrency) || item.report.prices[0];
        return sum + (priceObj?.amount || 0);
    }, 0);

    if (cartItems.length === 0) {
        return null;
    }

    return (
        <Card
            elevation={0}
            sx={{
                position: 'sticky',
                top: 24,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    Resumen del pedido
                </Typography>

                <Stack spacing={2} sx={{ my: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Subtotal</Typography>
                        <Typography fontWeight={500}>{formatPrice(cartTotal)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Descuentos</Typography>
                        <Typography fontWeight={500} color="success.main">
                            -
                        </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Total</Typography>
                        <Typography variant="h6" color="primary.main">
                            {formatPrice(cartTotal)}
                        </Typography>
                    </Box>
                </Stack>

                {authLoading ? (
                    <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                        <Typography color="text.secondary">Verificando autenticación...</Typography>
                    </Box>
                ) : !user ? (
                    <Box>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Debes iniciar sesión para completar tu compra.
                        </Alert>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => {
                                const returnUrl = encodeURIComponent(pathname || '/cart');
                                router.push(`/login?returnTo=${returnUrl}`);
                            }}
                            sx={{
                                py: 1.5,
                                borderRadius: '8px',
                                backgroundColor: '#FF8C42',
                                '&:hover': {
                                    backgroundColor: '#E67A32',
                                }
                            }}
                        >
                            Iniciar Sesión
                        </Button>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        <PaypalCheckout onLoad={() => setPaypalLoaded(true)} />
                        <MercadoPagoCheckout onLoad={() => setMpLoaded(true)} />
                    </Stack>
                )}

                <Box sx={{ mt: 3 }}>
                    <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                        Al completar la compra, recibirás los reportes en tu correo electrónico.
                    </Alert>
                </Box>
            </CardContent>
        </Card>
    );
}
