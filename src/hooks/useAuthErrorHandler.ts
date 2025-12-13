'use client';

import { useCallback } from 'react';
import { useAuthModal } from '@/context/AuthModalContext';

export function useAuthErrorHandler() {
    const { showAuthModal } = useAuthModal();

    const handleApiResponse = useCallback(<T>(response: T | { error: string; success: boolean }): T | null => {
        // Check if response is an error object with AUTH_REQUIRED
        if (response && typeof response === 'object' && 'error' in response && 'success' in response) {
            const errorResponse = response as { error: string; success: boolean };
            if (!errorResponse.success && errorResponse.error === 'AUTH_REQUIRED') {
                showAuthModal();
                return null; // Return null to indicate auth modal was shown
            }
        }
        return response as T;
    }, [showAuthModal]);

    const checkError = useCallback((error: any): boolean => {
        // Check if error is AUTH_REQUIRED
        if (typeof error === 'string' && error === 'AUTH_REQUIRED') {
            showAuthModal();
            return true; // Error was handled
        }

        // Check if error object contains AUTH_REQUIRED
        if (error && typeof error === 'object') {
            if (error.error === 'AUTH_REQUIRED' || error.message === 'AUTH_REQUIRED') {
                showAuthModal();
                return true;
            }
        }

        return false; // Error was not handled
    }, [showAuthModal]);

    return {
        handleApiResponse,
        checkError,
        showAuthModal,
    };
}
