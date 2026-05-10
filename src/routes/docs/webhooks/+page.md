---
layout: docs
---
<script>
  import { ApiEndpoint, Callout, CodeGroup, SchemaTable } from '$docs';
  import { DocsH1, DocsH2, DocsH3, DocsPre, DocsTable, DocsBlockquote, DocsUl, DocsOl } from '$docs/MDX';
</script>


# Webhooks

Webhooks allow you to receive real-time notifications when something happens in your Bhejna account. Instead of polling the API, Bhejna will push data to your server as events occur.

## Event Types

| Event | Description |
| :--- | :--- |
| `message.sent` | The message has been successfully handed over to Meta. |
| `message.delivered` | The recipient's device has confirmed delivery. |
| `message.read` | The recipient has opened the message. |
| `message.failed` | Delivery failed (e.g., invalid number, blocked). |

<ApiEndpoint operationId="handleDeliveryUpdate" />

## Security

Every webhook request from Bhejna includes an `X-Bhejna-Signature` header. You **must** verify this signature to ensure the request originated from Bhejna.

<Callout type="info" title="Reliable Delivery">
  If your server returns anything other than a `2xx` status code, Bhejna will retry the webhook delivery with exponential backoff for up to 24 hours.
</Callout>
