import { neon } from '@neondatabase/serverless';

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
    created_at: Date;
    updated_at: Date;
}
