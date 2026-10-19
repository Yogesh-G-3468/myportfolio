import { neon } from '@neondatabase/serverless';
import { cache } from 'react';

// Create a database connection using Neon's serverless driver
export function getDb() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    return neon(databaseUrl);
}

// Initialize the blogs table if it doesn't exist
export async function initBlogsTable() {
    const sql = getDb();

    await sql`
    CREATE TABLE IF NOT EXISTS blogs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      cover_image VARCHAR(500),
      published BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

// Blog type definition
export interface Blog {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_image: string | null;
    published: boolean;
    created_at: Date | string;
    updated_at: Date | string;
}

// Fetch a single published blog by slug (cached per request)
export const getBlogBySlug = cache(async (slug: string): Promise<Blog | null> => {
    try {
        const sql = getDb();
        const blogs = await sql`
            SELECT id, title, slug, excerpt, content, cover_image, published, created_at, updated_at
            FROM blogs
            WHERE slug = ${slug}
            LIMIT 1
        `;

        if (!blogs || blogs.length === 0) {
            return null;
        }

        const blog = blogs[0] as unknown as Blog;
        if (!blog.published) {
            return null;
        }

        return blog;
    } catch (error) {
        console.error('Error fetching blog by slug:', error);
        return null;
    }
});

