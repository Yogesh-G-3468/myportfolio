import { YoutubeTranscript } from 'youtube-transcript-api-ts';
import { Innertube, ClientType } from 'youtubei.js';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Setup global axios interceptor for youtube-transcript-api-ts
// This library uses axios internally, so we can intercept its requests.
function setupAxiosInterceptor() {
    const proxyUrl = process.env.YOUTUBE_PROXY_URL;
    const cookie = process.env.YOUTUBE_COOKIE;

    // We patch it if credentials exist, OR if we want to be safe and just patch it to check env on every request 
    // (though env vars usually don't change at runtime).
    // Let's only patch if we have something to add.
    if (!proxyUrl && !cookie) return;

    const applyInterceptor = (instance: any) => {
        instance.interceptors.request.use((config: any) => {
            // Apply to all requests
            if (proxyUrl) {
                const agent = new HttpsProxyAgent(proxyUrl);
                config.httpsAgent = agent;
                config.proxy = false;
            }

            if (cookie) {
                config.headers['Cookie'] = cookie;
                config.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
                config.headers['Accept-Language'] = 'en-US,en;q=0.9';
            }

            return config;
        }, (error: any) => {
            return Promise.reject(error);
        });
    };

    // Apply to global instance (used by Transcript.js in the lib)
    applyInterceptor(axios);

    // Monkey-patch axios.create (used by TranscriptListFetcher.js in the lib)
    const originalCreate = axios.create;
    axios.create = function (config) {
        const instance = originalCreate.call(this, config);
        applyInterceptor(instance);
        return instance;
    };

    console.log('[YouTube] Axios interceptor configured with ' + (proxyUrl ? 'Proxy ' : '') + (cookie ? 'Cookie' : ''));
}

// Initialize interceptor
setupAxiosInterceptor();

let innertube: Innertube | null = null;

async function getInnertube(): Promise<Innertube> {
    if (!innertube) {
        innertube = await Innertube.create({
            lang: 'en',
            location: 'US',
            retrieve_player: false,
            client_type: ClientType.WEB,
            generate_session_locally: true
        });
    }
    return innertube;
}

export interface VideoTranscript {
    videoId: string;
    title: string;
    transcriptText: string;
    duration: number;
    segments: Array<{
        startMs: number;
        text: string;
        duration?: number;
    }>;
}

export interface TranscriptItem {
    text: string;
    duration: number;
    offset: number;
}

// Main YouTube Transcript Extractor Class
export class YouTubeTranscriptExtractor {

    /**
     * Fetch transcript using Innertube (youtubei.js)
     * Handles singleton instance and robust extraction
     */
    async getVideoTranscriptInnertube(videoId: string, preferredLang?: string): Promise<VideoTranscript | null> {
        try {
            console.log(`[Innertube] Fetching transcript for ${videoId}...`);
            const yt = await getInnertube();

            // Fetch video info
            const info = await yt.getInfo(videoId);

            // Get transcript info
            let transcriptInfo;
            try {
                transcriptInfo = await info.getTranscript();
            } catch (err: any) {
                console.error(`[Innertube] No transcript available for ${videoId}:`, err.message);
                return null;
            }

            // Select language if preferredLang is provided
            if (preferredLang) {
                try {
                    transcriptInfo = await transcriptInfo.selectLanguage(preferredLang);
                } catch (err) {
                    console.warn(`[Innertube] Could not select language '${preferredLang}', using default.`);
                }
            }

            // Debugging path - remove or comment out in production
            if (process.env.DEBUG_TRANSCRIPT === 'true') {
                console.log('--- Transcript Info Debug ---');
                console.dir(transcriptInfo, { depth: 5 });
            }

            // Robust extraction strategy
            const segments: Array<{ startMs: number; text: string; duration?: number }> = [];
            let fullText = "";

            // Strategy 1: Standard TranscriptSearchPanel
            if (transcriptInfo.transcript?.content?.body?.initial_segments) {
                const initialSegments = transcriptInfo.transcript.content.body.initial_segments;

                for (const segment of initialSegments) {
                    // Check if it's a valid segment (has snippet/text)
                    if (segment.snippet && segment.snippet.text) {
                        const text = segment.snippet.text;
                        const startMs = parseInt(segment.start_ms || "0", 10);
                        const duration = parseInt(segment.end_ms || "0", 10) - startMs;

                        segments.push({
                            startMs,
                            text,
                            duration
                        });
                        fullText += text + " ";
                    }
                }
            }
            // Strategy 2: Fallback to checking page/raw data if structure varies
            else if (transcriptInfo.page) {
                console.warn('[Innertube] Using fallback extraction from raw page data');
                // This is a heuristic fallback; strict implementation depends on observing the raw structure
                // For now, if strategy 1 fails, we log and return empty to avoid breaking
            }

            if (segments.length === 0) {
                console.warn('[Innertube] No segments found after parsing.');
                return null;
            }

            return {
                videoId,
                title: info.primary_info?.title?.toString() || `Video ${videoId}`,
                transcriptText: fullText.trim(),
                duration: segments.length > 0 ? segments[segments.length - 1].startMs / 1000 : 0, // Approx duration
                segments: segments
            };

        } catch (error) {
            console.error(`[Innertube] Error fetching transcript for ${videoId}:`, error);
            return null;
        }
    }

    /**
     * Extract video ID from various YouTube URL formats
     */
    extractVideoId(url: string): string | null {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
            /youtube\.com\/embed\/([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    }

    /**
     * Extract playlist ID from YouTube URL
     */
    extractPlaylistId(url: string): string | null {
        try {
            const urlObj = new URL(url);
            return urlObj.searchParams.get('list');
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if URL is a playlist
     */
    isPlaylist(url: string): boolean {
        return url.includes('list=');
    }

    /**
     * Get transcript for a single video with error handling
     */

    /**
     * Get transcript for a single video using youtube-transcript-api-ts
     */
    async getVideoTranscript(videoId: string): Promise<VideoTranscript | null> {
        try {
            console.log(`Fetching transcript for ${videoId} using youtube-transcript-api-ts...`);

            // Fetch transcript as text
            // Note: The library type definition for 'val' in fetchTranscript might need casting or handling based on options
            const transcriptText = await YoutubeTranscript.fetchTranscript(videoId, {
                lang: 'en',
                country: 'US',
                format: 'text' // We request text format directly
            });

            // The library returns a string when format is 'text', or array of objects otherwise.
            // However, TypeScript might infer it as a union type. We perform a runtime check/cast if needed,
            // but usually it just works if the library types are correct. 
            // Based on the user snippet, it returns string.

            if (typeof transcriptText === 'string') {
                return {
                    videoId,
                    title: `Video ${videoId}`, // We don't get title from this API, keeping placeholder
                    transcriptText: transcriptText,
                    duration: 0, // Duration not available in text format
                    segments: []
                };
            } else {
                console.warn('Unexpected transcript format returned');
                return null;
            }

        } catch (error) {
            console.error(`Error fetching transcript for ${videoId}:`, error);
            return null; // The existing logic handles null as error in the API route
        }
    }

    // Removed _fetchTranscriptManual and _getTranscriptYtDlp as they are superseded by the new library.


    /**
     * Get all video IDs from a playlist using yt-dlp-exec
     */
    async getPlaylistVideos(playlistUrl: string): Promise<string[]> {
        try {
            // Extract playlist ID
            const playlistId = this.extractPlaylistId(playlistUrl);
            if (!playlistId) {
                console.error('Could not extract playlist ID from URL');
                return [];
            }

            // Try YouTube Data API first if API key is available
            const apiKey = process.env.YOUTUBE_API_KEY;
            if (apiKey) {
                return await this._getPlaylistVideosAPI(playlistId, apiKey);
            }

            // Fallback to yt-dlp
            return await this._getPlaylistVideosYtDlp(playlistUrl);

        } catch (error) {
            console.error('Error getting playlist videos:', error);
            return [];
        }
    }

    /**
     * Get playlist videos using YouTube Data API
     */
    private async _getPlaylistVideosAPI(
        playlistId: string,
        apiKey: string
    ): Promise<string[]> {
        const videoIds: string[] = [];
        let nextPageToken: string | undefined;

        try {
            do {
                const params = new URLSearchParams({
                    part: 'contentDetails',
                    playlistId,
                    maxResults: '50',
                    key: apiKey,
                    ...(nextPageToken && { pageToken: nextPageToken })
                });

                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/playlistItems?${params}`
                );

                if (!response.ok) {
                    throw new Error(`API request failed: ${response.statusText}`);
                }

                const data = await response.json();

                for (const item of data.items) {
                    videoIds.push(item.contentDetails.videoId);
                }

                nextPageToken = data.nextPageToken;

            } while (nextPageToken);

            return videoIds;

        } catch (error) {
            console.error('YouTube API error. Falling back to yt-dlp:', error);
            return this._getPlaylistVideosYtDlp(
                `https://www.youtube.com/playlist?list=${playlistId}`
            );
        }
    }

    /**
     * Fallback method using yt-dlp to extract playlist videos
     */
    private async _getPlaylistVideosYtDlp(playlistUrl: string): Promise<string[]> {
        try {
            const ytdlpModule = await import('yt-dlp-exec');
            // Safe import for robust usage
            const ytdlp = ytdlpModule.default || ytdlpModule;

            // Extract playlist ID and construct proper URL
            const playlistId = this.extractPlaylistId(playlistUrl);
            if (!playlistId) {
                console.error('Could not extract playlist ID');
                return [];
            }

            const properPlaylistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;

            const output = await ytdlp(properPlaylistUrl, {
                dumpSingleJson: true,
                flatPlaylist: true,
                noWarnings: true,
                noCallHome: true,
                noCheckCertificate: true,
                preferFreeFormats: true,
                youtubeSkipDashManifest: true
            } as any) as any;

            if (output.entries) {
                return output.entries
                    .filter((entry: any) => entry && entry.id)
                    .map((entry: any) => entry.id);
            } else if (output.id) {
                // Single video
                return [output.id];
            }

            return [];

        } catch (error) {
            console.error('Error using yt-dlp:', error);
            return [];
        }
    }
}
