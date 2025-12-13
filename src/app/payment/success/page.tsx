'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';

function SuccessContent() {
    const searchParams = useSearchParams();
    // Check for MercadoPago external_reference parameter (maps to order_id) or direct order_id
    const orderId = searchParams.get('external_reference') || searchParams.get('order_id');
    const { clearCart } = useCart();
    const [displayOrderId, setDisplayOrderId] = useState<string | null>(orderId);

    useEffect(() => {
        // Clear cart when payment is successful
        clearCart();

        // Clean up pending order ID from localStorage if it exists
        const pendingOrderId = localStorage.getItem('pending_order_id');
        if (pendingOrderId) {
            localStorage.removeItem('pending_order_id');
        }

        // Set display order ID from localStorage if not available from query params
        if (!orderId) {
            const fallbackOrderId = localStorage.getItem('pending_order_id');
            setDisplayOrderId(fallbackOrderId);
        }
    }, [clearCart, orderId]);


    return (
        <Box sx={{ textAlign: 'center', mt: 8, p: 2 }}>
            <Typography variant="h4" gutterBottom color="success.main" fontWeight="bold">
                ¡Pago Exitoso!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                Gracias por tu compra. Tu orden se ha procesado correctamente.
            </Typography>
            {displayOrderId && (
                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    ID de la Orden: {displayOrderId}
                </Typography>
            )}
            <Button component={Link} href="/" variant="contained" sx={{ mt: 4 }}>
                Ver mis reportes
            </Button>
        </Box>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<Typography>Cargando...</Typography>}>
            <SuccessContent />
        </Suspense>
    );
}
