import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cache } from 'react';

// This client is for Server Components
export const createServerClient = cache(async () => {
    const cookieStore = await cookies();
    // Cast to any because of type mismatch between Next.js 15+ cookies and auth-helpers
    return createServerComponentClient({ cookies: () => cookieStore as any });
});
