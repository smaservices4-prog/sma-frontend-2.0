'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
    return (
        <Box sx={{ textAlign: 'center', mt: 8, p: 2 }}>
            <Typography variant="h4" gutterBottom color="error.main" fontWeight="bold">
                Página no encontrada
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
                La página que buscas no existe.
            </Typography>
            <Button component={Link} href="/" variant="contained" color="primary">
                Volver al inicio
            </Button>
        </Box>
    );
}
