// API para obtener tasas de cambio en tiempo real
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
    private cachedRates: ExchangeRates | null = null;
    private lastFetch: number = 0;
    private readonly CACHE_DURATION = 60 * 1000;

    async getExchangeRates(): Promise<ExchangeRateResponse> {
        try {
            // Verificar si tenemos datos en cache válidos
            if (this.cachedRates && Date.now() - this.lastFetch < this.CACHE_DURATION) {
                return {
                    success: true,
                    rates: this.cachedRates
                };
            }

            // Obtener tasas usando fuentes preferidas (blue para ARS y oficial para EUR)
            const rates = await this.fetchFromMultipleSources();

            if (rates) {
                console.log('🌎 EXCHANGE RATES FETCHED:', {
                    'USD → ARS': Math.round(1 / rates.ARS_USD),
                    'EUR → USD': rates.EUR_USD.toFixed(4),
                    'ARS → USD': rates.ARS_USD.toFixed(6),
                    timestamp: new Date(rates.timestamp).toLocaleString()
                });
                this.cachedRates = rates;
                this.lastFetch = Date.now();
                return {
                    success: true,
                    rates
                };
            }

            throw new Error('No se pudieron obtener las tasas de cambio');
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            return {
                success: false,
                rates: this.getDefaultRates(),
                error: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    }

    private async fetchFromMultipleSources(): Promise<ExchangeRates | null> {
        // Estrategia preferida:
        // - ARS_USD: Dólar blue (bluelytics)
        // - EUR_USD: Tasas oficiales (exchangerate.host o fallback)
        try {
            const [arsUsd, eurUsd] = await Promise.all([
                this.fetchARSFromBlue(),
                this.fetchEURUSDOfficial()
            ]);

            if (arsUsd && eurUsd) {
                return { ARS_USD: arsUsd, EUR_USD: eurUsd, timestamp: Date.now() };
            }
        } catch (e) {
            console.warn('Preferred sources failed:', e);
        }

        // Fallback combinando otras fuentes si alguna falló
        try {
            const blue = await this.fetchFromDollarBlueAPI();
            if (blue) return blue;
        } catch { }

        try {
            const ex1 = await this.fetchFromExchangeRateAPI();
            if (ex1) return ex1;
        } catch { }

        try {
            const ex2 = await this.fetchFromCurrencyAPI();
            if (ex2) return ex2;
        } catch { }

        return null;
    }

    // Fuente 1: ExchangeRate-API (gratuita, sin API key)
    private async fetchFromExchangeRateAPI(): Promise<ExchangeRates | null> {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();

            if (data.rates) {
                return {
                    ARS_USD: 1 / data.rates.ARS, // USD base → ARS por USD; invertimos a USD por ARS
                    EUR_USD: 1 / data.rates.EUR, // USD base → EUR por USD; invertimos a USD por EUR
                    timestamp: Date.now()
                };
            }
            return null;
        } catch (error) {
            console.warn('ExchangeRate-API failed:', error);
            return null;
        }
    }

    // Fuente 2: Currency API (gratuita)
    private async fetchFromCurrencyAPI(): Promise<ExchangeRates | null> {
        try {
            const response = await fetch('https://api.fxapi.com/v1/latest?base=USD&symbols=ARS,EUR');
            const data = await response.json();

            if (data.rates) {
                return {
                    ARS_USD: 1 / data.rates.ARS,   // USD base
                    EUR_USD: 1 / data.rates.EUR,   // USD base
                    timestamp: Date.now()
                };
            }
            return null;
        } catch (error) {
            console.warn('Currency API failed:', error);
            return null;
        }
    }

    // Fuente 3: API especializada para dólar blue argentino
    private async fetchFromDollarBlueAPI(): Promise<ExchangeRates | null> {
        try {
            // Esta es una API específica para Argentina que incluye dólar blue
            const [blueResponse, eurResponse] = await Promise.all([
                fetch('https://api.bluelytics.com.ar/v2/latest'),
                fetch('https://api.exchangerate-api.com/v4/latest/EUR')
            ]);

            const blueData = await blueResponse.json();
            const eurData = await eurResponse.json();

            if (blueData.blue && eurData.rates) {
                return {
                    ARS_USD: 1 / blueData.blue.value_avg, // Usar promedio del dólar blue
                    EUR_USD: eurData.rates.USD,           // EUR -> USD
                    timestamp: Date.now()
                };
            }
            return null;
        } catch (error) {
            console.warn('Dollar Blue API failed:', error);
            return null;
        }
    }

    // Preferido: ARS_USD desde dólar blue (USD por ARS)
    private async fetchARSFromBlue(): Promise<number | null> {
        try {
            const response = await fetch('https://api.bluelytics.com.ar/v2/latest');
            const data = await response.json();
            if (data?.blue?.value_avg) {
                return 1 / data.blue.value_avg;
            }
            return null;
        } catch (e) {
            console.warn('fetchARSFromBlue failed:', e);
            return null;
        }
    }

    // Preferido: EUR_USD oficial (USD por EUR)
    private async fetchEURUSDOfficial(): Promise<number | null> {
        try {
            // exchangerate.host no requiere API key y usa fuentes oficiales
            const response = await fetch('https://api.exchangerate.host/latest?base=EUR&symbols=USD');
            const data = await response.json();
            if (data?.rates?.USD) {
                return data.rates.USD;
            }
            return null;
        } catch (e) {
            console.warn('fetchEURUSDOfficial failed:', e);
            return null;
        }
    }

    private getDefaultRates(): ExchangeRates {
        // Valores por defecto si todas las APIs fallan
        return {
            ARS_USD: 1 / 1000,  // Aproximadamente 1000 ARS = 1 USD
            EUR_USD: 1.1,       // Aproximadamente 1 EUR = 1.1 USD
            timestamp: Date.now()
        };
    }

    // Método para convertir precios
    convertPrice(amount: number, fromCurrency: string, toCurrency: string = 'USD'): number {
        if (!this.cachedRates || fromCurrency === toCurrency) {
            return amount;
        }

        switch (fromCurrency) {
            case 'ARS':
                return amount * this.cachedRates.ARS_USD;
            case 'EUR':
                return amount * this.cachedRates.EUR_USD;
            case 'USD':
                return amount;
            default:
                return amount;
        }
    }

    // Formatear precio con conversión
    formatPriceWithConversion(amount: number, currency: string): string {
        const symbol = currency === 'USD' ? '$' : currency === 'ARS' ? '$' : '€';
        return `${symbol}${amount.toLocaleString()}`;
    }
}

export const exchangeRateService = new ExchangeRateService();
