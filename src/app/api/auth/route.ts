import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();

        if (!password) {
            return NextResponse.json(
                { error: 'Password is required' },
                { status: 400 }
            );
        }

        if (!verifyPassword(password)) {
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            );
        }

        const token = createSession();

        return NextResponse.json({ token });
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
