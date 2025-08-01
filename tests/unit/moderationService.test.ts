import { ModerationService } from '../../src/services/moderationService';
import { ModerationRequest, VideoModerationRequest } from '../../src/types';

describe('ModerationService', () => {
  let moderationService: ModerationService;

  beforeEach(() => {
    moderationService = new ModerationService();
  });

  describe('moderateText', () => {
    it('should return safe result for clean content', async () => {
      const request: ModerationRequest = {
        content: 'This is a perfectly safe and normal message.',
      };

      const result = await moderationService.moderateText(request);

      expect(result.type).toBe('text');
      expect(result.flagged).toBe(false);
      expect(result.categories).toHaveLength(5);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.explanation).toBeDefined();
    });

    it('should flag content with inappropriate keywords', async () => {
      const request: ModerationRequest = {
        content: 'This message contains hate speech and violence.',
      };

      const result = await moderationService.moderateText(request);

      expect(result.type).toBe('text');
      expect(result.flagged).toBe(true);
      expect(result.categories.some(cat => cat.flagged)).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.explanation).toContain('flagged');
    });

    it('should handle empty content', async () => {
      const request: ModerationRequest = {
        content: '',
      };

      const result = await moderationService.moderateText(request);

      expect(result.type).toBe('text');
      expect(result.flagged).toBe(false);
      expect(result.categories).toHaveLength(5);
    });

    it('should include metadata in processing', async () => {
      const request: ModerationRequest = {
        content: 'Test content',
        metadata: { userId: '12345', source: 'chat' },
      };

      const result = await moderationService.moderateText(request);

      expect(result.type).toBe('text');
      expect(result).toBeDefined();
    });
  });

  describe('moderateVideo', () => {
    it('should return result for video URL', async () => {
      const request: VideoModerationRequest = {
        videoUrl: 'https://example.com/video.mp4',
      };

      const result = await moderationService.moderateVideo(request);

      expect(result.type).toBe('video');
      expect(result.categories).toHaveLength(4);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.timestamps).toBeDefined();
    });

    it('should handle video data buffer', async () => {
      const request: VideoModerationRequest = {
        videoData: Buffer.from('fake video data'),
      };

      const result = await moderationService.moderateVideo(request);

      expect(result.type).toBe('video');
      expect(result.categories).toHaveLength(4);
      expect(result.timestamps).toBeDefined();
    });

    it('should include timestamps when flagged', async () => {
      // Run multiple times since mock has random flagging
      const results = [];
      for (let i = 0; i < 10; i++) {
        const request: VideoModerationRequest = {
          videoUrl: 'https://example.com/video.mp4',
        };
        results.push(await moderationService.moderateVideo(request));
      }

      // At least one should be flagged (30% chance each, very unlikely all clean)
      const flaggedResult = results.find(r => r.flagged);
      if (flaggedResult) {
        expect(flaggedResult.timestamps).toHaveLength(1);
        expect(flaggedResult.timestamps![0].start).toBeDefined();
        expect(flaggedResult.timestamps![0].end).toBeDefined();
        expect(flaggedResult.timestamps![0].category).toBeDefined();
        expect(flaggedResult.timestamps![0].confidence).toBeGreaterThan(0);
      }
    });
  });

  describe('service availability', () => {
    it('should check OpenAI availability', () => {
      const isAvailable = moderationService.isOpenAIAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });

    it('should check AWS availability', () => {
      const isAvailable = moderationService.isAWSAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });
  });
});