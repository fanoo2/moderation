import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import healthRoutes from './routes/health';
import moderationRoutes from './routes/moderation';

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for video data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/', healthRoutes);
app.use('/moderate', moderationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// Start server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Moderation service listening on port ${port}`);
    console.log(`Health check available at: http://localhost:${port}/health`);
    console.log(`Text moderation available at: http://localhost:${port}/moderate/text`);
    console.log(`Video moderation available at: http://localhost:${port}/moderate/video`);
  });
}

export default app;