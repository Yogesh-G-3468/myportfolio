'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface Blog {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image: string | null;
    created_at: string;
}

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBlogs() {
            try {
                const res = await fetch('/api/blogs');
                if (res.ok) {
                    const data = await res.json();
                    setBlogs(data);
                }
            } catch (error) {
                console.error('Error fetching blogs:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchBlogs();
    }, []);

    return (
        <div className="min-h-screen gradient-mesh pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-foreground-secondary hover:text-accent transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-foreground via-accent to-accent-secondary bg-clip-text text-transparent">
                                Blog & Insights
                            </span>
                        </h1>
                        <p className="text-xl text-foreground-secondary max-w-2xl">
                            Thoughts on software engineering, generative AI, and building scalable systems.
                        </p>
                    </motion.div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-96 rounded-2xl bg-background-elevated border border-border animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && blogs.length === 0 && (
                    <div className="text-center py-20 bg-background-elevated/50 border border-border rounded-3xl backdrop-blur-sm">
                        <p className="text-foreground-secondary text-lg">No blog posts found yet.</p>
                    </div>
                )}

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((blog, index) => (
                        <motion.div
                            key={blog.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Link href={`/blogs/${blog.slug}`} className="group block h-full">
                                <article className="h-full flex flex-col bg-background-elevated border border-border rounded-2xl overflow-hidden hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1">
                                    {/* Image */}
                                    <div className="aspect-video overflow-hidden bg-muted relative">
                                        {blog.cover_image ? (
                                            <img
                                                src={blog.cover_image}
                                                alt={blog.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-accent/5 text-accent/20">
                                                <span className="text-4xl font-bold">YG</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-background-elevated to-transparent opacity-60" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6 flex flex-col">
                                        <div className="flex items-center gap-3 text-xs font-medium text-accent mb-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(blog.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-foreground-secondary/30" />
                                            <span className="flex items-center gap-1 text-foreground-secondary">
                                                <User className="w-3.5 h-3.5" />
                                                Yogeshwaran G
                                            </span>
                                        </div>

                                        <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors line-clamp-2">
                                            {blog.title}
                                        </h2>

                                        {blog.excerpt && (
                                            <p className="text-foreground-secondary text-sm line-clamp-3 mb-4 flex-1">
                                                {blog.excerpt}
                                            </p>
                                        )}

                                        <div className="flex items-center text-sm font-medium text-accent group-hover:gap-2 transition-all">
                                            Read Article <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
