'use client';

import { Container, Typography, Button, Box, Paper } from '@mui/material';
import Link from 'next/link';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function RecoveryInvalidPage() {
    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                <Typography component="h1" variant="h4" gutterBottom>
                    Link Expired or Invalid
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    The password recovery link you used is either invalid or has expired.
                    Please request a new one to reset your password.
                </Typography>
                <Box sx={{ mt: 3 }}>
                    <Button
                        component={Link}
                        href="/auth/reset-password"
                        variant="contained"
                        color="primary"
                        size="large"
                    >
                        Request New Link
                    </Button>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Button
                        component={Link}
                        href="/login"
                        variant="text"
                    >
                        Back to Login
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
