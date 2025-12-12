'use client';

import { useState, useCallback, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Box, Typography, Alert } from '@mui/material';
import { reportsApi, CreateOrderRequest } from '@/api/reports';
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useAuthErrorHandler } from '@/hooks/useAuthErrorHandler';

interface PaypalCheckoutProps {
    width?: string | number;
    onLoad?: () => void;
}

const ScriptLoadHandler = ({ onLoad }: { onLoad?: () => void }) => {
    const [{ isResolved }] = usePayPalScriptReducer();
    useEffect(() => {
        if (isResolved) {
            onLoad?.();
        }
    }, [isResolved, onLoad]);
    return null;
};

function PaypalCheckout({ width = '100%', onLoad }: PaypalCheckoutProps) {
    const { cartItems, clearCart } = useCart();
    const { selectedCurrency } = useCurrency();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [message, setMessage] = useState("");
    const [orderId, setOrderId] = useState<string | null>(null);
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
    const { checkError } = useAuthErrorHandler();

    if (!clientId) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="warning">
                    PayPal Client ID no configurado. Por favor, configura NEXT_PUBLIC_PAYPAL_CLIENT_ID en el archivo .env
                </Alert>
            </Box>
        );
    }

    const options = {
        "clientId": clientId,
        "enable-funding": "paylater,card",
        "disable-funding": "venmo,credit",
        "buyer-country": "US",
        currency: selectedCurrency,
        intent: "capture",
        "data-page-type": "product-details",
        components: "buttons",
        "data-sdk-integration-source": "developer-studio",
    };

    const createOrder = async () => {
        try {
            // Check authentication before proceeding
            if (!user) {
                const returnUrl = encodeURIComponent(pathname || '/cart');
                router.push(`/login?returnTo=${returnUrl}`);
                throw new Error("Authentication required");
            }

            if (cartItems.length === 0) {
                setMessage("Tu carrito está vacío.");
                throw new Error("Cart is empty");
            }

            const orderData: CreateOrderRequest = {
                cart: cartItems.map(item => ({ report_id: item.report.id, quantity: 1 })),
                payment_provider: 'paypal',
                currency: selectedCurrency,
            };

            const response = await reportsApi.createOrder(orderData);

            console.log('Order response: ', response);

            if (response.success && response.provider_order_id && response.order_id) {
                setOrderId(response.order_id);
                return response.provider_order_id;
            } else {
                // Check for authentication error
                if (checkError(response.error)) {
                    throw new Error("Authentication required");
                }
                throw new Error(response.error || 'No se pudo crear la orden de PayPal.');
            }
        } catch (error) {
            console.error(error);
            // Don't show error message if it's an auth redirect
            if (error instanceof Error && error.message !== "Authentication required") {
                setMessage(`No se pudo iniciar el pago con PayPal... ${error.message}`);
            }
            throw error; // Propagar error para que PayPal lo maneje
        }
    };

    const pollOrderStatus = useCallback(async (currentOrderId: string, maxAttempts = 10) => {
        for (let i = 0; i < maxAttempts; i++) {
            const status = await reportsApi.checkOrderStatus(currentOrderId);

            if (status === 'paid') {
                clearCart();
                router.push(`/payment/success?order_id=${currentOrderId}`);
                return;
            }

            if (status === 'failed') {
                router.push('/payment/failure');
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.warn('⚠️ Webhook processing timeout');
        router.push('/payment/pending');
    }, [router, clearCart]);


    const onApprove = async (data: any) => {
        try {
            console.log('✅ Payment approved by PayPal:', data.orderID);
            setMessage(`Pago aprobado. Verificando estado de la orden...`);

            if (!orderId) {
                throw new Error("No se encontró el ID de la orden interna.");
            }

            await new Promise(resolve => setTimeout(resolve, 2000));

            const orderStatus = await reportsApi.checkOrderStatus(orderId);

            if (orderStatus === 'paid') {
                clearCart();
                router.push(`/payment/success?order_id=${orderId}`);
            } else {
                await pollOrderStatus(orderId);
            }
        } catch (error) {
            console.error("Error en onApprove", error);
            setMessage(`Lo sentimos, tu transacción no pudo ser procesada... ${error instanceof Error ? error.message : String(error)}`);
            router.push('/payment/failure');
        }
    };

    const onError = (err: any) => {
        console.error("PayPal Checkout onError", err);
        router.push('/payment/failure');
    };

    const onCancel = () => {
        console.log('⚠️ Payment cancelled by user');
        router.push('/payment/cancel');
    };

    // Parent component handles authentication UI
    // Return null if not authenticated or still loading
    if (authLoading || !user) {
        return null;
    }

    return (
        <Box sx={{ width }}>
            <PayPalScriptProvider
                options={options}
            >
                <ScriptLoadHandler onLoad={onLoad} />
                <PayPalButtons
                    style={{
                        shape: "rect",
                        layout: "vertical",
                        color: "gold",
                        label: "paypal",
                        height: 55,
                        disableMaxWidth: true,
                        borderRadius: 8
                    }}
                    disabled={cartItems.length === 0}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                    onCancel={onCancel}
                />
            </PayPalScriptProvider>
            {message && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {message}
                </Typography>
            )}
        </Box>
    );
}

export default PaypalCheckout;
