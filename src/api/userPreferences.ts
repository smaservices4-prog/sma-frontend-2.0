import { supabase } from '@/lib/supabase';

export interface UserPreferences {
    preferred_currency: 'USD' | 'ARS' | 'EUR';
}

export const userPreferencesApi = {
    async getPreferences(): Promise<UserPreferences | null> {
        // Backend expects POST with action 'getPreferences' (RPC style)
        // invoke defaults to POST when body is present
        const { data, error } = await supabase.functions.invoke('user-preferences', {
            body: { action: 'getPreferences' },
        });
        
        if (error) {
            console.error('Error fetching user preferences:', error);
            return null;
        }
        
        // Backend returns: { success: boolean, preferences: UserPreferences, error?: string }
        if (data && data.success) {
            return data.preferences;
        }
        
        return null;
    },

    async updatePreferences(preferences: UserPreferences): Promise<UserPreferences | null> {
        // Backend expects POST with action 'updatePreferences' and 'preferences' object
        // invoke defaults to POST when body is present
        const { data, error } = await supabase.functions.invoke('user-preferences', {
            body: { 
                action: 'updatePreferences',
                preferences: preferences
            },
        });

        if (error) {
            console.error('Error updating user preferences:', error);
            throw error;
        }
        
        // Backend returns: { success: boolean, preferences: UserPreferences, error?: string }
        if (data && data.success) {
            return data.preferences;
        }
        
        return null;
    }
};
