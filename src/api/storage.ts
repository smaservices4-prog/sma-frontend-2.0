import { supabase } from '@/lib/supabase';
import { AdminFileItem } from '@/types';

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
            // Check for authentication errors
            if (error.status === 401 || error.message?.includes('auth') || error.message?.includes('unauthorized')) {
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
            // Check for authentication errors
            if (error.status === 401 || error.message?.includes('auth') || error.message?.includes('unauthorized')) {
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
            // Check for authentication errors
            if (error.status === 401 || error.message?.includes('auth') || error.message?.includes('unauthorized')) {
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

    deleteFile: async (filePath: string) => {
        const { data, error } = await supabase.functions.invoke('admin-storage', {
            body: {
                action: 'deleteFile',
                filePath,
            },
        });

        if (error) {
            // Check for authentication errors
            if (error.status === 401 || error.message?.includes('auth') || error.message?.includes('unauthorized')) {
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

    getFileUrl: async (filePath: string) => {
        const { data, error } = await supabase.functions.invoke('admin-storage', {
            body: {
                action: 'getFileUrl',
                filePath,
            },
        });

        if (error) {
            // Check for authentication errors
            if (error.status === 401 || error.message?.includes('auth') || error.message?.includes('unauthorized')) {
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
            // Check for authentication errors
            if (error.status === 401 || error.message?.includes('auth') || error.message?.includes('unauthorized')) {
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
                // Check for authentication errors
                if (error.status === 401 || error.message?.includes('auth') || error.message?.includes('unauthorized')) {
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
        } catch (err) {
            console.error('Admin verification error:', err);
            return false;
        }
    }
};
