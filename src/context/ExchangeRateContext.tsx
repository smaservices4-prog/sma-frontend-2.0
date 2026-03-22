'use client';

import React, { createContext, useContext, useState } from 'react';
import { exchangeRateService, ExchangeRate } from '@/api/exchangeRates';

interface ExchangeRateContextType {
    rates: ExchangeRate[] | null;
    loading: boolean;
    error: string | null;
    convertPrice: (amount: number, fromCurrency: string, toCurrency?: string) => number;
    formatPriceWithConversion: (amount: number, currency: string) => string;
    refresh: () => Promise<void>;
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined);

/**
 * @deprecated Este contexto ya no es necesario para obtener tasas de cambio globales.
 * Se mantiene por compatibilidad temporal con componentes que usen formatPriceWithConversion.
 */
export function ExchangeRateProvider({ children }: { children: React.ReactNode }) {
    // Tasas vacías para evitar romper tipos, pero ya no se usan para conversión automática en el cliente
    const [rates] = useState<ExchangeRate[]>([]);

    const convertPrice = (amount: number, _fromCurrency: string, _toCurrency: string = 'USD') => {
        return amount; // El backend ahora provee precios pre-convertidos
    };

    const formatPriceWithConversion = (amount: number, currency: string) => {
        return exchangeRateService.formatPriceWithConversion(amount, currency);
    };

    const refresh = async () => {
        // No-op
    };

    return (
        <ExchangeRateContext.Provider value={{ rates, loading: false, error: null, convertPrice, formatPriceWithConversion, refresh }}>
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
