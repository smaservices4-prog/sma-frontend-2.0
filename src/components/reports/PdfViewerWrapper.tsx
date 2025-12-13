'use client';

import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';

const SecurePdfViewer = dynamic(() => import('./SecurePdfViewer'), {
    ssr: false,
    loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
});

interface PdfViewerWrapperProps {
    url: string;
}

export default function PdfViewerWrapper({ url }: PdfViewerWrapperProps) {
    return <SecurePdfViewer url={url} />;
}

