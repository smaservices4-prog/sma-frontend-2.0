/**
 * Helpers for parsing Supabase password-recovery redirect URLs
 * (PKCE ?code=…, implicit #access_token=…&type=recovery, and error query params)
 * and for deduplicating the PKCE code exchange across React StrictMode remounts.
 */

import type { AuthError, SupabaseClient } from '@supabase/supabase-js';

type ExchangeResult = { error: AuthError | null };

const inFlightExchanges = new Map<string, Promise<ExchangeResult>>();
const completedExchanges = new Map<string, ExchangeResult>();

/**
 * Runs `supabase.auth.exchangeCodeForSession` at most once per `code`.
 * Further calls with the same `code` await (or replay) the original result,
 * so React StrictMode double-mounts in dev don't consume the PKCE code_verifier twice.
 */
export async function exchangePkceCodeOnce(
    client: SupabaseClient,
    code: string,
): Promise<ExchangeResult> {
    const done = completedExchanges.get(code);
    if (done) {
        return done;
    }
    const existing = inFlightExchanges.get(code);
    if (existing) {
        return existing;
    }
    const promise = client.auth
        .exchangeCodeForSession(code)
        .then((res): ExchangeResult => ({ error: res.error ?? null }))
        .then((result) => {
            completedExchanges.set(code, result);
            inFlightExchanges.delete(code);
            return result;
        })
        .catch((err: unknown) => {
            const result: ExchangeResult = { error: err as AuthError };
            completedExchanges.set(code, result);
            inFlightExchanges.delete(code);
            return result;
        });
    inFlightExchanges.set(code, promise);
    return promise;
}

export function getPkceCodeFromSearchParams(searchParams: URLSearchParams): string | null {
    return searchParams.get('code');
}

export function hasImplicitRecoveryTokensInSearch(searchParams: URLSearchParams): boolean {
    return searchParams.has('access_token') && searchParams.get('type') === 'recovery';
}

export function hasImplicitRecoveryTokensInHash(hash: string): boolean {
    const normalized = hash.replace(/^#/, '');
    if (!normalized) {
        return false;
    }
    const params = new URLSearchParams(normalized);
    return params.has('access_token') && params.get('type') === 'recovery';
}

/**
 * When Supabase redirects with ?error=… (e.g. otp_expired, access_denied).
 */
export function getRecoveryErrorMessageFromUrl(searchParams: URLSearchParams): string | null {
    const err = searchParams.get('error');
    if (!err) {
        return null;
    }
    const errorCode = searchParams.get('error_code');
    const description = searchParams.get('error_description');

    if (errorCode === 'otp_expired' || (description && /expired|invalid/i.test(description))) {
        return 'El enlace expiró o ya fue usado. Solicitá un nuevo enlace de recuperación.';
    }
    if (description) {
        return decodeURIComponent(description.replace(/\+/g, ' '));
    }
    if (err === 'access_denied') {
        return 'Acceso al enlace denegado. Por favor, solicitá un enlace nuevo.';
    }
    return 'No se pudo completar el enlace. Por favor, solicitá uno nuevo.';
}

export function clearUrlFragmentAndQueryPreservingPath(): void {
    if (typeof window === 'undefined') {
        return;
    }
    const path = window.location.pathname;
    window.history.replaceState(null, '', path);
}
