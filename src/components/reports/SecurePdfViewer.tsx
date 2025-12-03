'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, IconButton, Typography, Paper, CircularProgress, useMediaQuery, useTheme, Button } from '@mui/material';
import { ZoomIn, ZoomOut, Close } from '@mui/icons-material';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// CONFIGURE WORKER LOCALLY (NO CDN)
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

interface SecurePdfViewerProps {
    url: string;
}

export default function SecurePdfViewer({ url }: SecurePdfViewerProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [numPages, setNumPages] = useState<number | null>(null);
    const [scale, setScale] = useState(isMobile ? 0.6 : 1.0);
    
    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <Box 
            sx={{ 
                bgcolor: '#f5f5f5',
                height: '100vh',
                width: '100vw',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1300,
                display: 'flex',
                flexDirection: 'column',
                userSelect: 'none',
                WebkitUserSelect: 'none',
            }}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Compact Toolbar */}
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 0.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    bgcolor: 'white',
                    zIndex: 10,
                    borderRadius: 0,
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                    height: isMobile ? 48 : 56,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                    <Typography variant={isMobile ? "body2" : "subtitle2"} sx={{ fontWeight: 600, ml: 1, whiteSpace: 'nowrap' }}>
                        Visor
                    </Typography>
                    {numPages && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            ({numPages} pág.)
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => setScale(s => Math.max(0.3, s - 0.1))}>
                        <ZoomOut fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" sx={{ minWidth: 30, textAlign: 'center', fontSize: '0.75rem' }}>
                        {Math.round(scale * 100)}%
                    </Typography>
                    <IconButton size="small" onClick={() => setScale(s => Math.min(3.0, s + 0.1))}>
                        <ZoomIn fontSize="small" />
                    </IconButton>
                    
                    <Box sx={{ width: 1, bgcolor: 'divider', height: 20, mx: 0.5 }} />
                    
                    <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => window.history.back()}
                    >
                        <Close />
                    </IconButton>
                </Box>
            </Paper>

            {/* Scrollable Content Area */}
            <Box sx={{ 
                flexGrow: 1, 
                overflowY: 'auto', 
                overflowX: 'auto', // Allow horizontal scroll if zoomed in
                p: { xs: 1, md: 4 },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start', 
                backgroundColor: '#525659' // Adobe Reader dark background
            }}>
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white', mt: 4 }}>
                            <CircularProgress size={30} color="inherit" />
                            <Typography>Cargando...</Typography>
                        </Box>
                    }
                    error={
                        <Paper sx={{ p: 2, color: 'error.main', textAlign: 'center', mt: 4 }}>
                            <Typography variant="body2">Error al cargar el documento.</Typography>
                            <Button size="small" sx={{ mt: 1 }} onClick={() => window.location.reload()}>Reintentar</Button>
                        </Paper>
                    }
                >
                    {numPages && Array.from(new Array(numPages), (el, index) => (
                        <Paper 
                            key={`page_${index + 1}`} 
                            elevation={4} 
                            sx={{ mb: 2 }}
                        >
                            <Page 
                                pageNumber={index + 1} 
                                scale={scale} 
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                loading={
                                    <Box sx={{ height: 200, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white' }}>
                                        <CircularProgress size={20} />
                                    </Box>
                                }
                            />
                        </Paper>
                    ))}
                </Document>
            </Box>
        </Box>
    );
}
