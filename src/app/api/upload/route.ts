import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth';

// POST /api/upload - Upload image to Cloudinary (protected)
export async function POST(request: NextRequest) {
    const auth = requireAuth(request);
    if (!auth.authorized) {
        console.log('Upload failed: Unauthorized');
        return auth.response;
    }

    try {
        console.log('Processing upload request...');
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            console.log('Upload failed: No file provided');
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        console.log('File received:', file.name, file.type, file.size, 'bytes');

        // Validate file type
        if (!file.type.startsWith('image/')) {
            console.log('Upload failed: Invalid file type', file.type);
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        console.log('Buffer created, uploading to Cloudinary...');

        // Upload to Cloudinary
        const result = await uploadImage(buffer, 'blog');
        console.log('Upload successful:', result.url);

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to upload image' },
            { status: 500 }
        );
    }
}
