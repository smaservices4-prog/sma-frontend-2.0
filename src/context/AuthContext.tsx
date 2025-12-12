'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    loginWithProvider: (provider: 'google' | 'facebook') => Promise<{ error: any }>;
    resetPassword: (email: string) => Promise<{ error: any }>;
    updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Prevent auth operations during static generation
    const isStaticGeneration = typeof window === 'undefined';

    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Skip auth operations during static generation
        if (isStaticGeneration) {
            setLoading(false);
            return;
        }

        let mounted = true;

        // Check active session once on mount
        const getSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('AuthContext: getSession error:', error);
                }
                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    setLoading(false);
                }
            } catch (error) {
                console.error('AuthContext: getSession exception:', error);
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        getSession();

        // Auth state listener with protection against loops
        let lastSessionId: string | null = null;
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // Prevent duplicate updates for the same session
            const currentSessionId = session?.user?.id || null;
            if (lastSessionId === currentSessionId) {
                return; // Skip if session hasn't actually changed
            }
            lastSessionId = currentSessionId;

            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [isStaticGeneration]);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        // Clear cart from localStorage
        localStorage.removeItem('cart');
        router.push('/login');
    };

    const loginWithProvider = async (provider: 'google' | 'facebook') => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        return { error };
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        return { error };
    };

    const updatePassword = async (password: string) => {
        const { error } = await supabase.auth.updateUser({
            password,
        });
        return { error };
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signOut, loginWithProvider, resetPassword, updatePassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
