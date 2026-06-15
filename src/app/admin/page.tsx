'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const router = useRouter();

    // Utility to get cookie
    const getCookie = (name: string) => {
        if (typeof document === 'undefined') return undefined;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return undefined;
    };

    useEffect(() => {
        // Check if already logged in via cookie or localStorage
        const token = getCookie('admin_token') || localStorage.getItem('admin_token');
        if (token) {
            router.push('/admin/blogs');
        } else {
            setCheckingAuth(false);
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Authentication failed');
                setLoading(false);
                return;
            }

            // The token is now also set in cookies by the API route
            // For extra layer, we'll store it in localStorage as well for now
            localStorage.setItem('admin_token', data.token);
            router.push('/admin/blogs');
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 relative z-[9999]">
            <div className="w-full max-w-md relative z-[9999]">
                <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access</h1>
                        <p className="text-muted-foreground text-sm">
                            Enter your credentials to continue
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="Enter admin username"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="Enter admin password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Authenticating...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
