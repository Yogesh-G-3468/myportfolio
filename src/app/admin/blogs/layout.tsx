'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('admin_token');

            if (!token) {
                router.push('/admin');
                return;
            }

            try {
                const res = await fetch('/api/auth/verify', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    setAuthorized(true);
                } else {
                    localStorage.removeItem('admin_token');
                    router.push('/admin');
                }
            } catch (error) {
                console.error('Auth verification failed', error);
                router.push('/admin');
            }
        };

        verifyAuth();
    }, [router]);

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Verifying access...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
