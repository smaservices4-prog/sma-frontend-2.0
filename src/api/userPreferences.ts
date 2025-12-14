import { supabase } from '@/lib/supabase';

export interface UserPreferences {
    preferred_currency: 'USD' | 'ARS' | 'EUR';
}

/**
 * Extracts the HTTP status code from Supabase error message
 * Supabase FunctionsHttpError messages are formatted like: "non-2xx status code: 401"
 */
function extractStatusCode(errorMessage?: string): number | null {
    if (!errorMessage) return null;
    const match = errorMessage.match(/status code:\s*(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Checks if an error is an authentication error (4xx client errors)
 * Only 4xx errors should trigger re-authentication, not 5xx server errors
 */
function isAuthError(error: any): boolean {
    // Check explicit 401/403 status
    if (error.status === 401 || error.status === 403) {
        return true;
    }
    if ((error as any).context?.status === 401 || (error as any).context?.status === 403) {
        return true;
    }
    
    // Extract status from error message and check if it's 4xx
    const statusCode = extractStatusCode(error.message);
    if (statusCode && statusCode >= 400 && statusCode < 500) {
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
            // Safe if: not "Internal", not starting with stack traces, etc.
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

export const userPreferencesApi = {
    async getPreferences(): Promise<UserPreferences | { error: string }> {
        try {
            // Backend expects POST with action 'getPreferences' (RPC style)
            // invoke defaults to POST when body is present
            const { data, error } = await supabase.functions.invoke('user-preferences', {
                body: { action: 'getPreferences' },
            });

        if (error) {
            // Check for authentication errors (4xx only, not 5xx server errors)
            if (isAuthError(error)) {
                return { error: 'AUTH_REQUIRED' };
            }
            // For other errors, extract user-friendly message
            const errorMsg = getErrorMessage(error);
            console.error('Error fetching user preferences:', error);
            return { error: errorMsg };
        }

            // Backend returns: { success: boolean, preferences: UserPreferences, error?: string }
            if (data && data.success) {
                return data.preferences;
            }

            // Check if backend returned an auth error
            if (data && data.error === 'AUTH_REQUIRED') {
                return { error: 'AUTH_REQUIRED' };
            }

            return { error: data?.error || 'Failed to fetch preferences' };
        } catch (err: any) {
            // Check if the caught exception is an auth error
            if (isAuthError(err)) {
                return { error: 'AUTH_REQUIRED' };
            }
            // For other errors, extract user-friendly message
            const errorMsg = getErrorMessage(err);
            console.error('Exception in userPreferencesApi:', err);
            return { error: errorMsg };
        }
    },

    async updatePreferences(preferences: UserPreferences): Promise<UserPreferences | { error: string }> {
        try {
            // Backend expects POST with action 'updatePreferences' and 'preferences' object
            // invoke defaults to POST when body is present
            const { data, error } = await supabase.functions.invoke('user-preferences', {
                body: {
                    action: 'updatePreferences',
                    preferences: preferences
                },
            });

            if (error) {
                // Check for authentication errors (4xx only, not 5xx server errors)
                if (isAuthError(error)) {
                    return { error: 'AUTH_REQUIRED' };
                }
                // For other errors, extract user-friendly message
                const errorMsg = getErrorMessage(error);
                console.error('Error updating user preferences:', error);
                throw new Error(errorMsg);
            }

            // Backend returns: { success: boolean, preferences: UserPreferences, error?: string }
            if (data && data.success) {
                return data.preferences;
            }

            // Check if backend returned an auth error
            if (data && data.error === 'AUTH_REQUIRED') {
                return { error: 'AUTH_REQUIRED' };
            }

            return { error: data?.error || 'Failed to update preferences' };
        } catch (err: any) {
            // Check if the caught exception is an auth error
            if (isAuthError(err)) {
                return { error: 'AUTH_REQUIRED' };
            }
            // For other errors, extract user-friendly message
            const errorMsg = getErrorMessage(err);
            console.error('Exception in updatePreferences:', err);
            throw new Error(errorMsg);
        }
    }
};
