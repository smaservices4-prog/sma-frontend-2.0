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

export const storageApi = {
    uploadFileWithMetadata: async (data: UploadFileRequest) => {
        const { data: responseData, error } = await supabase.functions.invoke('admin-storage', {
            body: data
        });

        if (error) throw error;
        return responseData;
    },

    listFiles: async (): Promise<{ files: AdminFileItem[] }> => {
        const { data, error } = await supabase.functions.invoke('admin-storage', {
            body: {
                action: 'listFiles'
            }
        });

        if (error) throw error;
        return data;
    },

    deleteFile: async (filePath: string) => {
        const { data, error } = await supabase.functions.invoke('admin-storage', {
            body: {
                action: 'deleteFile',
                filePath,
            },
        });

        if (error) throw error;
        return data;
    },

    getFileUrl: async (filePath: string) => {
        const { data, error } = await supabase.functions.invoke('admin-storage', {
            body: {
                action: 'getFileUrl',
                filePath,
            },
        });

        if (error) throw error;
        return data;
    }
};
