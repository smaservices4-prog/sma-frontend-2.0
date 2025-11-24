'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useExchangeRates } from './ExchangeRateContext';
import { useAuth } from './AuthContext';
import { userPreferencesApi } from '@/api/userPreferences';

type Currency = 'USD' | 'ARS' | 'EUR';

interface CurrencyContextType {
    selectedCurrency: Currency;
    setSelectedCurrency: (currency: Currency) => void;
    loading: boolean;
    formatPrice: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>('USD');
    const [loading, setLoading] = useState(true);
    const { formatPriceWithConversion } = useExchangeRates();
    const { user } = useAuth();

    useEffect(() => {
        const initializeCurrency = async () => {
            // Load preference from local storage as fallback/initial
            const savedCurrency = localStorage.getItem('preferred_currency') as Currency;
            if (savedCurrency && ['USD', 'ARS', 'EUR'].includes(savedCurrency)) {
                setSelectedCurrencyState(savedCurrency);
            }

            // If user is logged in, fetch from API
            if (user) {
                try {
                    const preferences = await userPreferencesApi.getPreferences();
                    if (preferences?.preferred_currency && ['USD', 'ARS', 'EUR'].includes(preferences.preferred_currency)) {
                        setSelectedCurrencyState(preferences.preferred_currency);
                        // Sync local storage
                        localStorage.setItem('preferred_currency', preferences.preferred_currency);
                    }
                } catch (error) {
                    console.error('Failed to fetch user preferences:', error);
                }
            }
            setLoading(false);
        };

        initializeCurrency();
    }, [user]);

    const setSelectedCurrency = async (currency: Currency) => {
        setSelectedCurrencyState(currency);
        localStorage.setItem('preferred_currency', currency);

        if (user) {
            try {
                await userPreferencesApi.updatePreferences({ preferred_currency: currency });
            } catch (error) {
                console.error('Failed to update user preferences:', error);
            }
        }
    };

    const formatPrice = (amount: number) => {
        return formatPriceWithConversion(amount, selectedCurrency);
    };

    return (
        <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency, loading, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
