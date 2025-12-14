import { supabase as defaultSupabase } from '@/lib/supabase';
import { Report, ReportsResponse } from '@/types';
import { mockReports } from './mockData';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Checks if an error is an authentication error (4xx client errors)
 * Only 4xx errors should trigger re-authentication, not 5xx server errors
 */
function isAuthError(error: any): boolean {
    // Check explicit 401/403 status
    if (error.status === 401 || error.status === 403) {
        return true;
    }
    
    // Check for explicit auth-related messages
    if (error.message?.includes('auth') || error.message?.includes('unauthorized')) {
        return true;
    }
    
    return false;
}

/**
 * Safely extracts a user-friendly error message from an error object
 * Prefers backend error messages if available and they don't expose critical info
 * Falls back to a generic Spanish message for server errors
 */
function getErrorMessage(error: any): string {
    // Try to get error details from context (Supabase error structure)
    if (error?.context?.response?.data) {
        const responseData = error.context.response.data;
        
        // If backend returned a structured error with a user-friendly message
        if (responseData.error && typeof responseData.error === 'string') {
            // Check if it's a safe message (not exposing internals)
            if (!responseData.error.includes('Internal') && 
                !responseData.error.includes('Stack') &&
                !responseData.error.includes('at ') &&
                responseData.error.length < 500) {
                return responseData.error;
            }
        }
        
        // Alternative: check for details field (which might contain user-friendly info)
        if (responseData.details && typeof responseData.details === 'string') {
            if (!responseData.details.includes('Internal') && 
                !responseData.details.includes('Stack') &&
                !responseData.details.includes('at ') &&
                responseData.details.length < 500) {
                return responseData.details;
            }
        }
    }
    
    // Generic fallback for server errors
    return 'Ha ocurrido un error en el servidor. Por favor, intenta nuevamente más tarde.';
}

interface GetReportsOptions {
    page?: number;
    perPage?: number;
    supabaseClient?: SupabaseClient;
}

export interface CreateOrderRequest {
    cart: { report_id: string; quantity: number }[];
    payment_provider: 'paypal' | 'mercadopago';
    currency: string;
}

export interface CreateOrderResponse {
    success: boolean;
    order_id?: string;
    provider_order_id?: string;
    checkout_url?: string;
    error?: string;
}

export const reportsApi = {
    getAll: async (options: GetReportsOptions = {}): Promise<ReportsResponse> => {
        const { page = 1, perPage = 9, supabaseClient } = options;
        const client = supabaseClient || defaultSupabase;
        try {
            // Fetch from Edge Function only
            const { data, error } = await client.functions.invoke('get-reports', {
                body: {
                    page,
                    per_page: perPage,
                },
            });

            if (error) {
                console.warn('Error fetching reports from Edge Function:', error);
                throw error;
            }

            const transformed = (data?.reports || []).map(transformReport);
            const total = data?.total_reports ?? transformed.length;
            const responsePage = data?.page ?? page;
            const responsePerPage = data?.per_page ?? perPage;
            const totalPages = data?.total_pages ?? Math.max(1, Math.ceil(total / responsePerPage));

            return {
                success: data?.success ?? true,
                user_authenticated: data?.user_authenticated ?? false,
                reports: transformed,
                total_reports: total,
                page: responsePage,
                per_page: responsePerPage,
                total_pages: totalPages,
            };
        } catch (err) {
            console.warn('API/Function failed, falling back to mock data:', err);
            const total = mockReports.length;
            const totalPages = Math.max(1, Math.ceil(total / perPage));
            return {
                success: true,
                user_authenticated: false,
                reports: mockReports.map(transformReport),
                total_reports: total,
                page,
                per_page: perPage,
                total_pages: totalPages,
            };
        }
    },

    createOrder: async (orderData: CreateOrderRequest, supabaseClient?: SupabaseClient): Promise<CreateOrderResponse> => {
        const client = supabaseClient || defaultSupabase;
        try {
            // Check authentication first
            const { data: { session } } = await client.auth.getSession();
            if (!session) {
                return { 
                    success: false, 
                    error: 'AUTH_REQUIRED' // Special error code for authentication
                };
            }

            const { data, error } = await client.functions.invoke('create-order', {
                body: orderData
            });

            if (error) {
                // Check if it's an authentication error
                if (isAuthError(error)) {
                    return { 
                        success: false, 
                        error: 'AUTH_REQUIRED'
                    };
                }
                // For other errors, extract user-friendly message
                return { 
                    success: false, 
                    error: getErrorMessage(error)
                };
            }
            return data;
        } catch (err: any) {
            console.error('Error creating order:', err);
            // Check for authentication errors in the catch block too
            if (isAuthError(err)) {
                return { 
                    success: false, 
                    error: 'AUTH_REQUIRED'
                };
            }
            // For other errors, extract user-friendly message
            return { 
                success: false, 
                error: getErrorMessage(err)
            };
        }
    },

    checkOrderStatus: async (orderId: string, supabaseClient?: SupabaseClient): Promise<string> => {
        const client = supabaseClient || defaultSupabase;
        try {
            // Check order status through Edge Function
            const { data, error } = await client.functions.invoke('get-order-status', {
                body: { order_id: orderId }
            });

            if (error) {
                console.error('Error checking order status:', error);
                return 'pending';
            }

            return data?.status || 'pending';
        } catch (err) {
            console.error('Error checking order status:', err);
            return 'pending';
        }
    },

    getReportFile: async (reportId: string, supabaseClient?: SupabaseClient): Promise<{ success: boolean; report?: { file_url: string; title: string }; error?: string }> => {
        const client = supabaseClient || defaultSupabase;
        try {
            const { data: { session } } = await client.auth.getSession();
            if (!session) {
                return { success: false, error: 'AUTH_REQUIRED' };
            }

            const { data, error } = await client.functions.invoke('get-report-file', {
                body: { report_id: reportId }
            });

            if (error) {
                throw error;
            }
            return data;
        } catch (err: any) {
            console.error('Error fetching report file:', err);
            return { success: false, error: err.message || 'Failed to get report file' };
        }
    },

    purchaseFreeReport: async (reportId: string, supabaseClient?: SupabaseClient): Promise<CreateOrderResponse> => {
        const client = supabaseClient || defaultSupabase;
        try {
            // Check authentication first
            const { data: { session } } = await client.auth.getSession();
            if (!session) {
                return {
                    success: false,
                    error: 'AUTH_REQUIRED'
                };
            }

            // Create order with single free report
            const orderData: CreateOrderRequest = {
                cart: [{ report_id: reportId, quantity: 1 }],
                payment_provider: 'paypal', // Default provider, won't be used for free orders
                currency: 'USD' // Default currency, won't be used for free orders
            };

            const { data, error } = await client.functions.invoke('create-order', {
                body: orderData
            });

            if (error) {
                if (isAuthError(error)) {
                    return {
                        success: false,
                        error: 'AUTH_REQUIRED'
                    };
                }
                // For other errors, extract user-friendly message
                return {
                    success: false,
                    error: getErrorMessage(error)
                };
            }

            return data;
        } catch (err: any) {
            console.error('Error purchasing free report:', err);
            if (isAuthError(err)) {
                return {
                    success: false,
                    error: 'AUTH_REQUIRED'
                };
            }
            // For other errors, extract user-friendly message
            return { 
                success: false, 
                error: getErrorMessage(err)
            };
        }
    }
};

// Helper to transform DB report to Frontend Report type
function transformReport(dbReport: any): Report {
    // Default to USD if available, otherwise first available currency
    const defaultPrice = dbReport.prices?.find((p: any) => p.currency === 'USD') || dbReport.prices?.[0] || { amount: 0, currency: 'USD' };

    return {
        ...dbReport,
        price: defaultPrice.amount,
        currency: defaultPrice.currency
    };
}
