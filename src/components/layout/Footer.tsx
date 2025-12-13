import { Box, Container, Typography, Link as MuiLink, Grid } from '@mui/material';
import Link from 'next/link';

export default function Footer() {
    return (
        <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, mt: 'auto' }}>
            <Container maxWidth="lg">
                <Grid container spacing={4} justifyContent="space-between">
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            SMA
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sistema de Gestión de Reportes.
                            <br />
                            Tu fuente confiable de información mensual.
                        </Typography>
                        
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Enlaces
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={1}>
                            <MuiLink component={Link} href="/" color="text.secondary">
                                Inicio
                            </MuiLink>
                            <MuiLink component={Link} href="/cart" color="text.secondary">
                                Carrito
                            </MuiLink>
                            <MuiLink component={Link} href="/login" color="text.secondary">
                                Iniciar Sesión
                            </MuiLink>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Contacto
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            soporte@sma.com
                            <br />
                            +54 11 1234 5678
                        </Typography>
                    </Grid>
                </Grid>
                <Box mt={5}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        {'Copyright © '}
                        <MuiLink component={Link} href="/" color="inherit">
                            SMA
                        </MuiLink>{' '}
                        {new Date().getFullYear()}
                        {'.'}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
