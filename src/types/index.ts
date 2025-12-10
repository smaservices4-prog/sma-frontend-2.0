export interface Report {
    id: string;
    title: string;
    month: string; // "2025-01"
    prices: Array<{
        amount: number;
        currency: string; // "ARS", "USD", "EUR"
    }>;
    preview_url?: string;
    created_at: string;
    purchased: boolean;
    can_access: boolean;

    // Legacy computed properties for backward compatibility
    price: number;
    currency: string;
}

export interface ReportsResponse {
    success: boolean;
    user_authenticated: boolean;
    total_reports: number;
    reports: Report[];
    page: number;
    per_page: number;
    total_pages: number;
}

export interface CartItem {
    report: Report;
    quantity: number;
}

export interface SearchFilters {
    query: string;
    year?: string;
    purchased?: boolean;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export interface CreateOrderRequest {
    cart: Array<{
        report_id: string;
        quantity: number;
        price: number;
        currency: string;
    }>;
    payment_provider: 'paypal' | 'mercadopago';
    currency?: string;
}

export interface CreateOrderResponse {
    success: boolean;
    order_id: string;
    checkout_url: string;
    provider_order_id: string;
    total_amount: number;
    currency: string;
    expires_at: string;
    error?: string;
}

export interface AdminFileItem {
    id: string;           // Report ID (no storage ID)
    title: string;        // Título legible del reporte
    month: string;        // Mes del reporte (ej: "2025-01")
    file_path: string;    // Path del archivo (antes era "name")
    prices: Array<{       // Precios por moneda
        currency: string;
        amount: number;
    }>;
    preview_url?: string; // URL de preview opcional
    created_at: string;
    updated_at: string;
    size?: number;        // Optional as it might not be in DB
    type?: string;        // Optional as it might not be in DB
}
