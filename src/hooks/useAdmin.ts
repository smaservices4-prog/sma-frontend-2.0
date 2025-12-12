import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { storageApi } from '@/api/storage';
import { useAuthErrorHandler } from '@/hooks/useAuthErrorHandler';

export function useAdmin() {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const { checkError } = useAuthErrorHandler();

    useEffect(() => {
        let mounted = true;

        const checkAdminStatus = async () => {
            if (!user) {
                if (mounted) {
                    setIsAdmin(false);
                    setLoading(false);
                }
                return;
            }

            try {
                // Call backend to verify admin status
                const result = await storageApi.verifyAdmin();
                // Check for auth errors
                if (result && typeof result === 'object' && 'error' in result) {
                    checkError(result.error);
                    if (mounted) {
                        setIsAdmin(false);
                    }
                    return; // Exit early if auth error was handled
                }
                if (mounted) {
                    setIsAdmin(result);
                }
            } catch (error) {
                console.error('Failed to verify admin status:', error);
                if (mounted) {
                    setIsAdmin(false);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        checkAdminStatus();

        return () => {
            mounted = false;
        };
    }, [user]);

    return { isAdmin, loading };
}
