import {
  ModerationRequest,
  VideoModerationRequest,
  TextModerationResult,
  VideoModerationResult,
  ModerationCategory,
} from '../types';

export class ModerationService {
  private openaiApiKey: string | undefined;
  private awsAccessKey: string | undefined;
  private awsSecretKey: string | undefined;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
    this.awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
  }

  async moderateText(request: ModerationRequest): Promise<TextModerationResult> {
    if (this.openaiApiKey) {
      // Real OpenAI implementation would go here
      return this.callOpenAIModerationAPI(request);
    } else {
      // Mock implementation
      return this.mockTextModeration(request);
    }
  }

  async moderateVideo(request: VideoModerationRequest): Promise<VideoModerationResult> {
    if (this.awsAccessKey && this.awsSecretKey) {
      // Real AWS Rekognition implementation would go here
      return this.callAWSRekognitionAPI(request);
    } else {
      // Mock implementation
      return this.mockVideoModeration(request);
    }
  }

  private async callOpenAIModerationAPI(request: ModerationRequest): Promise<TextModerationResult> {
    // This would be the real OpenAI API call
    // For now, return mock data with a placeholder comment
    return this.mockTextModeration(request);
  }

  private async callAWSRekognitionAPI(request: VideoModerationRequest): Promise<VideoModerationResult> {
    // This would be the real AWS Rekognition API call
    // For now, return mock data with a placeholder comment
    return this.mockVideoModeration(request);
  }

  private mockTextModeration(request: ModerationRequest): TextModerationResult {
    const categories: ModerationCategory[] = [
      { category: 'hate', flagged: false, score: 0.1 },
      { category: 'harassment', flagged: false, score: 0.05 },
      { category: 'self-harm', flagged: false, score: 0.02 },
      { category: 'sexual', flagged: false, score: 0.03 },
      { category: 'violence', flagged: false, score: 0.04 },
    ];

    // Simple mock logic: flag content containing certain keywords
    const flaggedKeywords = ['hate', 'violence', 'inappropriate', 'harmful'];
    const contentLower = request.content.toLowerCase();
    const hasFlaggedContent = flaggedKeywords.some(keyword => contentLower.includes(keyword));

    if (hasFlaggedContent) {
      categories.forEach(cat => {
        if (flaggedKeywords.some(keyword => contentLower.includes(keyword))) {
          cat.flagged = true;
          cat.score = Math.random() * 0.5 + 0.5; // Random score between 0.5-1.0
        }
      });
    }

    const flagged = categories.some(cat => cat.flagged);
    const confidence = flagged ? Math.max(...categories.map(c => c.score)) : Math.max(...categories.map(c => c.score));

    return {
      type: 'text',
      flagged,
      categories,
      confidence,
      explanation: flagged ? 'Content flagged for potentially inappropriate material' : 'Content appears safe',
    };
  }

  private mockVideoModeration(_request: VideoModerationRequest): VideoModerationResult {
    const categories: ModerationCategory[] = [
      { category: 'explicit', flagged: false, score: 0.1 },
      { category: 'violence', flagged: false, score: 0.05 },
      { category: 'suggestive', flagged: false, score: 0.08 },
      { category: 'drugs', flagged: false, score: 0.02 },
    ];

    // Mock logic: randomly flag some content for demo purposes
    const shouldFlag = Math.random() > 0.7; // 30% chance of flagging

    if (shouldFlag) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      randomCategory.flagged = true;
      randomCategory.score = Math.random() * 0.4 + 0.6; // Score between 0.6-1.0
    }

    const flagged = categories.some(cat => cat.flagged);
    const confidence = flagged ? Math.max(...categories.map(c => c.score)) : Math.max(...categories.map(c => c.score));

    return {
      type: 'video',
      flagged,
      categories,
      confidence,
      explanation: flagged ? 'Video flagged for potentially inappropriate content' : 'Video appears safe',
      timestamps: flagged ? [{
        start: 10.5,
        end: 15.2,
        category: categories.find(c => c.flagged)?.category || 'unknown',
        confidence: confidence,
      }] : [],
    };
  }

  isOpenAIAvailable(): boolean {
    return !!this.openaiApiKey;
  }

  isAWSAvailable(): boolean {
    return !!(this.awsAccessKey && this.awsSecretKey);
  }
}