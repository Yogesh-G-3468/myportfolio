'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff, LogOut } from 'lucide-react';

interface Blog {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    published: boolean;
    created_at: string;
}

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    const getToken = () => localStorage.getItem('admin_token');

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/admin');
            return;
        }
        fetchBlogs();
    }, [router]);

    const fetchBlogs = async () => {
        try {
            const res = await fetch('/api/blogs?all=true', {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            if (res.status === 401) {
                localStorage.removeItem('admin_token');
                router.push('/admin');
                return;
            }

            const data = await res.json();
            setBlogs(data);
        } catch (err) {
            setError('Failed to fetch blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this blog?')) return;

        try {
            const res = await fetch(`/api/blogs/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            if (res.ok) {
                setBlogs(blogs.filter((b) => b.id !== id));
            } else {
                alert('Failed to delete blog');
            }
        } catch (err) {
            alert('Failed to delete blog');
        }
    };

    const togglePublish = async (blog: Blog) => {
        try {
            const res = await fetch(`/api/blogs/${blog.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ published: !blog.published }),
            });

            if (res.ok) {
                setBlogs(
                    blogs.map((b) =>
                        b.id === blog.id ? { ...b, published: !b.published } : b
                    )
                );
            }
        } catch (err) {
            alert('Failed to update blog');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin');
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
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Blog Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Create, edit, and manage your blog posts
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/admin/blogs/new"
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            <Plus className="w-4 h-4" />
                            New Blog
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Blog List */}
                {blogs.length === 0 ? (
                    <div className="text-center py-16 bg-card border border-border rounded-2xl">
                        <p className="text-muted-foreground mb-4">No blogs yet</p>
                        <Link
                            href="/admin/blogs/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            <Plus className="w-4 h-4" />
                            Create your first blog
                        </Link>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                                        Title
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                                        Date
                                    </th>
                                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {blogs.map((blog) => (
                                    <tr key={blog.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-foreground">{blog.title}</p>
                                                <p className="text-sm text-muted-foreground">/blogs/{blog.slug}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${blog.published
                                                        ? 'bg-green-500/10 text-green-400'
                                                        : 'bg-yellow-500/10 text-yellow-400'
                                                    }`}
                                            >
                                                {blog.published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(blog.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => togglePublish(blog)}
                                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                                    title={blog.published ? 'Unpublish' : 'Publish'}
                                                >
                                                    {blog.published ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <Link
                                                    href={`/admin/blogs/${blog.id}/edit`}
                                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(blog.id)}
                                                    className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
