
# Cross-Repository Dispatch Setup

This document explains how the moderation service notifies other dependent services when it's updated.

## Overview

When the moderation service is deployed to staging or production, it automatically sends repository dispatch events to dependent services to notify them of the update.

## Setup Requirements

### 1. Create a Personal Access Token (PAT)

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Create a new token with the following permissions:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
3. Add the token as a repository secret named `DISPATCH_TOKEN`

### 2. Configure Dependent Services

Each dependent service should have a workflow file (e.g., `.github/workflows/handle-moderation-dispatch.yml`) to handle the dispatch events.

## Event Structure

The dispatch event includes the following payload:

```json
{
  "service": "moderation-service",
  "version": "v1.2.3",
  "image": "ghcr.io/owner/moderation-service:sha256",
  "environment": "production|staging",
  "timestamp": "2025-08-01T12:00:00Z"
}
```

## Dependent Services

The moderation service currently dispatches to:
- `api-gateway`
- `user-service` 
- `content-service`

## Adding New Dependent Services

To add a new service to the dispatch list:

1. Add a new dispatch step in `.github/workflows/ci.yml`
2. Ensure the target repository has a workflow to handle `moderation-service-updated` events
3. Verify the `DISPATCH_TOKEN` has access to the target repository

## Testing

You can manually trigger a repository dispatch for testing:

```bash
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/dispatches \
  -d '{"event_type":"moderation-service-updated","client_payload":{"service":"moderation-service","version":"test","environment":"staging"}}'
```
