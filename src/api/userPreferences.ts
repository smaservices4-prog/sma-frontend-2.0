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
async function getErrorMessage(error: any): Promise<string> {
    let responseData = null;
    
    // The error.context is the Fetch API Response object
    if (error?.context instanceof Response) {
        try {
            // Clone the response to read the body (Response body can only be read once)
            const responseClone = error.context.clone();
            const bodyText = await responseClone.text();
            
            if (bodyText) {
                try {
                    responseData = JSON.parse(bodyText);
                } catch (e) {
                    // Body is not JSON, ignore
                }
            }
        } catch (e) {
            // Could not read response body, continue to fallbacks
        }
    }
    
    // Fallback to other locations if the above didn't work
    if (!responseData) {
        // 1. Direct data property
        if (error?.data) {
            responseData = error.data;
        }
        // 2. Context response data
        else if (error?.context?.response?.data) {
            responseData = error.context.response.data;
        }
        // 3. Direct JSON in context
        else if (error?.context?.data) {
            responseData = error.context.data;
        }
        // 4. Parse JSON from error message if it contains JSON
        else if (error?.message && error.message.includes('{')) {
            try {
                const jsonMatch = error.message.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    responseData = JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                // Could not parse JSON from error message
            }
        }
    }
    
    if (responseData) {
        // If backend returned a structured error with a user-friendly message
        // Handle both { error: "message" } and { success: false, error: "message" }
        if (responseData.error && typeof responseData.error === 'string') {
            // Check if it's a safe message (not exposing internals)
            if (!responseData.error.includes('Internal') && 
                !responseData.error.includes('Stack') &&
                !responseData.error.includes('at ') &&
                responseData.error.length < 500) {
                return responseData.error;
            }
        }
        
        // Alternative: check for details field
        if (responseData.details && typeof responseData.details === 'string') {
            if (!responseData.details.includes('Internal') && 
                !responseData.details.includes('Stack') &&
                !responseData.details.includes('at ') &&
                responseData.details.length < 500) {
                return responseData.details;
            }
        }
        
        // Alternative: check for message field
        if (responseData.message && typeof responseData.message === 'string') {
            if (!responseData.message.includes('Internal') && 
                !responseData.message.includes('Stack') &&
                !responseData.message.includes('at ') &&
                responseData.message.length < 500) {
                return responseData.message;
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
            const errorMsg = await getErrorMessage(error);
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
            const errorMsg = await getErrorMessage(err);
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
                const errorMsg = await getErrorMessage(error);
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
            const errorMsg = await getErrorMessage(err);
            console.error('Exception in updatePreferences:', err);
            throw new Error(errorMsg);
        }
    }
};
