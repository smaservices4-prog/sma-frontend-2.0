'use client';

import React, { createContext, useContext, useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';

interface AuthModalContextType {
    showAuthModal: (message?: string) => void;
    hideAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState<string>('');

    const showAuthModal = (customMessage?: string) => {
        console.log('AuthModalContext.showAuthModal called with message:', customMessage);
        setMessage(customMessage || 'Para continuar con esta acción, necesitas iniciar sesión en tu cuenta.');
        setIsOpen(true);
    };

    const hideAuthModal = () => {
        setIsOpen(false);
        setMessage('');
    };

    return (
        <AuthModalContext.Provider value={{ showAuthModal, hideAuthModal }}>
            {children}
            <AuthModal
                open={isOpen}
                onClose={hideAuthModal}
                message={message}
            />
        </AuthModalContext.Provider>
    );
}

export function useAuthModal() {
    const context = useContext(AuthModalContext);
    if (context === undefined) {
        throw new Error('useAuthModal must be used within an AuthModalProvider');
    }
    return context;
}
