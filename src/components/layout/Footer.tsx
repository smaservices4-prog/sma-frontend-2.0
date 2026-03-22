import { Box, Container, Typography, Link as MuiLink, Grid } from '@mui/material';
import Link from 'next/link';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

export default function Footer() {
    return (
        <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, mt: 'auto' }}>
            <Container maxWidth="lg">
                <Grid container spacing={4} justifyContent="space-between">
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            SCI
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
                            guillermonanni@gmail.com
                        </Typography>
                        <Box display="flex" gap={2} mt={1}>
                            <MuiLink href="mailto:guillermonanni@gmail.com" color="inherit">
                                <EmailIcon />
                            </MuiLink>
                            <MuiLink href="https://www.linkedin.com/in/guillermo-nanni-072a6912" target="_blank" rel="noopener noreferrer" color="inherit">
                                <LinkedInIcon />
                            </MuiLink>
                        </Box>
                    </Grid>
                </Grid>
                <Box mt={5}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        {'Copyright © '}
                        <MuiLink component={Link} href="/" color="inherit">
                            SCI
                        </MuiLink>{' '}
                        {new Date().getFullYear()}
                        {'.'}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
