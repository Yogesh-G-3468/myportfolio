import { NextRequest, NextResponse } from 'next/server';
import { getDb, initBlogsTable } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// POST /api/init - Initialize the database (protected)
export async function POST(request: NextRequest) {
    const auth = requireAuth(request);
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        await initBlogsTable();

        return NextResponse.json({ message: 'Database initialized successfully' });
    } catch (error) {
        console.error('Error initializing database:', error);
        return NextResponse.json(
            { error: 'Failed to initialize database' },
            { status: 500 }
        );
    }
}
