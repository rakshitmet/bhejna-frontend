---
layout: docs
---

<script>
	import Callout from '$lib/components/docs/Callout.svelte';
</script>

# Error Reference

Bhejna uses standard HTTP status codes and a consistent JSON error schema to help you debug integration issues.

## Error Schema

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable explanation",
    "retryable": false
  },
  "request_id": "req_123"
}
```

## Common Error Codes

| Code | HTTP | Description | Retryable? |
| :--- | :--- | :--- | :--- |
| `INVALID_PHONE` | 400 | The recipient phone number is not in E.164 format. | No |
| `UNAUTHORIZED` | 401 | Missing or invalid `X-API-Key`. | No |
| `FORBIDDEN` | 403 | You do not have permission to access this resource. | No |
| `RATE_LIMIT_EXCEEDED` | 429 | You have sent too many requests in a short period. | Yes |
| `META_API_ERROR` | 502 | The upstream Meta WhatsApp API returned an error. | Sometimes |
| `INTERNAL_ERROR` | 500 | An unexpected error occurred on our infrastructure. | Yes |

## Rate Limits

<Callout type="warning" title="Standard Limits">
  By default, Bhejna allows up to **100 requests per second (RPS)** per API key. If you need a higher limit, please contact support.
</Callout>

When you exceed the rate limit, the API will return a `429 Too Many Requests` status. We include standard `RateLimit-*` headers in the response:

- `RateLimit-Limit`: The maximum number of requests allowed per window.
- `RateLimit-Remaining`: The number of requests remaining in the current window.
- `RateLimit-Reset`: The time in seconds until the current window resets.

## Handling Retries

If an error is marked as `retryable: true`, we recommend implementing an exponential backoff strategy:

1. Wait 1 second before the first retry.
2. Double the wait time for each subsequent retry.
3. Stop after 3-5 attempts to prevent infinite loops.
