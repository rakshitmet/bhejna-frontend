---
layout: docs
---
<script>
  import { ApiEndpoint, Callout, CodeGroup, SchemaTable } from '$docs';
  import { DocsH1, DocsH2, DocsH3, DocsPre, DocsTable, DocsBlockquote, DocsUl, DocsOl } from '$docs/MDX';
</script>


# Security

Bhejna is built with security as a core principle. We implement multiple layers of protection to ensure your data and communication are secure.

## Data in Transit
All API requests and webhook notifications are transmitted over HTTPS using TLS 1.3.

## API Key Security
Your API keys are stored using cryptographic hashes. We never store them in plain text.

## Webhook Signatures
Every webhook is signed with HMAC SHA-256. See the [Webhooks](/docs/webhooks) section for details on verification.

## ISO & Compliance
(Coming Soon) We are working towards SOC2 and ISO 27001 certification.
