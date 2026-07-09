import axios from 'axios';
import { TrendTopic, Suggestion, GeneratePayload, SaveEditsPayload, PostPayload } from './twitterTypes';

const API_BASE_URL = 'http://localhost:8000';

// In-memory mock database state
let mockTopics: TrendTopic[] = [
  {
    id: 1,
    name: 'React 19 & Next.js 16 compiler',
    relevance_score: 9,
    why_trending: 'React 19 is now stable. Developers are debating forwardRef deprecation and automated memoization.',
    content_angle: 'Actionable code comparison of React 19 direct ref props vs the deprecated forwardRef API.',
    status: 'scanned'
  },
  {
    id: 2,
    name: 'Vercel AI SDK v4',
    relevance_score: 10,
    why_trending: 'Vercel released AI SDK v4 with native model-routing and advanced streaming UI components.',
    content_angle: 'Showcase a 10-line helper function that dynamically switches between OpenAI and Gemini based on prompt complexity.',
    status: 'scanned'
  },
  {
    id: 3,
    name: 'pgvector vs Specialized Vector DBs',
    relevance_score: 8,
    why_trending: 'Debates on Twitter/X about whether standalone vector databases are obsolete for mid-sized apps.',
    content_angle: 'Pragmatic take advising developers to start with Postgres pgvector and migrate only above 10M vectors.',
    status: 'scanned'
  },
  {
    id: 4,
    name: 'WebAssembly & Local LLMs',
    relevance_score: 7,
    why_trending: 'New browser benchmarks show WebAssembly-loaded models running llama-3-8b at 35 tokens/sec.',
    content_angle: 'Highlighting browser-native AI possibilities and offline privacy advantages.',
    status: 'scanned'
  }
];

let mockSuggestions: Suggestion[] = [
  {
    id: 101,
    topic_id: 1,
    format: 'thread',
    status: 'suggested',
    reasoning: 'React 19 is trending hot. Educational threads attract 4.2x higher bookmarks than single-line takes.',
    tweets: [
      'React 19 & Next.js 16 are officially here, and they completely change how we write UI code. 🧵\n\nHere are 3 major deprecations and updates you need to know today to keep your codebase clean. 👇',
      '1. forwardRef is deprecated.\n\nYou no longer need to wrap components to forward refs. Just pass ref as a normal prop!\n\nBefore:\nconst Input = forwardRef((props, ref) => ...)\n\nAfter:\nconst Input = ({ ref, ...props }) => ...',
      '2. Automated Memoization.\n\nThe React Compiler is now active by default. Manual optimization using useMemo() and useCallback() is no longer necessary.\n\nLet the compiler handle the dependency arrays.'
    ],
    quality_gate: {
      approved: true,
      warnings: [],
      suggested_edit: null,
      checks: [
        { name: 'Character Limit', passed: true, message: 'All tweets are under 280 characters.' },
        { name: 'Spam Filter', passed: true, message: 'No repetitive hashtags or spam patterns detected.' },
        { name: 'Technical Clarity', passed: true, message: 'Code examples are syntactically valid React 19.' }
      ]
    },
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 102,
    topic_id: 3,
    format: 'single_tweet',
    status: 'suggested',
    reasoning: 'pgvector is currently a controversial topic. Hot takes yield high impressions.',
    tweets: [
      'Is pgvector all you need? Honestly, yes. Stop over-engineering your AI stack with 5 different databases. Postgres can do it all. Save your time and budget unless you are operating at massive Google-scale. 😤'
    ],
    quality_gate: {
      approved: false,
      warnings: [
        'Tone might be perceived as overly aggressive or opinionated.',
        'Missing links or citations to support the claim.'
      ],
      suggested_edit: 'Is pgvector all you need? For 90% of projects, yes. The simplicity of keeping vector embeddings in Postgres is unmatched. But when you hit 50M+ vectors, specialized DBs like Qdrant/Pinecone still dominate on latency and clustering. Build for your scale, not the hype.',
      checks: [
        { name: 'Tone Analysis', passed: false, message: 'Slightly aggressive tone detected.' },
        { name: 'Citations Check', passed: false, message: 'No external citations included.' },
        { name: 'Character Limit', passed: true, message: 'Within 280 character limit.' }
      ]
    },
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

// Helper to determine if we are in mock mode
let mockModeEnabled = true;

export const setMockMode = (enabled: boolean) => {
  mockModeEnabled = enabled;
};

export const getMockMode = () => mockModeEnabled;

// Axios instance with timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export const twitterApi = {
  // Test connection to FastAPI backend
  async checkBackend(): Promise<boolean> {
    try {
      await axios.get(`${API_BASE_URL}/docs`, { timeout: 1500 });
      return true;
    } catch {
      return false;
    }
  },

  // Trend Scout Scanning
  async scanTrends(): Promise<TrendTopic[]> {
    if (mockModeEnabled) {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate delay
      // Add a couple of new mock trends to simulate "scan"
      const currentIds = mockTopics.map(t => t.id);
      const newTopics: TrendTopic[] = [
        {
          id: Math.max(...currentIds, 0) + 1,
          name: 'AI Agent Swarms (LangGraph)',
          relevance_score: 9,
          why_trending: 'Enterprise developers shifting from single-agent chats to multi-agent orchestrated workflows.',
          content_angle: 'Provide a visual diagram of supervisor-worker routing patterns with LangGraph.',
          status: 'scanned'
        },
        {
          id: Math.max(...currentIds, 0) + 2,
          name: 'Tailwind CSS v4.0 Release',
          relevance_score: 8,
          why_trending: 'Tailwind v4.0 rewrites the engine in Rust and removes the tailwind.config file in favor of CSS variables.',
          content_angle: 'Summarize the CSS-first configuration and highlight the Rust performance gains.',
          status: 'scanned'
        }
      ];
      mockTopics = [...newTopics, ...mockTopics];
      return mockTopics;
    }

    const response = await api.post<TrendTopic[]>('/trends/scan');
    return response.data;
  },

  // Get active scanned topics
  async getTopics(): Promise<TrendTopic[]> {
    if (mockModeEnabled) {
      return mockTopics;
    }
    // Assume GET /trends is available, otherwise fall back to scanning/local
    try {
      const response = await api.get<TrendTopic[]>('/trends');
      return response.data;
    } catch {
      return mockTopics;
    }
  },

  // Content Generator
  async generateContent(topicId: number): Promise<Suggestion> {
    if (mockModeEnabled) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate generator delay
      
      const topic = mockTopics.find((t) => t.id === topicId);
      if (topic) {
        topic.status = 'drafted';
      }

      const newSuggestionId = Math.max(...mockSuggestions.map((s) => s.id), 0) + 1;
      
      // Determine format and draft content based on topic
      const isThread = topicId % 2 === 1;
      const tweets = isThread 
        ? [
            `Let's talk about ${topic?.name || 'this trending topic'}. 🧵\n\nHere is the angle you need to know: ${topic?.content_angle || 'Latest insights.'}`,
            `Why this is trending:\n${topic?.why_trending || 'High developer interest.'}`,
            `Takeaway: Keep your stack simple, iterate fast, and build for developer experience. What are your thoughts? 👇`
          ]
        : [
            `Hot take on ${topic?.name || 'this trend'}: ${topic?.content_angle || 'Keep it simple.'} What do you think about this? 🚀`
          ];

      const newSuggestion: Suggestion = {
        id: newSuggestionId,
        topic_id: topicId,
        format: isThread ? 'thread' : 'single_tweet',
        status: 'suggested',
        reasoning: `High relevancy score of ${topic?.relevance_score || 8}/10. Addresses current discussions in the community.`,
        tweets,
        quality_gate: {
          approved: true,
          warnings: [],
          suggested_edit: null,
          checks: [
            { name: 'Character Limit', passed: true, message: 'All tweets are within 280 characters.' },
            { name: 'Clarity', passed: true, message: 'Direct, developer-oriented tone.' }
          ]
        },
        created_at: new Date().toISOString()
      };

      mockSuggestions = [newSuggestion, ...mockSuggestions];
      return newSuggestion;
    }

    const response = await api.post<Suggestion>('/content/generate', { topic_id: topicId });
    return response.data;
  },

  // Suggestions Review Queue & Archives
  async getSuggestions(status: 'suggested' | 'posted' | 'rejected', limit = 20, offset = 0): Promise<Suggestion[]> {
    if (mockModeEnabled) {
      return mockSuggestions
        .filter((s) => s.status === status)
        .slice(offset, offset + limit);
    }

    const response = await api.get<Suggestion[]>('/content/suggestions', {
      params: { status, limit, offset }
    });
    return response.data;
  },

  // Edit / Patch suggestion
  async updateSuggestion(id: number, payload: Partial<Suggestion> | SaveEditsPayload | PostPayload): Promise<Suggestion> {
    if (mockModeEnabled) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const index = mockSuggestions.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Suggestion not found');
      
      // Merge updates
      const updated = {
        ...mockSuggestions[index],
        ...payload,
        // Recalculate character check on edit
        quality_gate: {
          ...mockSuggestions[index].quality_gate,
          checks: mockSuggestions[index].quality_gate.checks?.map(c => {
            if (c.name === 'Character Limit' && 'tweets' in payload) {
              const allPassed = (payload.tweets as string[]).every(t => t.length <= 280);
              return { ...c, passed: allPassed, message: allPassed ? 'All tweets are within 280 characters.' : 'One or more tweets exceed 280 characters.' };
            }
            return c;
          })
        }
      } as Suggestion;

      mockSuggestions[index] = updated;
      return updated;
    }

    const response = await api.patch<Suggestion>(`/content/suggestions/${id}`, payload);
    return response.data;
  },

  // Soft delete / Reject suggestion
  async rejectSuggestion(id: number): Promise<void> {
    if (mockModeEnabled) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = mockSuggestions.findIndex((s) => s.id === id);
      if (index !== -1) {
        mockSuggestions[index].status = 'rejected';
      }
      return;
    }

    await api.delete(`/content/suggestions/${id}`);
  }
};
