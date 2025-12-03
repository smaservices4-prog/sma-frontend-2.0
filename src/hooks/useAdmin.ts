import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { storageApi } from '@/api/storage';

export function useAdmin() {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

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
                const isVerified = await storageApi.verifyAdmin();
                if (mounted) {
                    setIsAdmin(isVerified);
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
