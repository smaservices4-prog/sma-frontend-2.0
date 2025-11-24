import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// This client is specifically for Client Components
export const supabase = createClientComponentClient();
