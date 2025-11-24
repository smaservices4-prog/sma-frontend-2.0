'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function ErrorPage() {
    return (
        <Box sx={{ textAlign: 'center', mt: 8, p: 2 }}>
            <Typography variant="h4" gutterBottom color="error.main" fontWeight="bold">
                ¡Error en el Pago!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                Lo sentimos, hubo un problema al procesar tu pago.
            </Typography>
            <Button component={Link} href="/cart" variant="contained" color="primary" sx={{ mt: 4 }}>
                Volver al carrito
            </Button>
        </Box>
    );
}
