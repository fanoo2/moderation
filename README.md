# Moderation Service

A Node.js microservice built with Express and TypeScript for content moderation using third-party APIs.

## Features

- **Text Moderation**: Analyzes text content using OpenAI Moderation API (with mock fallback)
- **Video Moderation**: Analyzes video content using AWS Rekognition (with mock fallback)
- **Health Monitoring**: Built-in health check endpoint
- **TypeScript**: Full type safety and modern JavaScript features
- **Comprehensive Testing**: Unit tests and end-to-end tests
- **Docker Support**: Production-ready containerization
- **Kubernetes Ready**: Helm chart for deployment with secrets management
- **CI/CD Pipeline**: GitHub Actions workflow for automated testing and deployment

## API Endpoints

### GET /health
Health check endpoint that returns service status and external API availability.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-08-01T03:20:13.318Z",
    "version": "1.0.0",
    "uptime": 21.496067536,
    "services": {
      "openai": false,
      "rekognition": false
    }
  },
  "timestamp": "2025-08-01T03:20:13.318Z"
}
```

### POST /moderate/text
Moderates text content for inappropriate material.

**Request:**
```json
{
  "content": "Text to moderate",
  "metadata": {
    "userId": "12345",
    "source": "chat"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "text",
    "flagged": false,
    "categories": [
      {
        "category": "hate",
        "flagged": false,
        "score": 0.1
      }
    ],
    "confidence": 0.1,
    "explanation": "Content appears safe"
  },
  "timestamp": "2025-08-01T03:20:21.961Z"
}
```

### POST /moderate/video
Moderates video content for inappropriate material.

**Request:**
```json
{
  "videoUrl": "https://example.com/video.mp4",
  "metadata": {
    "userId": "12345",
    "source": "upload"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "video",
    "flagged": false,
    "categories": [
      {
        "category": "explicit",
        "flagged": false,
        "score": 0.1
      }
    ],
    "confidence": 0.1,
    "explanation": "Video appears safe",
    "timestamps": []
  },
  "timestamp": "2025-08-01T03:20:40.869Z"
}
```

## Development

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Testing
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Linting
npm run lint
```

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `OPENAI_API_KEY`: OpenAI API key for text moderation
- `AWS_ACCESS_KEY_ID`: AWS access key for video moderation
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for video moderation

### Mock Mode
When API keys are not provided, the service runs in mock mode with simulated responses.

## Docker

### Build Image
```bash
docker build -t moderation-service .
```

### Run Container
```bash
docker run -p 3000:3000 moderation-service
```

## Kubernetes Deployment

### Using Helm

1. Create secrets for API keys:
```bash
kubectl create secret generic openai-api-secret --from-literal=api-key=your-openai-key
kubectl create secret generic aws-credentials-secret \
  --from-literal=access-key-id=your-aws-key \
  --from-literal=secret-access-key=your-aws-secret
```

2. Deploy with Helm:
```bash
helm install moderation-service ./helm/moderation-service
```

### Configuration
The Helm chart supports:
- Horizontal Pod Autoscaling
- Pod Anti-Affinity for high availability
- Resource limits and requests
- Health checks
- Service monitoring (Prometheus)
- Ingress configuration

## CI/CD Pipeline

The GitHub Actions workflow includes:
1. **Testing**: Lint, build, unit tests, E2E tests
2. **Build**: Docker image build and push to GHCR
3. **Smoke Tests**: Basic API endpoint validation
4. **Helm Packaging**: Chart packaging and artifact upload
5. **Deployment**: Automated staging and production deployment

## Security

- Non-root container user
- Read-only root filesystem support
- Security context with dropped capabilities
- API key management via Kubernetes secrets
- Input validation and sanitization

## Monitoring

- Built-in health check endpoint
- Prometheus metrics support (optional)
- Request logging with Morgan
- Error tracking and reporting