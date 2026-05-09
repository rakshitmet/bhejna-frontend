---
layout: docs
---

<script>
	import Callout from '$lib/components/docs/Callout.svelte';
	import CodeBlock from '$lib/components/docs/CodeBlock.svelte';
</script>

# Authentication

Bhejna uses API keys to authenticate requests. You can view and manage your API keys in the [Dashboard](/dashboard).

## API Key Authentication

All API requests must include your API key in the `X-API-Key` HTTP header. 

<CodeBlock 
  examples={[
    {
      lang: 'bash',
      label: 'HTTP Header',
      code: `X-API-Key: nxt_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
    }
  ]}
/>

### Key Prefixes

We use prefixes to help you identify the environment of your key:

| Prefix | Environment | Description |
| :--- | :--- | :--- |
| `nxt_live_` | **Production** | Used for real message delivery to production customers. |
| `nxt_test_` | **Sandbox** | (Coming Soon) Used for testing without incurring costs. |

## Internal Authentication

For internal operations or when communicating between Bhejna microservices, we use Bearer JWT authentication. This is generally reserved for system-level integrations.

<CodeBlock 
  examples={[
    {
      lang: 'bash',
      label: 'Internal Auth',
      code: `Authorization: Bearer <JWT_TOKEN>`
    }
  ]}
/>

## Security Best Practices

<Callout type="error" title="Never Expose Keys">
  API keys carry significant permissions. Never include them in client-side code (JavaScript in the browser), mobile apps, or public version control systems.
</Callout>

- **Server-Side Only**: Always make Bhejna API calls from your secure backend server.
- **Environment Variables**: Store your keys in environment variables (e.g., `.env` files) and never hardcode them.
- **Rotation**: If you suspect a key has been compromised, rotate it immediately from the dashboard.

## Handling Unauthorized Errors

If your request fails authentication, the API will return a `401 Unauthorized` status.

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  },
  "request_id": "req_123"
}
```
