import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/blogs/[id] - Get a single blog (public)
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const sql = getDb();

        // Check if id is a number (by ID) or string (by slug)
        const isNumeric = /^\d+$/.test(id);

        let blog;
        if (isNumeric) {
            blog = await sql`SELECT * FROM blogs WHERE id = ${parseInt(id)}`;
        } else {
            blog = await sql`SELECT * FROM blogs WHERE slug = ${id}`;
        }

        if (blog.length === 0) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(blog[0]);
    } catch (error) {
        console.error('Error fetching blog:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog' },
            { status: 500 }
        );
    }
}

// PUT /api/blogs/[id] - Update a blog (protected)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const auth = requireAuth(request);
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const { id } = await params;
        const sql = getDb();
        const { title, slug, excerpt, content, cover_image, published } = await request.json();

        // Check if blog exists
        const existing = await sql`SELECT id FROM blogs WHERE id = ${parseInt(id)}`;
        if (existing.length === 0) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        // Check if new slug already exists (and belongs to different blog)
        if (slug) {
            const slugExists = await sql`
        SELECT id FROM blogs WHERE slug = ${slug} AND id != ${parseInt(id)}
      `;
            if (slugExists.length > 0) {
                return NextResponse.json(
                    { error: 'A blog with this slug already exists' },
                    { status: 409 }
                );
            }
        }

        const result = await sql`
      UPDATE blogs 
      SET 
        title = COALESCE(${title}, title),
        slug = COALESCE(${slug}, slug),
        excerpt = COALESCE(${excerpt}, excerpt),
        content = COALESCE(${content}, content),
        cover_image = COALESCE(${cover_image}, cover_image),
        published = COALESCE(${published}, published),
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error updating blog:', error);
        return NextResponse.json(
            { error: 'Failed to update blog' },
            { status: 500 }
        );
    }
}

// DELETE /api/blogs/[id] - Delete a blog (protected)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const auth = requireAuth(request);
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const { id } = await params;
        const sql = getDb();

        const result = await sql`
      DELETE FROM blogs WHERE id = ${parseInt(id)} RETURNING id
    `;

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return NextResponse.json(
            { error: 'Failed to delete blog' },
            { status: 500 }
        );
    }
}
