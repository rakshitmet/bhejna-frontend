---
layout: docs
---

<script>
	import Callout from '$lib/components/docs/Callout.svelte';
	import CodeBlock from '$lib/components/docs/CodeBlock.svelte';
</script>

# Quickstart Guide

This guide will help you send your first message using Bhejna in less than 5 minutes.

## 1. Create an Account

Head over to the [Bhejna Dashboard](/dashboard) and sign up. Once your account is created, you will be assigned a unique organization ID and can begin provisioning your WhatsApp environment.

## 2. Provision your WABA

In the dashboard, navigate to **Settings** and provide your:
- **WhatsApp Business Account (WABA) ID**
- **Phone Number ID**

Bhejna will automatically generate a production-grade API key for you.

<Callout type="warning" title="API Key Security">
  Your production key starts with `nxt_live_`. Keep it secret and never expose it in client-side code.
</Callout>

## 3. Send your First Message

You can use the following `curl` command to test your integration. Replace `YOUR_API_KEY` with the key from your dashboard and `RECIPIENT_PHONE` with your test number.

<CodeBlock 
  examples={[
    {
      lang: 'curl',
      label: 'cURL',
      code: `curl -X POST https://api.bhejna.com/v1/messages \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipient": "RECIPIENT_PHONE",
    "message_type": "template",
    "payload": {
      "name": "hello_world",
      "language": { "code": "en_US" }
    }
  }'`
    }
  ]}
/>

## 4. Verify Delivery

Once you send the request, Bhejna will return a `202 Accepted` status with a `job_id`.

```json
{
  "success": true,
  "data": {
    "job_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "status": "queued"
  },
  "request_id": "req_550e8400"
}
```

You can track the status of this message in the **Delivery Logs** section of your dashboard or by [setting up webhooks](/docs/webhooks).

## 5. Next Steps

- [Learn about Authentication](/docs/authentication)
- [Explore the Full API Reference](/docs/api-reference)
- [Configure Webhooks](/docs/webhooks)
