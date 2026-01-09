'use client';

import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Badge,
    Container,
    InputBase,
    ToggleButton,
    ToggleButtonGroup,
    useMediaQuery,
    useTheme,
    Menu,
    MenuItem,
    Button,
    Stack,
} from '@mui/material';
import {
    Search as SearchIcon,
    ShoppingCart as ShoppingCartIcon,
    Person as PersonIcon,
    Menu as MenuIcon,
    FilterList as FilterListIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useSearch } from '@/context/SearchContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useFilters } from '@/context/FilterContext';
import { FiltersInlineControls } from '@/components/reports/Filters';

export default function TopBar() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { getCartItemsCount } = useCart();
    const { selectedCurrency, setSelectedCurrency } = useCurrency();
    const { searchQuery, setSearchQuery } = useSearch();
    const { user, signOut, loading: authLoading } = useAuth();
    const router = useRouter();
    const { setSheetOpen } = useFilters();

    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleCurrencyChange = (
        event: React.MouseEvent<HTMLElement>,
        newCurrency: 'USD' | 'ARS' | 'EUR' | null,
    ) => {
        if (newCurrency !== null) {
            setSelectedCurrency(newCurrency);
        }
    };

    return (
        <AppBar position="sticky" color="default" elevation={1} sx={{ backgroundColor: 'white' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ height: 72, justifyContent: 'space-between' }}>
                    {/* Logo */}
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <Typography
                            variant="h4"
                            noWrap
                            component="div"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontWeight: 700,
                                color: 'primary.main',
                                letterSpacing: '.1rem',
                            }}
                        >
                            SCI
                        </Typography>
                        <Typography
                            variant="h5"
                            noWrap
                            component="div"
                            sx={{
                                mr: 2,
                                display: { xs: 'flex', md: 'none' },
                                flexGrow: 1,
                                fontWeight: 700,
                                color: 'primary.main',
                                letterSpacing: '.1rem',
                            }}
                        >
                            SCI
                        </Typography>
                    </Link>

                    {/* Mobile Menu Icon */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        {/* Placeholder for mobile menu drawer trigger if needed */}
                    </Box>

                    {/* Search (Desktop/Large) */}
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{
                            display: { xs: 'none', lg: 'flex' },
                            flexGrow: 1,
                            mr: 2,
                            flexWrap: 'wrap',
                            rowGap: 0.75,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: 'grey.100',
                                borderRadius: 1,
                                px: 2,
                                py: 0,
                                flex: '2 1 320px',
                                minWidth: 260,
                                maxWidth: '100%',
                                border: '1px solid',
                                borderColor: 'grey.300',
                                height: 40,
                                '&:focus-within': {
                                    borderColor: 'primary.main',
                                    backgroundColor: 'white',
                                },
                            }}
                        >
                            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                            <InputBase
                                placeholder="Buscar reportes..."
                                inputProps={{ 'aria-label': 'search' }}
                                sx={{ width: '100%' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Box>
                        <Box
                            sx={{
                                flex: '0 1 auto',
                                minWidth: 0,
                                display: 'flex',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <FiltersInlineControls />
                        </Box>
                    </Stack>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Currency Selector */}
                        <Box sx={{ mr: 2 }}>
                            <ToggleButtonGroup
                                value={selectedCurrency}
                                exclusive
                                onChange={handleCurrencyChange}
                                aria-label="currency"
                                size="small"
                                sx={{ height: 32 }}
                            >
                                <ToggleButton value="USD" aria-label="USD">
                                    USD
                                </ToggleButton>
                                <ToggleButton value="ARS" aria-label="ARS">
                                    ARS
                                </ToggleButton>
                                <ToggleButton value="EUR" aria-label="EUR">
                                    EUR
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {/* Cart */}
                        <IconButton
                            aria-label="cart"
                            onClick={() => router.push('/cart')}
                            sx={{ color: 'text.primary' }}
                        >
                            <Badge badgeContent={getCartItemsCount()} color="primary">
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>

                        {/* User Menu */}
                        <Box sx={{ flexGrow: 0 }}>
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
                                <PersonIcon fontSize="large" color="action" />
                            </IconButton>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {user ? [
                                    <MenuItem key="user-email" onClick={() => { handleCloseUserMenu(); }}>
                                        <Typography textAlign="center" sx={{ color: 'text.secondary' }}>
                                            {user.email}
                                        </Typography>
                                    </MenuItem>,
                                    <MenuItem key="sign-out" onClick={async () => {
                                        await signOut();
                                        handleCloseUserMenu();
                                    }}>
                                        <Typography textAlign="center">Cerrar Sesión</Typography>
                                    </MenuItem>
                                ] : (
                                    <MenuItem onClick={() => { router.push('/login'); handleCloseUserMenu(); }}>
                                        <Typography textAlign="center">Iniciar Sesión</Typography>
                                    </MenuItem>
                                )}
                            </Menu>
                        </Box>
                    </Box>
                </Toolbar>

                {/* Mobile Search Bar + Filters trigger (Row 2) */}
                <Box sx={{ display: { xs: 'flex', lg: 'none' }, pb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: 'grey.100',
                                borderRadius: 1,
                                px: 2,
                                py: 0,
                                width: '100%',
                                border: '1px solid',
                                borderColor: 'grey.300',
                                height: 40,
                            }}
                        >
                            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                            <InputBase
                                placeholder="Buscar..."
                                inputProps={{ 'aria-label': 'search' }}
                                sx={{ width: '100%' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Box>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<FilterListIcon />}
                            onClick={() => setSheetOpen(true)}
                            sx={{ whiteSpace: 'nowrap', height: 40 }}
                        >
                            Filtros
                        </Button>
                    </Stack>
                </Box>
            </Container>
        </AppBar>
    );
}
