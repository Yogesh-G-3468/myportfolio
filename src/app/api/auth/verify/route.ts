import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const auth = requireAuth(request);

    if (!auth.authorized) {
        return auth.response;
    }

    return NextResponse.json({ authorized: true, user: 'admin' });
}
