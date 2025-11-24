'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FailurePage() {
    const searchParams = useSearchParams();
    // Check for MercadoPago external_reference parameter (maps to order_id) or direct order_id
    const orderId = searchParams.get('external_reference') || searchParams.get('order_id');
    const errorMessage = searchParams.get('error') || searchParams.get('message');
    const [displayOrderId, setDisplayOrderId] = useState<string | null>(null);

    useEffect(() => {
        // If no order_id from query params, try to get from localStorage
        const pendingOrderId = orderId || localStorage.getItem('pending_order_id');
        setDisplayOrderId(pendingOrderId);
    }, [orderId]);
    return (
        <Box sx={{ textAlign: 'center', mt: 8, p: 2 }}>
            <Typography variant="h4" gutterBottom color="error.main" fontWeight="bold">
                ¡Error en el Pago!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                Lo sentimos, hubo un problema al procesar tu pago.
            </Typography>
            {errorMessage && (
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Detalles del error: {errorMessage}
                </Typography>
            )}
            {displayOrderId && (
                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    ID de la Orden: {displayOrderId}
                </Typography>
            )}
            <Button component={Link} href="/cart" variant="contained" color="primary" sx={{ mt: 4 }}>
                Volver al carrito
            </Button>
        </Box>
    );
}
