---
layout: docs
---
<script>
  import { ApiEndpoint, Callout, CodeGroup, SchemaTable } from '$docs';
  import { DocsH1, DocsH2, DocsH3, DocsPre, DocsTable, DocsBlockquote, DocsUl, DocsOl } from '$docs/MDX';
</script>


# Bhejna Documentation

Welcome to the Bhejna Developer Documentation. Bhejna is a high-performance, developer-focused WhatsApp messaging infrastructure platform.

We provide a contract-first API designed to eliminate the complexity of the WhatsApp Cloud API, handling the heavy lifting of queueing, retries, and deliverability so you can focus on building your product.

<Callout type="info" title="Infrastructure Grade">
  Bhejna is built using a high-concurrency Go engine, ensuring low latency and high reliability even under extreme loads.
</Callout>

## Key Features

- **Asynchronous Architecture**: Every message is enqueued instantly, returning a job ID so your application isn't blocked by Meta's API response times.
- **Idempotency Support**: Prevent duplicate messages with built-in `Idempotency-Key` headers.
- **Secure Webhooks**: Real-time delivery status updates signed with HMAC SHA-256.
- **Detailed Analytics**: Track delivery rates, read status, and failures in your dashboard.

## Quick Example

To get started, you can send your first message using a simple `curl` command.

<ApiEndpoint operationId="sendMessage" minimal={true} />

## Next Steps

Explore our documentation to integrate Bhejna into your production environment.

- [Quickstart Guide](/docs/quickstart) — Get up and running in 5 minutes.
- [Authentication](/docs/authentication) — Learn how to secure your API requests.
- [API Reference](/docs/api-reference/send-message) — Explore detailed endpoint documentation.
- [Webhooks](/docs/webhooks) — Listen for real-time delivery events.
