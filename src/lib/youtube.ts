// Types and Interfaces
import { YoutubeTranscript } from 'youtube-transcript-api-ts';

export interface VideoTranscript {
    videoId: string;
    title: string;
    transcriptText: string;
    duration: number;
}

export interface TranscriptItem {
    text: string;
    duration: number;
    offset: number;
}

// Main YouTube Transcript Extractor Class
export class YouTubeTranscriptExtractor {

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
                    duration: 0 // Duration not available in text format
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
