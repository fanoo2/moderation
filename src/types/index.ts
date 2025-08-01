export interface ModerationRequest {
  content: string;
  metadata?: Record<string, any>;
}

export interface VideoModerationRequest {
  videoUrl?: string;
  videoData?: Buffer;
  metadata?: Record<string, any>;
}

export interface ModerationResult {
  flagged: boolean;
  categories: ModerationCategory[];
  confidence: number;
  explanation?: string;
}

export interface ModerationCategory {
  category: string;
  flagged: boolean;
  score: number;
}

export interface TextModerationResult extends ModerationResult {
  type: 'text';
}

export interface VideoModerationResult extends ModerationResult {
  type: 'video';
  timestamps?: VideoModerationTimestamp[];
}

export interface VideoModerationTimestamp {
  start: number;
  end: number;
  category: string;
  confidence: number;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    openai: boolean;
    rekognition: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}