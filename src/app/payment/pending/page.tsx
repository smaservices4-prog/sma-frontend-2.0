'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function PendingPage() {
    return (
        <Box sx={{ textAlign: 'center', mt: 8, p: 2 }}>
            <Typography variant="h4" gutterBottom color="warning.main" fontWeight="bold">
                Pago Pendiente
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                Tu pago está siendo procesado. Te notificaremos cuando se complete.
            </Typography>
            <Button component={Link} href="/" variant="contained" sx={{ mt: 4 }}>
                Volver al inicio
            </Button>
        </Box>
    );
}
