import { createServerClient } from '@/lib/supabase-server';
import { reportsApi } from '@/api/reports';
import HomeContent from '@/components/home/HomeContent';

export const revalidate = 0; // Optional: for dynamic data, or usage of cookies implies dynamic.

export default async function Home() {
  const supabase = await createServerClient();
  const allReports = await reportsApi.getAll(supabase);

  return <HomeContent initialReports={allReports} />;
}
