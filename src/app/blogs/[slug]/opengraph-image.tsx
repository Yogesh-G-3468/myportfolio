import { ImageResponse } from 'next/og';
import { getBlogBySlug } from '@/lib/db';

export const runtime = 'nodejs';
export const alt = 'Blog Post Preview';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);

    const title = blog?.title || 'Blog Post';
    const excerpt = blog?.excerpt || 'Thoughts on software engineering, generative AI, and distributed systems.';

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '64px 80px',
                    backgroundColor: '#090a0f',
                    backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 40%)',
                    color: '#ffffff',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
            >
                {/* Header branding */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '26px',
                                fontWeight: 'bold',
                                color: '#ffffff',
                                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
                            }}
                        >
                            Y
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '-0.01em' }}>
                                Yogeshwaran G
                            </span>
                            <span style={{ fontSize: '15px', color: '#9ca3af' }}>
                                Software Engineer • @Yogeshwaran__g
                            </span>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 20px',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '15px',
                            color: '#c7d2fe',
                            fontWeight: 600,
                        }}
                    >
                        <span>Blog Article</span>
                    </div>
                </div>

                {/* Main Content (Title + Excerpt) */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        margin: 'auto 0',
                    }}
                >
                    <div
                        style={{
                            fontSize: title.length > 60 ? '48px' : '58px',
                            fontWeight: 800,
                            lineHeight: 1.15,
                            letterSpacing: '-0.03em',
                            color: '#ffffff',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {title}
                    </div>

                    {excerpt && (
                        <div
                            style={{
                                fontSize: '22px',
                                lineHeight: 1.45,
                                color: '#9ca3af',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {excerpt}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '28px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        width: '100%',
                    }}
                >
                    <span style={{ fontSize: '20px', color: '#818cf8', fontWeight: 600 }}>
                        yogeshwaran.space
                    </span>
                    <span style={{ fontSize: '16px', color: '#6b7280' }}>
                        Read full article →
                    </span>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
