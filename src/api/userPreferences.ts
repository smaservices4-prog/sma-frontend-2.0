import { supabase } from '@/lib/supabase';

export interface UserPreferences {
    preferred_currency: 'USD' | 'ARS' | 'EUR';
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
                console.log('userPreferencesApi error:', error);
                console.log('error.status:', error.status);
                console.log('error.message:', error.message);
                console.log('error.details:', error.details);
                // Check for authentication errors
                if (error.status === 401 || error.message?.includes('auth') || error.message?.includes('unauthorized')) {
                    console.log('Auth error detected in userPreferencesApi:', error);
                    return { error: 'AUTH_REQUIRED' };
                }
                console.error('Error fetching user preferences:', error);
                return { error: error.message || 'Failed to fetch preferences' };
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
            console.log('userPreferencesApi caught exception:', err);
            console.log('exception status:', err.status);
            console.log('exception message:', err.message);
            // Check if the caught exception is an auth error
            if (err.status === 401 || err.message?.includes('auth') || err.message?.includes('unauthorized')) {
                console.log('Auth error detected in caught exception:', err);
                return { error: 'AUTH_REQUIRED' };
            }
            console.error('Exception in userPreferencesApi:', err);
            return { error: err.message || 'Failed to fetch preferences' };
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
                // Check for authentication errors
                if (error.status === 401 || error.message?.includes('auth') || error.message?.includes('unauthorized')) {
                    return { error: 'AUTH_REQUIRED' };
                }
                console.error('Error updating user preferences:', error);
                throw error;
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
            if (err.status === 401 || err.message?.includes('auth') || err.message?.includes('unauthorized')) {
                return { error: 'AUTH_REQUIRED' };
            }
            console.error('Exception in updatePreferences:', err);
            throw err;
        }
    }
};
