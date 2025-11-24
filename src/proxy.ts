import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Protect /admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // Check for admin role
        const { data: { user } } = await supabase.auth.getUser();
        const isAdmin = user?.app_metadata?.role === 'admin';

        if (!isAdmin) {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    return res;
}

export const config = {
    matcher: ['/admin/:path*'],
};
