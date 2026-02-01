import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

// Validate Cloudinary config
function validateConfig() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('Cloudinary config check:', {
        cloudName: cloudName ? `${cloudName.substring(0, 3)}...` : 'MISSING',
        apiKey: apiKey ? `${apiKey.substring(0, 5)}...` : 'MISSING',
        apiSecret: apiSecret ? `${apiSecret.substring(0, 5)}...` : 'MISSING',
    });

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Missing Cloudinary credentials. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
    }

    return { cloudName, apiKey, apiSecret };
}

export interface UploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
}

// Upload image to Cloudinary using base64 with timeout
export async function uploadImage(
    file: Buffer,
    folder: string = 'blog'
): Promise<UploadResult> {
    // Validate config first
    const config = validateConfig();

    // Configure Cloudinary (do this every time to ensure env vars are picked up)
    cloudinary.config({
        cloud_name: config.cloudName,
        api_key: config.apiKey,
        api_secret: config.apiSecret,
    });

    // Convert buffer to base64 data URI
    const base64 = file.toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;

    console.log('Uploading to Cloudinary...', {
        folder,
        bufferSize: file.length,
        base64Length: base64.length,
    });

    // Create upload promise with timeout
    const uploadPromise = new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload(
            dataUri,
            {
                folder,
                resource_type: 'image',
            },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error) {
                    console.error('Cloudinary callback error:', error);
                    reject(new Error(error.message || 'Cloudinary upload failed'));
                } else if (result) {
                    console.log('Cloudinary upload success:', result.secure_url);
                    resolve(result);
                } else {
                    reject(new Error('No result from Cloudinary'));
                }
            }
        );
    });

    // Add 60 second timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(new Error('Cloudinary upload timed out after 60 seconds. Check your credentials.'));
        }, 60000);
    });

    try {
        const result = await Promise.race([uploadPromise, timeoutPromise]);

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
        };
    } catch (error: any) {
        console.error('Cloudinary upload failed:', error.message);
        throw error;
    }
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<void> {
    const config = validateConfig();
    cloudinary.config({
        cloud_name: config.cloudName,
        api_key: config.apiKey,
        api_secret: config.apiSecret,
    });
    await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
