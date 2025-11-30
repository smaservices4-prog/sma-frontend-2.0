import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    // Guard the entire process
    try {
        if (code) {
            const cookieStore = await cookies();
            
            // Cast to any to bypass the strict type check if needed, 
            // but fundamentally we are passing an object that has .get(), .set(), etc.
            // The issue might be that createRouteHandlerClient expects the *function* passed to `cookies` 
            // to return the store, and it might be calling it.
            const supabase = createRouteHandlerClient({ 
                cookies: () => cookieStore as any
            });
            
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
                console.error('Auth exchange error:', error);
                return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`);
            }
        }
    } catch (error: any) {
        console.error('Critical auth callback error:', error);
        const errorMessage = error?.message || 'Unknown critical error';
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Critical: ' + errorMessage)}`);
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(requestUrl.origin);
}
