import { supabase as defaultSupabase } from '@/lib/supabase';
import { Report } from '@/types';
import { mockReports } from './mockData';
import { SupabaseClient } from '@supabase/supabase-js';

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
    getAll: async (supabaseClient?: SupabaseClient): Promise<Report[]> => {
        const client = supabaseClient || defaultSupabase;
        try {
            // Fetch from Edge Function only
            const { data, error } = await client.functions.invoke('get-reports');

            if (error) {
                console.warn('Error fetching reports from Edge Function:', error);
                throw error;
            }

            return (data?.reports || []).map(transformReport);
        } catch (err) {
            console.warn('API/Function failed, falling back to mock data:', err);
            return mockReports;
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
                if (error.status === 401 || error.message?.includes('auth') || error.message?.includes('unauthorized')) {
                    return { 
                        success: false, 
                        error: 'AUTH_REQUIRED'
                    };
                }
                throw error;
            }
            return data;
        } catch (err: any) {
            console.error('Error creating order:', err);
            // Check for authentication errors in the catch block too
            if (err.status === 401 || err.message?.includes('auth') || err.message?.includes('unauthorized')) {
                return { 
                    success: false, 
                    error: 'AUTH_REQUIRED'
                };
            }
            return { success: false, error: err.message || 'Failed to create order' };
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
