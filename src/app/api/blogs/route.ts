import { NextRequest, NextResponse } from 'next/server';
import { getDb, initBlogsTable, Blog } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET /api/blogs - List all blogs (public)
export async function GET(request: NextRequest) {
    try {
        const sql = getDb();

        // Ensure table exists (auto-create on first request)
        await initBlogsTable();

        // Check for admin param to show all blogs (including drafts)
        const { searchParams } = new URL(request.url);
        const showAll = searchParams.get('all') === 'true';

        let blogs;
        if (showAll) {
            // For admin - check auth
            const auth = requireAuth(request);
            if (!auth.authorized) {
                // If not authenticated, only show published
                blogs = await sql`
          SELECT * FROM blogs 
          WHERE published = true 
          ORDER BY created_at DESC
        `;
            } else {
                blogs = await sql`
          SELECT * FROM blogs 
          ORDER BY created_at DESC
        `;
            }
        } else {
            // Public - only published blogs
            blogs = await sql`
        SELECT * FROM blogs 
        WHERE published = true 
        ORDER BY created_at DESC
      `;
        }

        return NextResponse.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blogs' },
            { status: 500 }
        );
    }
}

// POST /api/blogs - Create a new blog (protected)
export async function POST(request: NextRequest) {
    const auth = requireAuth(request);
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const sql = getDb();

        // Ensure table exists
        await initBlogsTable();

        const { title, slug, excerpt, content, cover_image, published } = await request.json();

        if (!title || !slug || !content) {
            return NextResponse.json(
                { error: 'Title, slug, and content are required' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existing = await sql`SELECT id FROM blogs WHERE slug = ${slug}`;
        if (existing.length > 0) {
            return NextResponse.json(
                { error: 'A blog with this slug already exists' },
                { status: 409 }
            );
        }

        const result = await sql`
      INSERT INTO blogs (title, slug, excerpt, content, cover_image, published)
      VALUES (${title}, ${slug}, ${excerpt || null}, ${content}, ${cover_image || null}, ${published || false})
      RETURNING *
    `;

        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error('Error creating blog:', error);
        return NextResponse.json(
            { error: 'Failed to create blog' },
            { status: 500 }
        );
    }
}
