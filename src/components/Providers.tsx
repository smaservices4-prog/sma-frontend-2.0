'use client';

import React from 'react';
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { SearchProvider } from '@/context/SearchContext';
import { FilterProvider } from '@/context/FilterContext';
import { AuthProvider } from '@/context/AuthContext';
import { ExchangeRateProvider } from '@/context/ExchangeRateContext';
import ThemeRegistry from '@/theme/ThemeRegistry';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeRegistry>
            <AuthProvider>
                <ExchangeRateProvider>
                    <CurrencyProvider>
                        <SearchProvider>
                            <FilterProvider>
                                <CartProvider>
                                    {children}
                                </CartProvider>
                            </FilterProvider>
                        </SearchProvider>
                    </CurrencyProvider>
                </ExchangeRateProvider>
            </AuthProvider>
        </ThemeRegistry>
    );
}
