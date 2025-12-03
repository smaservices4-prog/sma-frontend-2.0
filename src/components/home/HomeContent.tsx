'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Pagination } from '@mui/material';
import ReportCard from '@/components/reports/ReportCard';
import Filters from '@/components/reports/Filters';
import { useSearch } from '@/context/SearchContext';
import { Report } from '@/types';

interface HomeContentProps {
  initialReports: Report[];
}

export default function HomeContent({ initialReports }: HomeContentProps) {
  const { searchQuery } = useSearch();
  const [filteredReports, setFilteredReports] = useState<Report[]>(initialReports);
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<'purchased' | 'available' | 'all'>('all');

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
      // Implement status logic if needed, for now mock
      // Example: result = result.filter((report) => statusFilter === 'purchased' ? report.purchased : !report.purchased);
    }

    setFilteredReports(result);
  }, [searchQuery, yearFilter, statusFilter, initialReports]);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
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
              <ReportCard report={report} />
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
    </Container>
  );
}



