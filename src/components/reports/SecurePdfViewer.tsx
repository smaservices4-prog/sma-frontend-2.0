'use client';

import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, IconButton, Typography, Paper, CircularProgress, useMediaQuery, useTheme, Button, Slide } from '@mui/material';
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
    const [showToolbar, setShowToolbar] = useState(true);
    const lastScrollTop = useRef(0);
    const scrollThreshold = 10; // Minimum scroll diff to trigger action
    
    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const currentScrollTop = e.currentTarget.scrollTop;
        
        // Always show toolbar at the very top or if bouncing
        if (currentScrollTop <= 0) {
            setShowToolbar(true);
            lastScrollTop.current = 0;
            return;
        }

        const diff = Math.abs(currentScrollTop - lastScrollTop.current);
        if (diff < scrollThreshold) return;

        if (currentScrollTop > lastScrollTop.current) {
            // Scrolling down - hide toolbar
            if (showToolbar) {
                setShowToolbar(false);
            }
        } else if (currentScrollTop < lastScrollTop.current) {
            // Scrolling up - show toolbar
            if (!showToolbar) {
                setShowToolbar(true);
            }
        }
        
        lastScrollTop.current = currentScrollTop;
    };

    return (
        <Box 
            sx={{ 
                bgcolor: '#525659', // Adobe Reader dark background
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
                overflow: 'hidden'
            }}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Toolbar - Fixed at top with Slide animation */}
            <Slide appear={false} direction="down" in={showToolbar}>
                <Paper 
                    elevation={3} 
                    square
                    sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        p: 0.5, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        bgcolor: 'white',
                        zIndex: 10,
                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                        height: isMobile ? 48 : 56,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                        <Typography variant={isMobile ? "body2" : "subtitle2"} sx={{ fontWeight: 600, ml: 1, whiteSpace: 'nowrap', color: 'text.primary' }}>
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
                        <Typography variant="caption" sx={{ minWidth: 30, textAlign: 'center', fontSize: '0.75rem', color: 'text.primary' }}>
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
            </Slide>

            {/* Scrollable Content Area */}
            <Box sx={{ 
                flexGrow: 1, 
                overflowY: 'auto', 
                overflowX: 'auto', // Allow horizontal scroll if zoomed in
                width: '100%',
                height: '100%',
                p: { xs: 1, md: 4 },
                pt: { xs: 7, md: 9 }, // Add padding top to account for toolbar + spacing
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start', 
            }}
            onScroll={handleScroll}
            >
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
