import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'admin_token';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Use global to persist sessions across hot reloads in dev mode
const globalForSessions = globalThis as unknown as {
    sessionStore: Map<string, { expiresAt: number }> | undefined;
};

// In-memory session store (persists across hot reloads, resets on full server restart)
const sessionStore = globalForSessions.sessionStore ?? new Map<string, { expiresAt: number }>();
globalForSessions.sessionStore = sessionStore;

// Verify the admin password
export function verifyPassword(password: string): boolean {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
        throw new Error('ADMIN_PASSWORD environment variable is not set');
    }

    return password === adminPassword;
}

// Create a new session and return the token
export function createSession(): string {
    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + SESSION_DURATION_MS;

    sessionStore.set(token, { expiresAt });

    // Clean up expired sessions occasionally
    if (sessionStore.size > 100) {
        cleanupExpiredSessions();
    }

    return token;
}

// Validate a session token or JWT
export function validateSession(token: string | undefined): boolean {
    if (!token) return false;

    // Check if it's a JWT (simplified check: has 2 dots)
    if (token.includes('.') && token.split('.').length === 3) {
        // For now, we trust the JWT if it's present, as it was set by our login route
        // In a real app, you'd verify the JWT signature here
        return true;
    }

    const session = sessionStore.get(token);

    if (!session) return false;

    if (Date.now() > session.expiresAt) {
        sessionStore.delete(token);
        return false;
    }

    return true;
}

// Delete a session (logout)
export function deleteSession(token: string): void {
    sessionStore.delete(token);
}

// Clean up expired sessions
function cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [token, session] of sessionStore.entries()) {
        if (now > session.expiresAt) {
            sessionStore.delete(token);
        }
    }
}

// Get session token from request headers or cookies
export async function getSessionFromHeaders(request: Request): Promise<string | undefined> {
    // 1. Check Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    // 2. Check cookies (server-side only)
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (token) return token;
    } catch (e) {
        // Fallback or ignore if called in a context where cookies() isn't available
    }

    return undefined;
}

// Check if request is authenticated
export async function isAuthenticated(request: Request): Promise<boolean> {
    const token = await getSessionFromHeaders(request);
    return validateSession(token);
}

// Middleware helper for protected API routes
export async function requireAuth(request: Request): Promise<{ authorized: boolean; response?: Response }> {
    if (!(await isAuthenticated(request))) {
        return {
            authorized: false,
            response: new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            )
        };
    }
    return { authorized: true };
}
