'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Pagination, FormControlLabel, Switch, Fab, Skeleton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReportCard from '@/components/reports/ReportCard';
import Filters from '@/components/reports/Filters';
import { useSearch } from '@/context/SearchContext';
import { Report } from '@/types';
import { useAdmin } from '@/hooks/useAdmin';
import ReportUploadDialog from '@/components/admin/ReportUploadDialog';
import ReportEditDialog from '@/components/admin/ReportEditDialog';
import { storageApi } from '@/api/storage';

interface HomeContentProps {
  initialReports: Report[];
}

export default function HomeContent({ initialReports }: HomeContentProps) {
  const { searchQuery } = useSearch();
  const { isAdmin, loading: adminLoading } = useAdmin();
  
  const [filteredReports, setFilteredReports] = useState<Report[]>(initialReports);
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<'purchased' | 'available' | 'all'>('all');

  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const handleAdminToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsAdminMode(event.target.checked);
  };

  const handleRefresh = async () => {
      // Refresh the page to get new data
      window.location.reload(); 
  };

  const handleEditReport = (report: Report) => {
      setSelectedReport(report);
      setEditOpen(true);
  };

  const handleDeleteReport = async (reportId: string) => {
      if (confirm('¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.')) {
          try {
             const report = filteredReports.find(r => r.id === reportId);
             // Cast to any to access file_path which should be present from backend but might be missing in type definition
             if (report && (report as any).file_path) {
                 await storageApi.deleteFile((report as any).file_path);
                 // Optimistic update or refresh
                 handleRefresh();
             } else {
                 alert('No se pudo encontrar la ruta del archivo para eliminar.');
             }
          } catch (error: any) {
              alert('Error al eliminar: ' + error.message);
          }
      }
  };

  useEffect(() => {
    let result = initialReports;

    if (searchQuery) {
      result = result.filter((report) =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (yearFilter) {
      result = result.filter((report) => new Date(report.month).getFullYear() === yearFilter);
    }

    if (statusFilter !== 'all') {
      // Implement status logic if needed
      // Example: result = result.filter((report) => statusFilter === 'purchased' ? report.purchased : !report.purchased);
    }

    setFilteredReports(result);
  }, [searchQuery, yearFilter, statusFilter, initialReports]);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Admin Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, height: 40 }}>
          {adminLoading ? (
              <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 1 }} />
          ) : isAdmin ? (
              <FormControlLabel
                  control={
                      <Switch
                          checked={isAdminMode}
                          onChange={handleAdminToggle}
                          color="warning"
                      />
                  }
                  label={
                      <Typography variant="subtitle2" fontWeight="bold" color={isAdminMode ? "warning.main" : "text.secondary"}>
                          Modo Administrador
                      </Typography>
                  }
              />
          ) : null}
      </Box>

      {/* Hero Section */}
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
          Catálogo de Reportes
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Accede a información estratégica mensual para la toma de decisiones.
          {filteredReports.length} reportes disponibles.
        </Typography>
      </Box>

      {/* Filters */}
      <Filters
        year={yearFilter}
        setYear={setYearFilter}
        status={statusFilter}
        setStatus={setStatusFilter}
      />

      {/* Reports Grid */}
      {filteredReports.length > 0 ? (
        <Grid container spacing={4}>
          {filteredReports.map((report) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={report.id}>
              <ReportCard 
                  report={report} 
                  adminView={isAdminMode}
                  onEdit={handleEditReport}
                  onDelete={handleDeleteReport}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            No se encontraron reportes que coincidan con tu búsqueda.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Intenta ajustar los filtros o buscar con otros términos.
          </Typography>
        </Box>
      )}

      {/* Pagination (Mock) */}
      {filteredReports.length > 0 && (
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
          <Pagination count={Math.ceil(filteredReports.length / 6) || 1} color="primary" size="large" />
        </Box>
      )}

      {/* Admin FAB */}
      {isAdminMode && (
          <Fab 
              color="warning" 
              aria-label="add" 
              sx={{ position: 'fixed', bottom: 32, right: 32 }}
              onClick={() => setUploadOpen(true)}
          >
              <AddIcon />
          </Fab>
      )}

      {/* Dialogs */}
      <ReportUploadDialog 
          open={uploadOpen} 
          onClose={() => setUploadOpen(false)}
          onUploadSuccess={handleRefresh}
      />
      
      <ReportEditDialog
          open={editOpen}
          onClose={() => {
              setEditOpen(false);
              setSelectedReport(null);
          }}
          report={selectedReport}
          onUpdateSuccess={handleRefresh}
      />
    </Container>
  );
}
