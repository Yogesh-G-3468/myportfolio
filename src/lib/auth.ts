import { randomBytes } from 'crypto';

const SESSION_COOKIE_NAME = 'admin_session';
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

// Validate a session token
export function validateSession(token: string | undefined): boolean {
    if (!token) return false;

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

// Get session token from request headers
export function getSessionFromHeaders(request: Request): string | undefined {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    return undefined;
}

// Check if request is authenticated
export function isAuthenticated(request: Request): boolean {
    const token = getSessionFromHeaders(request);
    return validateSession(token);
}

// Middleware helper for protected API routes
export function requireAuth(request: Request): { authorized: boolean; response?: Response } {
    if (!isAuthenticated(request)) {
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
