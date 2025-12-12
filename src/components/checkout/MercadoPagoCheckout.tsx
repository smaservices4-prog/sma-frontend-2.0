'use client';

import { useState, useEffect } from "react";
import { Box, Button, CircularProgress, Alert } from '@mui/material';
import { reportsApi, CreateOrderRequest } from '@/api/reports';
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
// We need to import the logo. For now, I'll use a placeholder text or try to copy the asset later.
// import MercadoPagoLogo from '../../assets/MP_RGB_HANDSHAKE_pluma_horizontal.svg';

interface MercadoPagoCheckoutProps {
    'aria-label'?: string;
    width?: string | number;
    maxWidth?: string | number;
    onLoad?: () => void;
}

const MercadoPagoCheckout = ({
    'aria-label': ariaLabel,
    width = '100%',
    maxWidth = 600,
    onLoad
}: MercadoPagoCheckoutProps) => {
    const { cartItems } = useCart();
    const { selectedCurrency } = useCurrency();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Simulate component loading
    useEffect(() => {
        const timer = setTimeout(() => {
            onLoad?.();
        }, 100); // Small delay to simulate loading
        return () => clearTimeout(timer);
    }, [onLoad]);

    const handleCheckout = async () => {
        // Check authentication first
        if (!user) {
            const returnUrl = encodeURIComponent(pathname || '/cart');
            router.push(`/login?returnTo=${returnUrl}`);
            return;
        }

        if (cartItems.length === 0) {
            setMessage("Tu carrito está vacío.");
            return;
        }

        setIsLoading(true);
        setMessage("");
        try {
            const orderData: CreateOrderRequest = {
                cart: cartItems.map(item => ({ report_id: item.report.id, quantity: 1 })),
                payment_provider: 'mercadopago',
                currency: selectedCurrency
            };

            const response = await reportsApi.createOrder(orderData);

            if (response.success && response.checkout_url) {
                if (response.order_id) {
                    localStorage.setItem('pending_order_id', response.order_id);
                }
                window.location.href = response.checkout_url;
            } else {
                // Check for authentication error
                if (response.error === 'AUTH_REQUIRED') {
                    const returnUrl = encodeURIComponent(pathname || '/cart');
                    router.push(`/login?returnTo=${returnUrl}`);
                    return;
                }
                throw new Error(response.error || 'No se pudo crear la orden de MercadoPago.');
            }
        } catch (error) {
            console.error("Error al crear la orden de MercadoPago:", error);
            if (error instanceof Error && error.message.includes('AUTH_REQUIRED')) {
                const returnUrl = encodeURIComponent(pathname || '/cart');
                router.push(`/login?returnTo=${returnUrl}`);
            } else {
                // Redirect to failure page with error details
                const errorMessage = error instanceof Error ? error.message : "Error al procesar el pago";
                router.push(`/payment/failure?error=${encodeURIComponent(errorMessage)}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="warning">
                    MercadoPago Public Key no configurado. Por favor, configura NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY en el archivo .env
                </Alert>
            </Box>
        );
    }

    // Parent component handles authentication UI
    // Return null if not authenticated or still loading
    if (authLoading || !user) {
        return null;
    }

    return (
        <Box sx={{ width, maxWidth, maxHeight: 55 }}>
            <Button
                variant="contained"
                aria-label={ariaLabel || 'Pagar con Mercado Pago'}
                onClick={handleCheckout}
                disabled={isLoading || cartItems.length === 0}
                sx={{
                    background: '#00ADEF',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0, 173, 239, 0.10)',
                    transition: 'all 0.2s',
                    p: 2,
                    '&:hover': {
                        background: '#0098CE',
                        boxShadow: '0 4px 16px rgba(0, 173, 239, 0.15)',
                    },
                    '&:disabled': {
                        background: '#B0E6FA',
                        color: '#FFFFFF',
                    },
                }}
            >
                {/* Replaced Image with Text for now until asset is moved */}
                Pagar con Mercado Pago
                {isLoading && (
                    <Box sx={{ position: 'absolute', right: 24 }}>
                        <CircularProgress size={30} sx={{ color: '#fff' }} />
                    </Box>
                )}
            </Button>
            {message && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {message}
                </Alert>
            )}
        </Box>
    );
};

export default MercadoPagoCheckout;
