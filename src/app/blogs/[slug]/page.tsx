import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import { marked } from 'marked';

interface Blog {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_image: string | null;
    published: boolean;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getBlog(slug: string): Promise<Blog | null> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    try {
        const res = await fetch(`${baseUrl}/api/blogs/${slug}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            return null;
        }

        const blog = await res.json();

        // Don't show unpublished blogs to public
        if (!blog.published) {
            return null;
        }

        return blog;
    } catch (error) {
        console.error('Error fetching blog:', error);
        return null;
    }
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const blog = await getBlog(slug);

    if (!blog) {
        notFound();
    }

    // Parse markdown content
    const htmlContent = await marked(blog.content);

    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = blog.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    return (
        <div className="min-h-screen gradient-mesh pt-24 pb-16 px-4">
            <article className="max-w-4xl mx-auto">
                {/* Navigation */}
                <Link
                    href="/blogs"
                    className="inline-flex items-center gap-2 text-foreground-secondary hover:text-accent transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Blogs
                </Link>

                <div className="bg-background-elevated/80 backdrop-blur-md border border-border rounded-3xl overflow-hidden shadow-xl">
                    {/* Header Image */}
                    {blog.cover_image && (
                        <div className="w-full h-64 md:h-96 relative">
                            <img
                                src={blog.cover_image}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background-elevated to-transparent opacity-80" />
                        </div>
                    )}

                    <div className="px-6 md:px-12 py-10 -mt-20 relative z-10">
                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-secondary mb-6 bg-background/50 backdrop-blur-sm inline-block px-4 py-2 rounded-full border border-border/50">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-accent" />
                                {new Date(blog.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="flex items-center gap-1.5">
                                <User className="w-4 h-4 text-accent" />
                                Yogeshwaran G
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-accent" />
                                {readTime} min read
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
                            {blog.title}
                        </h1>

                        {/* Excerpt */}
                        {blog.excerpt && (
                            <p className="text-xl text-foreground-secondary mb-10 border-l-4 border-accent pl-6 italic">
                                {blog.excerpt}
                            </p>
                        )}

                        {/* Content */}
                        <div className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:text-foreground prose-headings:font-bold
              prose-h1:text-4xl prose-h1:mb-6
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-accent
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-foreground-secondary prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-code:text-accent prose-code:bg-accent/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-background/50 prose-pre:border prose-pre:border-border prose-pre:rounded-xl
              prose-blockquote:border-l-accent prose-blockquote:bg-accent/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
              prose-li:text-foreground-secondary prose-li:marker:text-accent
              prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-border
              prose-hr:border-border
            "
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="mt-12 text-center">
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-background-elevated border border-border text-foreground hover:border-accent hover:text-accent transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Blog List
                    </Link>
                </div>
            </article>
        </div>
    );
}
