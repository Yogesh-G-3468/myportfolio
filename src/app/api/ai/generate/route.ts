import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, getSessionFromHeaders } from '@/lib/auth';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'https://stratos.yogeshwaran.space';

async function getStratosJwtToken(request: NextRequest): Promise<string> {
    // 1. Try to extract and check if current session token is a valid JWT
    const token = await getSessionFromHeaders(request);
    if (token && token.includes('.') && token.split('.').length === 3) {
        return token;
    }

    // 2. Fallback: Authenticate with the Stratos backend using default operator credentials
    try {
        const response = await axios.post(`${BACKEND_URL}/auth/login`, {
            username: 'yogesh',
            password: 'stratos_pass'
        });
        return response.data.access_token;
    } catch (tokenErr) {
        try {
            // Try /auth/token as fallback
            const response = await axios.post(`${BACKEND_URL}/auth/token`, {
                username: 'yogesh',
                password: 'stratos_pass'
            });
            return response.data.access_token;
        } catch (loginErr) {
            console.error('Failed to authenticate with Stratos backend:', loginErr);
            throw new Error('Stratos authentication handshake failed');
        }
    }
}

export async function POST(request: NextRequest) {
    // 1. Auth Check
    const auth = await requireAuth(request);
    if (!auth.authorized) {
        return auth.response;
    }

    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: 'YouTube URL is required' },
                { status: 400 }
            );
        }

        // Parse video ID from URL
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        
        // 2. Fetch Transcript using Stratos API
        console.log(`Fetching transcript from Stratos API for: ${url}`);
        const jwtToken = await getStratosJwtToken(request);
        
        const apiResponse = await axios.post(`${BACKEND_URL}/summarize/transcript`, {
            youtube_url: url
        }, {
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        });

        if (apiResponse.status !== 200 || !apiResponse.data.transcripts || apiResponse.data.transcripts.length === 0) {
            return NextResponse.json(
                { error: 'Failed to fetch video transcript from Stratos. The video might not have captions enabled.' },
                { status: 400 }
            );
        }

        const transcriptItem = apiResponse.data.transcripts[0];
        let transcriptText = transcriptItem.transcript_text;
        const videoId = videoIdMatch ? videoIdMatch[1] : (transcriptItem.video_id || '');
        const videoTitle = transcriptItem.title || '';

        console.log(`Transcript fetched. Title: "${videoTitle}", Length: ${transcriptText.length} characters.`);

        // Truncate if too long (Gemini Flash has ~1M token context, but let's be safe/fast)
        if (transcriptText.length > 50000) {
            transcriptText = transcriptText.substring(0, 50000) + '...';
        }

        // 3. AI Generation
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'GEMINI_API_KEY is not set in server environment' },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        // --- STEP 1: EXTRACTOR AGENT ---
        console.log('Step 1: Extracting key information...');
        const extractionPrompt = `
            You are an expert technical researcher. Analyze the following video transcript and extract the core knowledge.
            
            Goal: Create a structured summary that a blog writer can use to write a high-quality technical article.
            
            Transcript:
            ${transcriptText}
            
            Output Requirements:
            1. **Core Topic**: What is this video mainly about?
            2. **Key Takeaways**: List the 3-5 most important points.
            3. **Technical Details**: Extract code concepts, commands, library names, or specific logic mentioned.
            4. **Structure**: suggest a logical heading structure for a blog post (Introduction, H2s, Conclusion).
        `;

        const extractionResponse = await generateWithRetry(ai, 'gemini-3-flash-preview', extractionPrompt);

        const extractedInfo = extractTextFromResponse(extractionResponse);
        if (!extractedInfo) throw new Error('Failed to extract information from transcript');

        // --- STEP 2: WRITER AGENT ---
        console.log('Step 2: Writing blog post...');
        const writerPrompt = `
            You are an expert technical blog writer and developer advocate.
            Write a complete, polished blog post based on the following extracted research.

            Research Summary:
            ${extractedInfo}

            Video URL: https://www.youtube.com/watch?v=${videoId}

            Requirements:
            1. **Title**: Catchy, SEO-optimized, technical.
            2. **Slug**: URL-friendly version of the title.
            3. **Excerpt**: A compelling 2-sentence hook.
            4. **Content (Markdown)**: 
               - Write a full, long-form technical article.
               - **Aesthetics & Formatting (CRITICAL)**:
                 - Use **H2** and **H3** headers frequently to break up text.
                 - Keep paragraphs short (2-3 sentences max) for better readability ("breathable text").
                 - Use **Bold** for key concepts and emphasis.
                 - Use *Italics* for subtle emphasis.


                 - Use \`> Blockquotes\` for key takeaways, important notes, or summaries.
                 - Use Bullet points and Numbered lists liberally to organize information.
                 - Use Tables for comparisons if applicable.
                 - Use Code blocks with language specification (e.g., \`\`\`python).
               - **IMPORTANT: Image Handling**: 
                 - DO NOT generate actual images.
                 - **Manually insert prompts for where images should be.** 
                 - Format: \`> **Image Prompt:** [Detailed description of what the image should show]\`
                 - Place these prompts naturally throughout the text (e.g., after an intro, before a complex section).
                 - Include one **Cover Image Prompt** at the very beginning of the content body.
            5. **Format**: Return ONLY valid JSON with keys: "title", "slug", "excerpt", "content".
        `;

        const writerResponse = await generateWithRetry(ai, 'gemini-3-flash-preview', writerPrompt);

        const writerOutput = extractTextFromResponse(writerResponse);
        if (!writerOutput) throw new Error('Failed to generate blog content');

        // Parse JSON
        const jsonMatch = writerOutput.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse JSON response from Writer Agent');
        }

        const blogData = JSON.parse(jsonMatch[0]);

        // No automatic cover image generation - user will handle it manually.
        // We set a default placeholder or empty string.
        blogData.cover_image = '';

        return NextResponse.json(blogData);

    } catch (error: any) {
        console.error('AI Generation Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// Helper to extract text from Gemini response
function extractTextFromResponse(response: any): string | null {
    let text = '';
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                text += part.text;
            }
        }
    }
    return text || null;
}

// Helper for retry logic
async function generateWithRetry(ai: GoogleGenAI, model: string, prompt: string, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent({
                model: model,
                contents: prompt,
            });
        } catch (error: any) {
            // Check for 503 Service Unavailable or 429 Too Many Requests
            if ((error.status === 503 || error.status === 429) && i < retries - 1) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000; // Exponential backoff + jitter
                console.warn(`Gemini API overloaded (${error.status}). Retrying in ${Math.round(delay)}ms...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw error;
            }
        }
    }
    throw new Error('Max retries exceeded');
}
