import { supabase } from '@/lib/supabase';

// API para formateo de precios y utilidades de moneda
// Ya no se obtienen tasas de cambio desde el frontend, se usan las del backend.

export interface ExchangeRate {
    currency: string;
    rate: number;
    updated_at: string;
}

export interface ExchangeRateResponse {
    success: boolean;
    rates?: ExchangeRate[];
    error?: string;
}

class ExchangeRateService {
    /**
     * Obtiene las tasas de cambio actuales desde el backend.
     * Útil para el panel de administrador para mostrar previsualizaciones de precios.
     */
    async fetchExchangeRates(): Promise<ExchangeRateResponse> {
        try {
            const { data, error } = await supabase.functions.invoke('get-exchange-rates');
            
            if (error) {
                console.error('Error fetching exchange rates:', error);
                return { success: false, error: 'Error al obtener tasas de cambio' };
            }

            return {
                success: true,
                rates: data.rates
            };
        } catch (error) {
            console.error('Exception fetching exchange rates:', error);
            return { success: false, error: 'Error inesperado' };
        }
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
