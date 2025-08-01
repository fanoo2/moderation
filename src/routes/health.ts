import { Router, Request, Response } from 'express';
import { HealthStatus, ApiResponse } from '../types';

const router = Router();

router.get('/health', (req: Request, res: Response<ApiResponse<HealthStatus>>) => {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();
  
  // Check if environment variables for external services are available
  const openaiAvailable = !!process.env.OPENAI_API_KEY;
  const rekognitionAvailable = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp,
    version: process.env.npm_package_version || '1.0.0',
    uptime,
    services: {
      openai: openaiAvailable,
      rekognition: rekognitionAvailable,
    },
  };

  res.status(200).json({
    success: true,
    data: healthStatus,
    timestamp,
  });
});

export default router;