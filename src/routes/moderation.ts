import { Router, Request, Response } from 'express';
import { ModerationService } from '../services/moderationService';
import {
  ModerationRequest,
  VideoModerationRequest,
  TextModerationResult,
  VideoModerationResult,
  ApiResponse,
} from '../types';

const router = Router();
const moderationService = new ModerationService();

// POST /moderate/text
router.post('/text', async (req: Request, res: Response<ApiResponse<TextModerationResult>>) => {
  try {
    const { content, metadata } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Content is required and must be a string',
        timestamp: new Date().toISOString(),
      });
    }

    if (content.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Content exceeds maximum length of 10000 characters',
        timestamp: new Date().toISOString(),
      });
    }

    const request: ModerationRequest = { content, metadata };
    const result = await moderationService.moderateText(request);

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Text moderation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during text moderation',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /moderate/video
router.post('/video', async (req: Request, res: Response<ApiResponse<VideoModerationResult>>) => {
  try {
    const { videoUrl, videoData, metadata } = req.body;

    if (!videoUrl && !videoData) {
      return res.status(400).json({
        success: false,
        error: 'Either videoUrl or videoData is required',
        timestamp: new Date().toISOString(),
      });
    }

    if (videoUrl && typeof videoUrl !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'videoUrl must be a string',
        timestamp: new Date().toISOString(),
      });
    }

    // Basic URL validation if videoUrl is provided
    if (videoUrl) {
      try {
        new URL(videoUrl);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Invalid video URL format',
          timestamp: new Date().toISOString(),
        });
      }
    }

    const request: VideoModerationRequest = { videoUrl, videoData, metadata };
    const result = await moderationService.moderateVideo(request);

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Video moderation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during video moderation',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;