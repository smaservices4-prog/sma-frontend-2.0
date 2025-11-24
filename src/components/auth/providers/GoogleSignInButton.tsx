'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleSignInButtonProps {
    maxWidth?: number;
    onSuccess?: () => void;
    onError?: (error: string) => void;
    widthReady?: boolean;
}

const GoogleSignInButton = ({ maxWidth = 320, onSuccess, onError, widthReady = true }: GoogleSignInButtonProps) => {
    const buttonRef = useRef<HTMLDivElement>(null);
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
    }, [onSuccess, onError]);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined');
            return;
        }

        // Cargar el script de Google si no está presente
        if (!document.getElementById('google-gsi-script')) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.id = 'google-gsi-script';
            document.body.appendChild(script);
        }

        // Registrar la función global de callback
        (window as any).GoogleSignInButton = async function (response: any) {
            const { credential } = response;
            if (!credential) {
                if (onErrorRef.current) onErrorRef.current('No se recibió el token de Google');
                else alert('No se recibió el token de Google');
                return;
            }
            const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: credential,
            });
            if (error) {
                if (onErrorRef.current) onErrorRef.current('Error autenticando con Google: ' + error.message);
                else alert('Error autenticando con Google: ' + error.message);
            } else {
                if (onSuccessRef.current) onSuccessRef.current();
                else window.location.href = '/';
            }
        };

        // Renderizar el botón de Google
        const renderButton = () => {
            if ((window as any).google && buttonRef.current) {
                (window as any).google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: (window as any).GoogleSignInButton,
                });
                (window as any).google.accounts.id.renderButton(buttonRef.current, {
                    type: 'standard',
                    shape: 'rectangular',
                    text: 'continue_with',
                    size: 'large',
                    logo_alignment: 'center',
                    width: maxWidth,
                });
            }
        };

        // Esperar a que el script cargue
        if (!(window as any).google) {
            const interval = setInterval(() => {
                if ((window as any).google) {
                    clearInterval(interval);
                    renderButton();
                }
            }, 100);
            return () => clearInterval(interval);
        } else {
            renderButton();
        }
    }, [maxWidth]);

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 10,
                opacity: widthReady ? 1 : 0,
                pointerEvents: widthReady ? 'auto' : 'none',
                transition: 'opacity 0.3s cubic-bezier(.4,0,.2,1), width 0.3s cubic-bezier(.4,0,.2,1), max-width 0.3s cubic-bezier(.4,0,.2,1), min-width 0.3s cubic-bezier(.4,0,.2,1)'
            }}
        >
            <div
                ref={buttonRef}
                style={{
                    maxWidth,
                    minWidth: maxWidth,
                    width: '100%',
                    transition: 'width 0.3s cubic-bezier(.4,0,.2,1), max-width 0.3s cubic-bezier(.4,0,.2,1), min-width 0.3s cubic-bezier(.4,0,.2,1)'
                }}
            />
        </div>
    );
};

export default GoogleSignInButton;
