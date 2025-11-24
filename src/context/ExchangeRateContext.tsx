'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { exchangeRateService, ExchangeRates } from '@/api/exchangeRates';

interface ExchangeRateContextType {
    rates: ExchangeRates | null;
    loading: boolean;
    error: string | null;
    convertPrice: (amount: number, fromCurrency: string, toCurrency?: string) => number;
    formatPriceWithConversion: (amount: number, currency: string) => string;
    refresh: () => Promise<void>;
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined);

export function ExchangeRateProvider({ children }: { children: React.ReactNode }) {
    const [rates, setRates] = useState<ExchangeRates | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRates = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await exchangeRateService.getExchangeRates();
            if (response.success) {
                setRates(response.rates);
                setError(null);
            } else {
                setError(response.error || 'Error fetching rates');
            }
        } catch (err) {
            setError('Failed to fetch exchange rates');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRates(false);

        // Refresh rates every minute
        const interval = setInterval(() => fetchRates(true), 60000);
        return () => clearInterval(interval);
    }, [fetchRates]);

    const refresh = async () => {
        await fetchRates(false);
    };

    const convertPrice = (amount: number, fromCurrency: string, toCurrency: string = 'USD') => {
        return exchangeRateService.convertPrice(amount, fromCurrency, toCurrency);
    };

    const formatPriceWithConversion = (amount: number, currency: string) => {
        return exchangeRateService.formatPriceWithConversion(amount, currency);
    };

    return (
        <ExchangeRateContext.Provider value={{ rates, loading, error, convertPrice, formatPriceWithConversion, refresh }}>
            {children}
        </ExchangeRateContext.Provider>
    );
}

export function useExchangeRates() {
    const context = useContext(ExchangeRateContext);
    if (context === undefined) {
        throw new Error('useExchangeRates must be used within an ExchangeRateProvider');
    }
    return context;
}
