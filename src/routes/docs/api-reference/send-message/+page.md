---
layout: docs
---
<script>
  import { ApiEndpoint, Callout, CodeGroup, SchemaTable } from '$docs';
  import { DocsH1, DocsH2, DocsH3, DocsPre, DocsTable, DocsBlockquote, DocsUl, DocsOl } from '$docs/MDX';
</script>


# Send Message

The Send Message API is the primary endpoint for dispatching WhatsApp messages. This endpoint is designed for high reliability and asynchronous processing.

<ApiEndpoint operationId="sendMessage" />

## Idempotency

<Callout type="info" title="Reliability First">
  We strongly recommend using the `Idempotency-Key` header for all POST requests. If a request fails due to a network error, you can safely retry with the same key.
</Callout>

## Advanced Payloads

When sending complex message types like `interactive` or `template`, the `payload` object must strictly follow the Meta Cloud API schema. Bhejna performs deep validation on these payloads before enqueuing to ensure a high delivery success rate and minimize upstream Meta errors.
