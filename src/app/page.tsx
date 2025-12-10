import { createServerClient } from '@/lib/supabase-server';
import { reportsApi } from '@/api/reports';
import HomeContent from '@/components/home/HomeContent';

export const revalidate = 0; // Optional: for dynamic data, or usage of cookies implies dynamic.

export default async function Home() {
  const supabase = await createServerClient();
  const {
    reports,
    page,
    per_page,
    total_reports,
    total_pages,
  } = await reportsApi.getAll({ supabaseClient: supabase, page: 1, perPage: 9 });

  return (
    <HomeContent
      initialReports={reports}
      initialPagination={{
        page,
        limit: per_page,
        total: total_reports,
        total_pages,
      }}
    />
  );
}
