'use client';

import { useEffect, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import { supabase } from '@/lib/supabase';

declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
    }
}

interface FacebookSignInButtonProps {
    maxWidth?: number;
    onError?: (error: string) => void;
    widthReady?: boolean;
}

const FacebookSignInButton = ({ maxWidth = 320, onError, widthReady = true }: FacebookSignInButtonProps) => {
    const [loading, setLoading] = useState(false);

    const initializeFacebookSDK = () => {
        const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

        if (!appId) {
            console.warn('NEXT_PUBLIC_FACEBOOK_APP_ID is not defined');
            return;
        }

        // Initialize Facebook SDK
        window.fbAsyncInit = () => {
            window.FB.init({
                appId: appId,
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });
        };

        // Load Facebook SDK script if not already loaded
        if (!document.querySelector('script[src*="connect.facebook.net"]')) {
            const script = document.createElement('script');
            script.async = true;
            script.defer = true;
            script.crossOrigin = 'anonymous';
            script.src = 'https://connect.facebook.net/es_ES/sdk.js';

            script.onerror = () => {
                onError?.('Error al cargar Facebook SDK');
            };

            document.head.appendChild(script);
        } else if (window.FB) {
            // The SDK is already loaded
        }
    };

    const handleSimpleFacebookLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error) {
                throw error;
            }
            // The redirect will happen automatically
        } catch (error: any) {
            onError?.(error.message || 'Error al iniciar sesión con Facebook');
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeFacebookSDK();
    }, []);

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 0,
                opacity: widthReady ? 1 : 0,
                pointerEvents: widthReady ? 'auto' : 'none',
                transition: 'opacity 0.3s cubic-bezier(.4,0,.2,1), width 0.3s cubic-bezier(.4,0,.2,1), max-width 0.3s cubic-bezier(.4,0,.2,1), min-width 0.3s cubic-bezier(.4,0,.2,1)'
            }}
        >
            <Button
                fullWidth
                variant="outlined"
                sx={{
                    height: 44,
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    color: '#3c4043',
                    border: '1px solid #dadce0',
                    textTransform: 'none',
                    fontSize: 14,
                    maxWidth,
                    minWidth: maxWidth,
                    width: '100%',
                    transition: 'width 0.3s cubic-bezier(.4,0,.2,1), max-width 0.3s cubic-bezier(.4,0,.2,1), min-width 0.3s cubic-bezier(.4,0,.2,1)',
                    '&:hover': {
                        backgroundColor: '#eaf1fb',
                        borderColor: '#d2e3fc',
                        boxShadow: ' #d2e3fc',
                    },
                    '&:focus': {
                        outline: 'none',
                        boxShadow: '0 0 0 3px rgba(60,64,67,0.08)'
                    },
                    '&:active': {
                        boxShadow: 'none'
                    },
                    '&:disabled': {
                        backgroundColor: '#f7f8fa',
                        color: '#bcbcbc',
                        boxShadow: 'none'
                    }
                }}
                startIcon={loading ? <CircularProgress size={20} sx={{ color: '#3c4043' }} /> : <FacebookIcon sx={{ color: '#1877F2' }} />}
                onClick={handleSimpleFacebookLogin}
                disabled={loading}
                aria-label="Continuar con Facebook"
            >
                Continuar con Facebook
            </Button>
        </div>
    );
};

export default FacebookSignInButton;
