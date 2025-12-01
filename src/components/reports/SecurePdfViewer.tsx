'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from '@mui/icons-material';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// CONFIGURE WORKER LOCALLY (NO CDN)
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface SecurePdfViewerProps {
    url: string;
}

export default function SecurePdfViewer({ url }: SecurePdfViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);
    }

    const changePage = (offset: number) => {
        setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages || 1));
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                bgcolor: '#f5f5f5',
                minHeight: '80vh',
                p: 4,
                userSelect: 'none', // Disable text selection
                WebkitUserSelect: 'none',
            }}
            onContextMenu={(e) => e.preventDefault()} // Disable right click
        >
            {/* Toolbar */}
            <Paper elevation={3} sx={{ p: 1, mb: 3, display: 'flex', gap: 2, alignItems: 'center', position: 'sticky', top: 20, zIndex: 10 }}>
                <Button disabled={pageNumber <= 1} onClick={() => changePage(-1)}>
                    <ChevronLeft />
                </Button>
                <Typography>
                    Página {pageNumber} de {numPages || '--'}
                </Typography>
                <Button disabled={pageNumber >= (numPages || 0)} onClick={() => changePage(1)}>
                    <ChevronRight />
                </Button>
                
                <Box sx={{ width: 1, bgcolor: 'divider', height: 24, mx: 1 }} />

                <Button onClick={() => setScale(s => Math.max(0.5, s - 0.1))}><ZoomOut /></Button>
                <Typography>{Math.round(scale * 100)}%</Typography>
                <Button onClick={() => setScale(s => Math.min(2.0, s + 0.1))}><ZoomIn /></Button>
            </Paper>

            {/* PDF Render */}
            <Paper elevation={5} sx={{ p: 2 }}>
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<CircularProgress />}
                    error={<Typography color="error">Error al cargar el PDF.</Typography>}
                >
                    <Page 
                        pageNumber={pageNumber} 
                        scale={scale} 
                        renderTextLayer={false} // Disable selectable text layer
                        renderAnnotationLayer={false} // Disable links/annotations
                    />
                </Document>
            </Paper>
        </Box>
    );
}

