import { redirect } from 'next/navigation';
import { reportsApi } from '@/api/reports';
import { createServerClient } from '@/lib/supabase-server';
import { Typography, Container } from '@mui/material';
import PdfViewerWrapper from '@/components/reports/PdfViewerWrapper';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ReportReaderPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createServerClient();

    // Check authentication & Get Report File in one go (API does auth check too, but good to check session)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        redirect('/login');
    }

    const result = await reportsApi.getReportFile(id, supabase);
    
    if (!result.success) {
        if (result.error === 'AUTH_REQUIRED') {
            redirect('/login');
        }
        return (
            <Container sx={{ py: 8 }}>
                <Typography color="error" align="center">{result.error || 'Error desconocido'}</Typography>
            </Container>
        );
    }

    if (!result.report?.file_url) {
         return (
            <Container sx={{ py: 8 }}>
                <Typography color="error" align="center">No se pudo obtener el archivo del reporte.</Typography>
            </Container>
        );
    }

    return <PdfViewerWrapper url={result.report.file_url} />;
}
