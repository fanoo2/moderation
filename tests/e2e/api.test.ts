import request from 'supertest';
import app from '../../src/app';

describe('Moderation API E2E Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.version).toBeDefined();
      expect(response.body.data.uptime).toBeGreaterThanOrEqual(0);
      expect(response.body.data.services).toBeDefined();
      expect(response.body.data.services.openai).toBeDefined();
      expect(response.body.data.services.rekognition).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('POST /moderate/text', () => {
    it('should moderate safe text content', async () => {
      const response = await request(app)
        .post('/moderate/text')
        .send({
          content: 'This is a safe and friendly message',
          metadata: { source: 'test' }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.type).toBe('text');
      expect(response.body.data.flagged).toBe(false);
      expect(response.body.data.categories).toHaveLength(5);
      expect(response.body.data.confidence).toBeGreaterThanOrEqual(0);
      expect(response.body.data.explanation).toBeDefined();
    });

    it('should flag inappropriate text content', async () => {
      const response = await request(app)
        .post('/moderate/text')
        .send({
          content: 'This message contains hate and violence'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.flagged).toBe(true);
      expect(response.body.data.categories.some((cat: any) => cat.flagged)).toBe(true);
    });

    it('should return 400 for missing content', async () => {
      const response = await request(app)
        .post('/moderate/text')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Content is required');
    });

    it('should return 400 for non-string content', async () => {
      const response = await request(app)
        .post('/moderate/text')
        .send({ content: 123 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('must be a string');
    });

    it('should return 400 for content exceeding maximum length', async () => {
      const longContent = 'a'.repeat(10001);
      const response = await request(app)
        .post('/moderate/text')
        .send({ content: longContent })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('exceeds maximum length');
    });
  });

  describe('POST /moderate/video', () => {
    it('should moderate video by URL', async () => {
      const response = await request(app)
        .post('/moderate/video')
        .send({
          videoUrl: 'https://example.com/sample-video.mp4',
          metadata: { source: 'upload' }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.type).toBe('video');
      expect(response.body.data.categories).toHaveLength(4);
      expect(response.body.data.confidence).toBeGreaterThanOrEqual(0);
      expect(response.body.data.timestamps).toBeDefined();
    });

    it('should moderate video by data', async () => {
      const videoData = Buffer.from('fake video binary data').toString('base64');
      const response = await request(app)
        .post('/moderate/video')
        .send({ videoData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('video');
    });

    it('should return 400 for missing video input', async () => {
      const response = await request(app)
        .post('/moderate/video')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Either videoUrl or videoData is required');
    });

    it('should return 400 for invalid video URL', async () => {
      const response = await request(app)
        .post('/moderate/video')
        .send({ videoUrl: 'not-a-valid-url' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid video URL format');
    });

    it('should return 400 for non-string video URL', async () => {
      const response = await request(app)
        .post('/moderate/video')
        .send({ videoUrl: 123 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('videoUrl must be a string');
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Endpoint not found');
    });
  });
});