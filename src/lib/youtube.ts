// Types and Interfaces
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
    async getVideoTranscript(videoId: string): Promise<VideoTranscript | null> {
        try {
            console.log(`Fetching transcript for ${videoId} using manual extraction...`);

            // Attempt 1: Manual Extraction (Most robust for Vercel)
            const manualTranscript = await this._fetchTranscriptManual(videoId);

            if (manualTranscript) {
                return {
                    videoId,
                    title: `Video ${videoId}`,
                    transcriptText: manualTranscript,
                    duration: 0 // We could calculate this if needed, but for now 0 is fine
                };
            }

            // Attempt 2: yt-dlp Fallback (Works LOCALLY, fails on Vercel usually)
            if (process.env.NODE_ENV === 'development') {
                console.log('Attempting local yt-dlp fallback...');
                const ytdlpText = await this._getTranscriptYtDlp(videoId);
                if (ytdlpText) {
                    return {
                        videoId,
                        title: `Video ${videoId}`,
                        transcriptText: ytdlpText,
                        duration: 0
                    };
                }
            } else {
                console.warn('Skipping yt-dlp fallback in production (requires Python/binary).');
            }

            return null;

        } catch (error) {
            console.error(`Error fetching transcript for ${videoId}:`, error);
            return null;
        }
    }

    /**
     * Manual transcript extraction (Ports logic from test.js)
     */
    async _fetchTranscriptManual(videoId: string, lang = "en"): Promise<string | null> {
        try {
            const url = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;

            const response = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept-Language": "en-US,en;q=0.9",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch video page: ${response.statusText}`);
            }

            const html = await response.text();

            const pr = this.extractPlayerResponse(html);
            if (!pr) return null;

            const track = this.pickTrack(pr, lang);

            if (!track || !track.baseUrl) {
                console.warn(`No caption track found for lang=${lang}`);
                return null;
            }

            const captionsUrl = `${track.baseUrl}&fmt=json3`;
            const captionsRes = await fetch(captionsUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });

            if (!captionsRes.ok) {
                throw new Error(`Failed to fetch captions: ${captionsRes.statusText}`);
            }

            const body = await captionsRes.text();
            const json = JSON.parse(body);

            if (json.events) {
                return json.events
                    .filter((e: any) => e.segs)
                    .map((e: any) => e.segs.map((s: any) => s.utf8).join(''))
                    .join(' ')
                    .replace(/\n/g, ' ');
            }

            return null;
        } catch (error) {
            console.error('Manual transcript fetch failed:', error);
            return null;
        }
    }

    extractPlayerResponse(html: string): any {
        const m = html.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]+?\})\s*;/);
        if (!m) {
            console.warn("ytInitialPlayerResponse not found");
            return null;
        }
        return JSON.parse(m[1]);
    }

    pickTrack(playerResponse: any, lang: string, preferAuto = false): any {
        const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

        if (!tracks?.length) return null;

        // kind === "asr" means auto-generated captions
        const filtered = tracks.filter((t: any) => t.languageCode === lang);
        if (!filtered.length) {
            // Try to find any English if exact match failed
            const en = tracks.find((t: any) => t.languageCode.startsWith('en'));
            if (en) return en;
            return tracks[0]; // Fallback to first available
        }

        if (preferAuto) return filtered.find((t: any) => t.kind === "asr") ?? filtered[0];
        return filtered.find((t: any) => t.kind !== "asr") ?? filtered[0];
    }

    /**
     * Fetch transcript using yt-dlp JSON dump (Fallback)
     */
    async _getTranscriptYtDlp(videoId: string): Promise<string | null> {
        try {
            console.log('Importing yt-dlp-exec for transcript fallback...');
            const ytdlpModule = await import('yt-dlp-exec');
            const ytdlp = ytdlpModule.default || ytdlpModule;
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

            // Fetch metadata including subtitle URLs
            const output = await ytdlp(videoUrl, {
                dumpSingleJson: true,
                skipDownload: true,
                writeAutoSub: true,
                writeSub: true,
                noWarnings: true,
                noCheckCertificate: true,
            } as any) as any;

            // Check for manual captions or auto-generated captions
            let captionUrl = null;

            if (output.subtitles && output.subtitles.en) {
                captionUrl = output.subtitles.en[0].url;
            } else if (output.automatic_captions) {
                const enCap = output.automatic_captions.en || output.automatic_captions['en-orig'];
                if (enCap) captionUrl = enCap[0].url;
            }

            if (!captionUrl) {
                console.warn('No English captions found in yt-dlp output');
                return null;
            }

            console.log('Fetching captions from URL:', captionUrl);
            const res = await fetch(captionUrl);
            if (!res.ok) throw new Error('Failed to download caption file');

            const text = await res.text();

            // Clean up VTT/JSON/XML
            try {
                const json = JSON.parse(text);
                if (json.events) {
                    return json.events
                        .filter((e: any) => e.segs)
                        .map((e: any) => e.segs.map((s: any) => s.utf8).join(''))
                        .join(' ')
                        .replace(/\n/g, ' ');
                }
            } catch (e) {
                if (text.includes('<text')) {
                    return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                }
                if (text.includes('WEBVTT')) {
                    return text
                        .split('\n')
                        .filter(line => !line.includes('-->') && line.trim() !== '' && line !== 'WEBVTT')
                        .join(' ');
                }
            }

            return text;

        } catch (err) {
            console.error('yt-dlp transcript fetch failed:', err);
            return null;
        }
    }

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
