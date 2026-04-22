/** Shown when storage API returns AUTH_REQUIRED or checkError opened the auth modal. */
export const STORAGE_AUTH_SESSION_MESSAGE_ES =
    'Tu sesión expiró o no estás autenticado. Iniciá sesión e intentá de nuevo.';

/**
 * Maps a storage/admin edge error string to UI copy.
 * @param apiError - Value from `storageApi.*` `{ error: string }` (e.g. AUTH_REQUIRED or server message)
 * @param authHandled - True if `checkError(apiError)` returned true (modal shown)
 */
export function messageForStorageApiError(apiError: string, authHandled: boolean): string {
    if (authHandled || apiError === 'AUTH_REQUIRED') {
        return STORAGE_AUTH_SESSION_MESSAGE_ES;
    }
    return apiError;
}
