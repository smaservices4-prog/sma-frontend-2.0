'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Pagination, FormControlLabel, Switch, Fab, Skeleton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReportCard from '@/components/reports/ReportCard';
import { FiltersModal, FiltersSummary } from '@/components/reports/Filters';
import { useSearch } from '@/context/SearchContext';
import { PaginationInfo, Report } from '@/types';
import { useAdmin } from '@/hooks/useAdmin';
import ReportUploadDialog from '@/components/admin/ReportUploadDialog';
import ReportEditDialog from '@/components/admin/ReportEditDialog';
import ReportDeleteDialog from '@/components/admin/ReportDeleteDialog';
import { storageApi } from '@/api/storage';
import { useFilters } from '@/context/FilterContext';
import { reportsApi } from '@/api/reports';
import { useAuthErrorHandler } from '@/hooks/useAuthErrorHandler';

function getReportYear(monthIso: string): number | null {
  const year = monthIso.slice(0, 4);
  const parsed = Number(year);
  return Number.isNaN(parsed) ? null : parsed;
}

const PAGE_SIZE = 9;

interface HomeContentProps {
  initialReports: Report[];
  initialPagination?: PaginationInfo;
}

export default function HomeContent({ initialReports, initialPagination }: HomeContentProps) {
  const { searchQuery } = useSearch();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { year, status, setAvailableYears, setAvailableStatuses } = useFilters();
  const { checkError } = useAuthErrorHandler();

  const [reports, setReports] = useState<Report[]>(initialReports);
  const [pagination, setPagination] = useState<PaginationInfo>(() => ({
    page: initialPagination?.page ?? 1,
    limit: initialPagination?.limit ?? PAGE_SIZE,
    total: initialPagination?.total ?? initialReports.length,
    total_pages: initialPagination?.total_pages ?? Math.max(1, Math.ceil(initialReports.length / PAGE_SIZE)),
  }));
  const [loadingPage, setLoadingPage] = useState(false);
  const [filteredReports, setFilteredReports] = useState<Report[]>(initialReports);

  useEffect(() => {
    const uniqueYears = Array.from(
      new Set(
        reports
          .map((report) => getReportYear(report.month))
          .filter((value): value is number => value !== null)
      )
    ).sort((a, b) => b - a);

    setAvailableYears(uniqueYears);
  }, [reports, setAvailableYears]);

  useEffect(() => {
    const hasPurchased = reports.some((report) => report.purchased);
    const hasAvailable = reports.some((report) => !report.purchased);
    const statuses = [
      ...(hasAvailable ? ['available' as const] : []),
      ...(hasPurchased ? ['purchased' as const] : []),
    ];
    setAvailableStatuses(statuses);
  }, [reports, setAvailableStatuses]);

  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
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

  const handleDeleteReport = (reportId: string) => {
      const report = filteredReports.find(r => r.id === reportId);
      if (report) {
          setSelectedReport(report);
          setDeleteOpen(true);
      }
  };

  useEffect(() => {
    let result = reports;

    if (searchQuery) {
      result = result.filter((report) =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (year) {
      result = result.filter((report) => getReportYear(report.month) === year);
    }

    if (status !== 'all') {
      result = result.filter((report) =>
        status === 'purchased' ? report.purchased : !report.purchased
      );
    }

    setFilteredReports(result);
  }, [searchQuery, year, status, reports]);

  const handlePageChange = async (_event: React.ChangeEvent<unknown>, nextPage: number) => {
    setLoadingPage(true);
    try {
      const response = await reportsApi.getAll({ page: nextPage, perPage: pagination.limit });
      setReports(response.reports);
      setPagination({
        page: response.page,
        limit: response.per_page ?? pagination.limit,
        total: response.total_reports,
        total_pages: response.total_pages,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to fetch reports page', error);
    } finally {
      setLoadingPage(false);
    }
  };

  const renderAdminControls = () => {
    if (adminLoading) {
      return (
        <Box sx={{ minHeight: 40 }}>
          <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 1 }} />
        </Box>
      );
    }

    if (!isAdmin) {
      return null;
    }

    return (
      <Box sx={{ minHeight: 40 }}>
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
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 3.5 } }}>
      {/* Hero + Admin toggle */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: { xs: 2.5, md: 3.25 },
        }}
      >
        <Box sx={{ textAlign: { xs: 'left', md: 'left' } }}>
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, mb: 1 }}
          >
            Catálogo de Reportes
          </Typography>
        </Box>

        {renderAdminControls()}
      </Box>

      {/* Reports Grid */}
      {filteredReports.length > 0 ? (
        <Grid container spacing={2.5}>
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
        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pagination.total_pages || 1}
            page={pagination.page}
            color="primary"
            size="large"
            onChange={handlePageChange}
            disabled={loadingPage}
          />
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

      <ReportDeleteDialog
          open={deleteOpen}
          onClose={() => {
              setDeleteOpen(false);
              setSelectedReport(null);
          }}
          report={selectedReport}
          onDeleteSuccess={handleRefresh}
      />

      {/* Mobile filters sheet */}
      <FiltersModal />
    </Container>
  );
}
