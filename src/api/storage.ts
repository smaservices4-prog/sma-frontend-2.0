import { supabase } from '@/lib/supabase';
import { AdminFileItem } from '@/types';

/**
 * Extracts the HTTP status code from Supabase error message
 * Supabase FunctionsHttpError messages are formatted like: "non-2xx status code: 401"
 */
function extractStatusCode(errorMessage?: string): number | null {
    if (!errorMessage) return null;
    const match = errorMessage.match(/status code:\s*(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Checks if an error is an authentication error (4xx client errors)
 * Only 4xx errors should trigger re-authentication, not 5xx server errors
 */
function isAuthError(error: any): boolean {
    // Check explicit 401/403 status
    if (error.status === 401 || error.status === 403) {
        return true;
    }
    if ((error as any).context?.status === 401 || (error as any).context?.status === 403) {
        return true;
    }
    
    // Extract status from error message and check if it's 4xx
    const statusCode = extractStatusCode(error.message);
    if (statusCode && statusCode >= 400 && statusCode < 500) {
        return true;
    }
    
    // Check for explicit auth-related messages
    if (error.message?.includes('auth') || error.message?.includes('unauthorized')) {
        return true;
    }
    
    return false;
}

export interface UploadFileRequest {
    action: 'uploadFile';
    file: {
        name: string;
        size: number;
        type: string;
    };
    fileData: number[]; // Array.from(uint8Array)
    report_metadata: {
        title: string;
        month: string; // YYYY-MM-DD
        prices: {
            currency: string;
            amount: number;
        }[];
        preview_url?: string;
    };
}

export interface UpdateMetadataRequest {
    action: 'updateMetadata';
    report_id: string;
    report_metadata: {
        title: string;
        month: string;
        prices: {
            currency: string;
            amount: number;
        }[];
        preview_url?: string;
    };
}

export interface UploadFileResponse {
    success: boolean;
    file_path: string;
    original_name: string;
    sanitized_name: string;
    report_id: string;
}

export interface UploadThumbnailRequest {
    action: 'uploadThumbnail';
    report_id: string;
    file: {
        name: string;
        size: number;
        type: string;
    };
    fileData: number[];
}

export interface UploadThumbnailResponse {
    success: boolean;
    report_id: string;
    thumbnail_uploaded: boolean;
    thumbnail_path?: string;
    thumbnail_error?: string;
    original_name?: string;
}

export const storageApi = {
    uploadFileWithMetadata: async (data: UploadFileRequest): Promise<UploadFileResponse | { error: string }> => {
        const { data: responseData, error } = await supabase.functions.invoke('admin-storage', {
            body: data
        });

        if (error) {
            // Check for authentication errors (4xx only, not 5xx server errors)
            if (isAuthError(error)) {
                return { error: 'AUTH_REQUIRED' };
            }
            throw error;
        }

        // Check if backend returned an auth error
        if (responseData && responseData.error === 'AUTH_REQUIRED') {
            return { error: 'AUTH_REQUIRED' };
        }

        return responseData;
    },

    uploadThumbnail: async (data: UploadThumbnailRequest): Promise<UploadThumbnailResponse | { error: string }> => {
        const { data: responseData, error } = await supabase.functions.invoke('admin-storage', {
            body: data
        });

        if (error) {
            // Check for authentication errors (4xx only, not 5xx server errors)
            if (isAuthError(error)) {
                return { error: 'AUTH_REQUIRED' };
            }
            throw error;
        }

        // Check if backend returned an auth error
        if (responseData && responseData.error === 'AUTH_REQUIRED') {
            return { error: 'AUTH_REQUIRED' };
        }

        return responseData;
    },

    listFiles: async (): Promise<{ files: AdminFileItem[] } | { error: string }> => {
        const { data, error } = await supabase.functions.invoke('admin-storage', {
            body: {
                action: 'listFiles'
            }
        });

        if (error) {
            // Check for authentication errors (4xx only, not 5xx server errors)
            if (isAuthError(error)) {
                return { error: 'AUTH_REQUIRED' };
            }
            throw error;
        }

        // Check if backend returned an auth error
        if (data && data.error === 'AUTH_REQUIRED') {
            return { error: 'AUTH_REQUIRED' };
        }

        return data;
    },

    deleteReport: async (reportId: string) => {
        const { data, error } = await supabase.functions.invoke('admin-storage', {
            body: {
                action: 'deleteReport',
                report_id: reportId,
            },
        });

        if (error) {
            // Check for authentication errors (4xx only, not 5xx server errors)
            if (isAuthError(error)) {
                return { error: 'AUTH_REQUIRED' };
            }
            // Check for forbidden access (e.g. purchases exist)
            if (error.status === 403 || (error as any).context?.status === 403) {
                return { error: 'FORBIDDEN' };
            }
            throw error;
        }

        // Check if backend returned an auth error
        if (data && data.error === 'AUTH_REQUIRED') {
            return { error: 'AUTH_REQUIRED' };
        }

        return data;
    },

    getFileUrl: async (filePath: string) => {
        const { data, error } = await supabase.functions.invoke('admin-storage', {
            body: {
                action: 'getFileUrl',
                filePath,
            },
        });

        if (error) {
            // Check for authentication errors (4xx only, not 5xx server errors)
            if (isAuthError(error)) {
                return { error: 'AUTH_REQUIRED' };
            }
            throw error;
        }

        // Check if backend returned an auth error
        if (data && data.error === 'AUTH_REQUIRED') {
            return { error: 'AUTH_REQUIRED' };
        }

        return data;
    },

    updateMetadata: async (reportId: string, metadata: UpdateMetadataRequest['report_metadata']) => {
        const { data, error } = await supabase.functions.invoke('admin-storage', {
            body: {
                action: 'updateMetadata',
                report_id: reportId,
                report_metadata: metadata
            }
        });

        if (error) {
            // Check for authentication errors (4xx only, not 5xx server errors)
            if (isAuthError(error)) {
                return { error: 'AUTH_REQUIRED' };
            }
            throw error;
        }

        // Check if backend returned an auth error
        if (data && data.error === 'AUTH_REQUIRED') {
            return { error: 'AUTH_REQUIRED' };
        }

        return data;
    },

    verifyAdmin: async (): Promise<boolean | { error: string }> => {
        try {
            const { data, error } = await supabase.functions.invoke('admin-storage', {
                body: {
                    action: 'verifyAdmin'
                }
            });

            if (error) {
                // Check for authentication errors (4xx only, not 5xx server errors)
                if (isAuthError(error)) {
                    return { error: 'AUTH_REQUIRED' };
                }
                console.error('Admin verification failed:', error);
                return false;
            }

            // Check if backend returned an auth error
            if (data && data.error === 'AUTH_REQUIRED') {
                return { error: 'AUTH_REQUIRED' };
            }

            return data?.is_admin === true;
        } catch (err: any) {
            // Check if the caught exception is an auth error
            if (isAuthError(err)) {
                return { error: 'AUTH_REQUIRED' };
            }
            console.error('Admin verification error:', err);
            return false;
        }
    }
};
