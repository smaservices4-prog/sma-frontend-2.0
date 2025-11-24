import { Report } from '@/types';

export const mockReports: Report[] = [
    {
        id: '1',
        title: 'Reporte Macroeconómico Enero 2025',
        month: '2025-01-01',
        prices: [
            { currency: 'USD', amount: 50 },
            { currency: 'ARS', amount: 50000 },
            { currency: 'EUR', amount: 45 },
        ],
        preview_url: 'https://placehold.co/600x400/png?text=Enero+2025',
        created_at: '2025-01-05T10:00:00Z',
        purchased: false,
        can_access: false,
        price: 50,
        currency: 'USD'
    },
    {
        id: '2',
        title: 'Reporte Sectorial Febrero 2025',
        month: '2025-02-01',
        prices: [
            { currency: 'USD', amount: 55 },
            { currency: 'ARS', amount: 55000 },
            { currency: 'EUR', amount: 50 },
        ],
        preview_url: 'https://placehold.co/600x400/png?text=Febrero+2025',
        created_at: '2025-02-05T10:00:00Z',
        purchased: true,
        can_access: true,
        price: 55,
        currency: 'USD'
    },
    {
        id: '3',
        title: 'Análisis de Mercado Marzo 2025',
        month: '2025-03-01',
        prices: [
            { currency: 'USD', amount: 60 },
            { currency: 'ARS', amount: 60000 },
            { currency: 'EUR', amount: 55 },
        ],
        preview_url: 'https://placehold.co/600x400/png?text=Marzo+2025',
        created_at: '2025-03-05T10:00:00Z',
        purchased: false,
        can_access: false,
        price: 60,
        currency: 'USD'
    },
    {
        id: '4',
        title: 'Proyecciones Q2 2025',
        month: '2025-04-01',
        prices: [
            { currency: 'USD', amount: 75 },
            { currency: 'ARS', amount: 75000 },
            { currency: 'EUR', amount: 70 },
        ],
        preview_url: 'https://placehold.co/600x400/png?text=Abril+2025',
        created_at: '2025-04-05T10:00:00Z',
        purchased: false,
        can_access: false,
        price: 75,
        currency: 'USD'
    },
];
