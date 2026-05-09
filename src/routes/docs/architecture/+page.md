---
layout: docs
---

<script>
	import Callout from '$lib/components/docs/Callout.svelte';
</script>

# System Architecture

Bhejna is engineered for high-throughput, low-latency WhatsApp messaging. Unlike traditional wrappers, Bhejna acts as a stateful proxy with an integrated persistent queue.

## The Request Lifecycle

1. **Ingress**: Your application sends a POST request to `/v1/messages`.
2. **Validation**: The Ingress Gateway validates the API key, recipient format, and payload structure.
3. **Queueing**: The message is instantly persisted into a high-performance Redis/Disk-backed queue. 
4. **Acknowledgment**: Bhejna returns a `202 Accepted` with a `job_id`. Your application is now free to continue.
5. **Processing**: The Delivery Engine picks up the job, handles idempotency checks, and forwards it to Meta's Cloud API.
6. **Delivery**: Upon success or failure from Meta, Bhejna updates the internal state and triggers your [Webhooks](/docs/webhooks).

## Core Components

### 1. The Gateway (Go)
The API gateway is written in Go to leverage its superior concurrency model. It handles TLS termination, authentication, and rate limiting at the edge.

### 2. The Delivery Engine
A distributed worker pool that manages the complexities of the WhatsApp API, including:
- **Rate Limit Management**: Automatically smoothing out traffic to avoid Meta's rate limits.
- **Retry Logic**: Intelligent retries for transient failures (e.g., 503 from Meta).
- **Media Optimization**: Caching and optimizing media uploads for image/document messages.

### 3. Edge Cache
A globally distributed cache (powered by Go internal maps and Redis) that stores tenant configurations for millisecond-latency authentication.

## Security Architecture

<Callout type="info" title="Zero-Trust Internal Network">
  All communication between Bhejna microservices is encrypted via mTLS and requires internal JWT authentication.
</Callout>

- **Data Encryption**: All message payloads are encrypted at rest.
- **Isolation**: Each tenant operates within a virtualized quota space, ensuring one customer's traffic spikes don't affect another.
- **Audit Logging**: Every API request and delivery attempt is logged for auditability and debugging.
