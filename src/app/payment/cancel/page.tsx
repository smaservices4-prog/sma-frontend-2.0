'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function CancelPage() {
    return (
        <Box sx={{ textAlign: 'center', mt: 8, p: 2 }}>
            <Typography variant="h4" gutterBottom color="text.primary" fontWeight="bold">
                Pago Cancelado
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                Has cancelado el proceso de pago. No se ha realizado ningún cargo.
            </Typography>
            <Button component={Link} href="/cart" variant="contained" sx={{ mt: 4 }}>
                Volver al carrito
            </Button>
        </Box>
    );
}
