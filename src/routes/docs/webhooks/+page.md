---
layout: docs
---

<script>
	import Callout from '$lib/components/docs/Callout.svelte';
	import CodeBlock from '$lib/components/docs/CodeBlock.svelte';
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

## Security

Every webhook request from Bhejna includes an `X-Bhejna-Signature` header. You **must** verify this signature to ensure the request originated from Bhejna.

### Verifying Signatures

The signature is a Hex-encoded HMAC SHA-256 hash of the raw request body, using your **Webhook Secret** as the key.

<CodeBlock 
  examples={[
    {
      lang: 'javascript',
      label: 'Node.js',
      code: `const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return digest === signature;
}`
    },
    {
      lang: 'go',
      label: 'Go',
      code: `func VerifySignature(body []byte, signature string, secret string) bool {
    h := hmac.New(sha256.New, []byte(secret))
    h.Write(body)
    expected := hex.EncodeToString(h.Sum(nil))
    return expected == signature
}`
    }
  ]}
/>

## Payload Example

```json
{
  "event": "message.delivered",
  "job_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "recipient": "+15551234567",
  "timestamp": "2026-05-09T16:50:00Z",
  "data": {
    "messaging_product": "whatsapp",
    "display_phone_number": "15550001111"
  }
}
```

<Callout type="info" title="Reliable Delivery">
  If your server returns anything other than a `2xx` status code, Bhejna will retry the webhook delivery with exponential backoff for up to 24 hours.
</Callout>
