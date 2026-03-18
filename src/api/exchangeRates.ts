// API para formateo de precios y utilidades de moneda
// Ya no se obtienen tasas de cambio desde el frontend, se usan las del backend.

export interface ExchangeRates {
    ARS_USD: number;  // Peso argentino a USD
    EUR_USD: number;  // Euro a USD
    timestamp: number;
}

export interface ExchangeRateResponse {
    success: boolean;
    rates: ExchangeRates;
    error?: string;
}

class ExchangeRateService {
    // Valores por defecto (ya no se usan para conversión real, solo para compatibilidad de tipos si es necesario)
    private defaultRates: ExchangeRates = {
        ARS_USD: 1 / 1000,
        EUR_USD: 1.1,
        timestamp: Date.now()
    };

    /**
     * @deprecated Las tasas de cambio ahora vienen del backend en el array 'prices' de cada reporte.
     */
    async getExchangeRates(): Promise<ExchangeRateResponse> {
        return {
            success: true,
            rates: this.defaultRates
        };
    }

    /**
     * @deprecated Usar directamente el array 'prices' del reporte.
     */
    convertPrice(amount: number, fromCurrency: string, toCurrency: string = 'USD'): number {
        return amount;
    }

    // Formatear precio con el símbolo correspondiente
    formatPriceWithConversion(amount: number, currency: string): string {
        const symbol = currency === 'EUR' ? '€' : '$';
        
        // Formateo según la moneda
        if (currency === 'USD' || currency === 'EUR') {
            return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        
        // ARS usualmente no lleva decimales en este contexto
        return `${symbol}${Math.round(amount).toLocaleString('es-AR')}`;
    }
}

export const exchangeRateService = new ExchangeRateService();
