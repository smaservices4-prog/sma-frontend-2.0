'use client';

import { usePathname } from 'next/navigation';
import TopBar from './TopBar';
import Footer from './Footer';
import { Box } from '@mui/material';

const AUTH_PAGES = ['/login', '/register', '/auth/forgot-password', '/auth/reset-password'];

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = AUTH_PAGES.some(page => pathname?.startsWith(page));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {!isAuthPage && <TopBar />}
            <Box component="main" sx={{ flexGrow: 1 }}>
                {children}
            </Box>
            {!isAuthPage && <Footer />}
        </Box>
    );
}




