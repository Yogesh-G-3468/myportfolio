'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Save } from 'lucide-react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditBlogPage({ params }: PageProps) {
    const { id } = use(params);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [published, setPublished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const getToken = () => localStorage.getItem('admin_token');

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/admin');
            return;
        }
        fetchBlog();
    }, [id, router]);

    const fetchBlog = async () => {
        try {
            const res = await fetch(`/api/blogs/${id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            if (res.status === 401) {
                localStorage.removeItem('admin_token');
                router.push('/admin');
                return;
            }

            if (res.status === 404) {
                router.push('/admin/blogs');
                return;
            }

            const data = await res.json();
            setTitle(data.title);
            setSlug(data.slug);
            setExcerpt(data.excerpt || '');
            setContent(data.content);
            setCoverImage(data.cover_image || '');
            setPublished(data.published);
        } catch (err) {
            setError('Failed to fetch blog');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Upload failed');
            }

            const data = await res.json();
            setCoverImage(data.url);
        } catch (err) {
            setError('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const res = await fetch(`/api/blogs/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    title,
                    slug,
                    excerpt,
                    content,
                    cover_image: coverImage,
                    published,
                }),
            });

            if (res.status === 401) {
                localStorage.removeItem('admin_token');
                router.push('/admin');
                return;
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update blog');
            }

            router.push('/admin/blogs');
        } catch (err: any) {
            setError(err.message || 'Failed to update blog');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/admin/blogs"
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">Edit Blog</h1>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Cover Image */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <label className="block text-sm font-medium text-foreground mb-4">
                            Cover Image
                        </label>
                        {coverImage ? (
                            <div className="relative">
                                <img
                                    src={coverImage}
                                    alt="Cover"
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => setCoverImage('')}
                                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                            >
                                <Upload className="w-8 h-8" />
                                <span>{uploading ? 'Uploading...' : 'Click to upload cover image'}</span>
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Title & Slug */}
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                        <div>
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="Enter blog title"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="slug"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                Slug
                            </label>
                            <div className="flex items-center">
                                <span className="px-4 py-3 bg-muted text-muted-foreground border border-r-0 border-border rounded-l-lg">
                                    /blogs/
                                </span>
                                <input
                                    type="text"
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-background border border-border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="blog-url-slug"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="excerpt"
                                className="block text-sm font-medium text-foreground mb-2"
                            >
                                Excerpt
                            </label>
                            <textarea
                                id="excerpt"
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                placeholder="Brief description for blog cards"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <label
                            htmlFor="content"
                            className="block text-sm font-medium text-foreground mb-2"
                        >
                            Content (Markdown)
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={20}
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none font-mono text-sm"
                            placeholder="Write your blog content in Markdown..."
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={published}
                                onChange={(e) => setPublished(e.target.checked)}
                                className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
                            />
                            <span className="text-foreground">Published</span>
                        </label>

                        <div className="flex gap-3">
                            <Link
                                href="/admin/blogs"
                                className="px-6 py-3 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Update Blog'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
