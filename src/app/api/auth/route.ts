import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { verifyPassword, createSession } from '../../../lib/auth';

const BACKEND_URL = process.env.BACKEND_URL || 'https://stratos.yogeshwaran.space';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Try local admin password check first (so local login works when backend tunnel is down)
        try {
            if (verifyPassword(password)) {
                const sessionToken = createSession();
                const nextResponse = NextResponse.json({ 
                    success: true, 
                    token: sessionToken 
                });

                nextResponse.cookies.set('admin_token', sessionToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                });

                return nextResponse;
            }
        } catch (localAuthErr: any) {
            console.warn('Local admin auth check skipped/failed:', localAuthErr.message);
        }

        // Fallback to backend authentication
        try {
            const response = await axios.post(`${BACKEND_URL}/auth/login`, {
                username,
                password
            });

            // The backend returns access_token, token_type, expires_at
            const { access_token } = response.data;

            const nextResponse = NextResponse.json({ 
                success: true, 
                token: access_token 
                
            });

            // Store in cookie - using Next.js response cookies
            nextResponse.cookies.set('admin_token', access_token, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days default
            });

            return nextResponse;
        } catch (backendError: any) {
            console.error('Backend auth error:', backendError.response?.data || backendError.message);
            return NextResponse.json(
                { error: backendError.response?.data?.detail || 'Authentication failed' },
                { status: backendError.response?.status || 401 }
            );
        }
    } catch (error) {
        console.error('Auth handler error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
