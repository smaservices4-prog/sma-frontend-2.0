import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        
        try {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
                console.error('Auth exchange error:', error);
                return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`);
            }
        } catch (error) {
            console.error('Auth callback exception:', error);
            return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_exception`);
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(requestUrl.origin);
}
