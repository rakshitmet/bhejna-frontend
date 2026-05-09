---
layout: docs
---

# Rate Limits

To ensure system stability and fair usage, Bhejna enforces rate limits on all API requests.

## Standard Limits
- **POST /v1/messages**: 100 requests per second.
- **GET /v1/jobs**: 50 requests per second.

## Limit Headers
Every response includes headers detailing your current rate limit status:
- `RateLimit-Limit`
- `RateLimit-Remaining`
- `RateLimit-Reset`

## Requesting Increases
If your application requires higher throughput, please contact our infrastructure team via the dashboard.
