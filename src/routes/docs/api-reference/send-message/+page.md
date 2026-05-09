---
layout: docs
---

<script>
	import ApiEndpoint from '$lib/components/docs/ApiEndpoint.svelte';
	import CodeBlock from '$lib/components/docs/CodeBlock.svelte';
	import Callout from '$lib/components/docs/Callout.svelte';
</script>

# Send Message

The Send Message API is the primary endpoint for dispatching WhatsApp messages. This endpoint is designed for high reliability and asynchronous processing.

## Endpoint

<ApiEndpoint 
  method="POST" 
  path="/v1/messages" 
  summary="Enqueue a WhatsApp message"
  description="Validates and enqueues a message for delivery. Returns a job ID immediately."
  parameters={[
    {
      name: 'recipient',
      type: 'string',
      required: true,
      description: 'The target phone number in E.164 format (e.g., +1234567890).'
    },
    {
      name: 'message_type',
      type: 'string',
      required: true,
      description: 'One of: text, template, image, document, audio, video, sticker, location, interactive.'
    },
    {
      name: 'payload',
      type: 'object',
      required: true,
      description: 'The message content object, compatible with Meta Cloud API schema.'
    }
  ]}
  responseBody={`{
  "success": true,
  "data": {
    "job_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "status": "queued"
  },
  "request_id": "req_123"
}`}
/>

## Headers

| Header | Required | Description |
| :--- | :--- | :--- |
| `X-API-Key` | Yes | Your production or sandbox API key. |
| `Idempotency-Key` | No | A unique string to prevent duplicate processing of the same request. |

## Idempotency

<Callout type="info" title="Reliability First">
  We strongly recommend using the `Idempotency-Key` header for all POST requests. If a request fails due to a network error, you can safely retry with the same key.
</Callout>

## Example: Template Message

<CodeBlock 
  examples={[
    {
      lang: 'curl',
      label: 'cURL',
      code: `curl -X POST https://api.bhejna.com/v1/messages \\
  -H "X-API-Key: nxt_live_..." \\
  -H "Idempotency-Key: \$(uuidgen)" \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipient": "+15551234567",
    "message_type": "template",
    "payload": {
      "name": "shipping_update",
      "language": { "code": "en_US" },
      "components": [
        {
          "type": "body",
          "parameters": [
            { "type": "text", "text": "Bhejna-123" }
          ]
        }
      ]
    }
  }'`
    }
  ]}
/>

## Example: Text Message

<CodeBlock 
  examples={[
    {
      lang: 'curl',
      label: 'cURL',
      code: `curl -X POST https://api.bhejna.com/v1/messages \\
  -H "X-API-Key: nxt_live_..." \\
  -d '{
    "recipient": "+15551234567",
    "message_type": "text",
    "payload": {
      "body": "Hello! How can we help you today?"
    }
  }'`
    }
  ]}
/>
