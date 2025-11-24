'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function PendingContent() {
    const searchParams = useSearchParams();
    // Check for MercadoPago external_reference parameter (maps to order_id) or direct order_id
    const orderId = searchParams.get('external_reference') || searchParams.get('order_id');
    const [displayOrderId, setDisplayOrderId] = useState<string | null>(null);

    useEffect(() => {
        // If no order_id from query params, try to get from localStorage
        const pendingOrderId = orderId || localStorage.getItem('pending_order_id');
        setDisplayOrderId(pendingOrderId);
    }, [orderId]);
    return (
        <Box sx={{ textAlign: 'center', mt: 8, p: 2 }}>
            <Typography variant="h4" gutterBottom color="warning.main" fontWeight="bold">
                Pago Pendiente
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                Tu pago está siendo procesado. Te notificaremos cuando se complete.
            </Typography>
            {displayOrderId && (
                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    ID de la Orden: {displayOrderId}
                </Typography>
            )}
            <Button component={Link} href="/" variant="contained" sx={{ mt: 4 }}>
                Volver al inicio
            </Button>
        </Box>
    );
}

export default function PendingPage() {
    return (
        <Suspense fallback={<Typography>Cargando...</Typography>}>
            <PendingContent />
        </Suspense>
    );
}
