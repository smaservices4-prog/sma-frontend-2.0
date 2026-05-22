/**
 * Mensajes de Supabase Auth (GoTrue) en español, por código estable.
 * Ver respuestas JSON: { "code": "...", "message": "..." }.
 */
const AUTH_ERROR_BY_CODE: Record<string, string> = {
    invalid_credentials: 'Credenciales inválidas.',
    email_not_confirmed:
        'Tenés que confirmar tu correo electrónico antes de iniciar sesión.',
    user_already_registered: 'Este correo electrónico ya está registrado.',
    user_already_exists: 'Ya existe un usuario con este correo electrónico.',
    same_password: 'La nueva contraseña debe ser diferente a la anterior.',
    weak_password: 'La contraseña no cumple los requisitos de seguridad.',
    otp_expired: 'El código expiró. Solicitá uno nuevo.',
    access_denied: 'Acceso denegado.',
    refresh_token_not_found: 'Sesión inválida. Iniciá sesión de nuevo.',
    session_not_found: 'No hay sesión activa. Iniciá sesión de nuevo.',
    flow_state_expired: 'El enlace expiró. Volvé a intentar el proceso.',
    over_email_send_rate_limit:
        'Demasiados correos enviados. Esperá unos minutos e intentá de nuevo.',
    over_request_rate_limit:
        'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
    signup_disabled: 'Los registros están deshabilitados.',
};

/**
 * Respaldo por texto en inglés (normalizado), por si falta `code` o cambia en el servidor.
 */
const AUTH_ERROR_BY_NORMALIZED_MESSAGE: Record<string, string> = {
    'invalid login credentials': 'Credenciales inválidas.',
    'email not confirmed':
        'Tenés que confirmar tu correo electrónico antes de iniciar sesión.',
    'new password should be different':
        'La nueva contraseña debe ser diferente a la anterior.',
    'new password should be different from the old password':
        'La nueva contraseña debe ser diferente a la anterior.',
    'user already registered': 'Este correo electrónico ya está registrado.',
    'password recovery email sent':
        'Te enviamos un correo para restablecer la contraseña.',
    'forbidden resource': 'No tenés permiso para esta operación.',
};

function normalizeMessageKey(text: string): string {
    return text.trim().replace(/[.!?]+$/g, '').toLowerCase();
}

function readAuthLikeFields(error: unknown): { code?: string; message?: string } {
    if (!error || typeof error !== 'object') {
        return {};
    }
    const o = error as Record<string, unknown>;
    const code = typeof o.code === 'string' ? o.code : undefined;
    const message = typeof o.message === 'string' ? o.message : undefined;
    return { code, message };
}

/**
 * Convierte un error de Supabase Auth (u objeto similar) a mensaje en español.
 */
export function translateAuthError(
    error: unknown,
    fallbackMessage = 'Ocurrió un error. Intentá de nuevo.',
): string {
    const { code, message } = readAuthLikeFields(error);

    if (code) {
        const byCode = AUTH_ERROR_BY_CODE[code.toLowerCase()];
        if (byCode) {
            return byCode;
        }
    }

    if (message) {
        const key = normalizeMessageKey(message);
        const byMsg = key ? AUTH_ERROR_BY_NORMALIZED_MESSAGE[key] : undefined;
        if (byMsg) {
            return byMsg;
        }
        return message;
    }

    return fallbackMessage;
}
