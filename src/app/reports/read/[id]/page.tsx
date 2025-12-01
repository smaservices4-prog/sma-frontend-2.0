'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { reportsApi } from '@/api/reports';
import SecurePdfViewer from '@/components/reports/SecurePdfViewer';
import { Box, CircularProgress, Typography, Container } from '@mui/material';

export default function ReportReaderPage() {
    const params = useParams();
    const router = useRouter();
    const [url, setUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            const id = Array.isArray(params.id) ? params.id[0] : params.id;
            if (!id) return;

            const result = await reportsApi.getReportFile(id);
            
            if (!result.success) {
                if (result.error === 'AUTH_REQUIRED') {
                    router.push('/login');
                } else {
                    setError(result.error || 'Error desconocido');
                }
                return;
            }

            if (result.report?.file_url) {
                setUrl(result.report.file_url);
            }
        };

        fetchReport();
    }, [params.id, router]);

    if (error) return <Container sx={{ py: 8 }}><Typography color="error" align="center">{error}</Typography></Container>;
    if (!url) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return <SecurePdfViewer url={url} />;
}

