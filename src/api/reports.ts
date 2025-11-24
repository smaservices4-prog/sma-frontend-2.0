import { supabase } from '@/lib/supabase';
import { Report } from '@/types';
import { mockReports } from './mockData';

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
    getAll: async (): Promise<Report[]> => {
        try {
            // Try to fetch from Edge Function first (as per 1.0 logic)
            const { data, error } = await supabase.functions.invoke('get-reports');

            if (error) {
                console.warn('Error fetching reports from Edge Function, falling back to table select:', error);
                // Fallback to table select if function fails (or dev environment issue)
                const { data: tableData, error: tableError } = await supabase
                    .from('reports')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (tableError) throw tableError;
                return (tableData || []).map(transformReport);
            }

            return (data?.reports || []).map(transformReport);
        } catch (err) {
            console.warn('API/Function failed, falling back to mock data:', err);
            return mockReports;
        }
    },

    createOrder: async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
        try {
            // Check authentication first
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                return { 
                    success: false, 
                    error: 'AUTH_REQUIRED' // Special error code for authentication
                };
            }

            const { data, error } = await supabase.functions.invoke('create-order', {
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

    checkOrderStatus: async (orderId: string): Promise<string> => {
        const { data, error } = await supabase
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single();

        if (error) {
            console.error('Error checking order status:', error);
            return 'pending';
        }

        return data?.status || 'pending';
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
