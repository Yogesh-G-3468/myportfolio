export interface TrendTopic {
  id: number;
  name: string;
  relevance_score: number; // 1-10
  why_trending: string;
  content_angle: string;
  status: 'scanned' | 'generating' | 'drafted';
}

export interface QualityCheck {
  name: string;
  passed: boolean;
  message: string;
}

export interface QualityGate {
  approved: boolean;
  warnings: string[];
  suggested_edit: string | null;
  checks?: QualityCheck[];
}

export interface Suggestion {
  id: number;
  topic_id: number;
  format: 'single_tweet' | 'thread';
  tweets: string[];
  status: 'suggested' | 'posted' | 'rejected';
  posted_url?: string;
  reasoning: string;
  quality_gate: QualityGate;
  created_at?: string;
}

export interface GeneratePayload {
  topic_id: number;
}

export interface SaveEditsPayload {
  tweets: string[];
}

export interface PostPayload {
  status: 'posted';
  posted_url: string;
}
