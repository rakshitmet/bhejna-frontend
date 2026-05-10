---
layout: docs
---
<script>
  import { ApiEndpoint, Callout, CodeGroup, SchemaTable } from '$docs';
  import { DocsH1, DocsH2, DocsH3, DocsPre, DocsTable, DocsBlockquote, DocsUl, DocsOl } from '$docs/MDX';
</script>


# Status Codes

Bhejna uses standard HTTP status codes to communicate the result of an API request.

## Success Codes

| Code | Status | Description |
| :--- | :--- | :--- |
| `200` | **OK** | The request was successful. Used for GET and some POST updates. |
| `202` | **Accepted** | The message was validated and enqueued for delivery. |
| `204` | **No Content** | The request was successful, but there is no body to return. |

## Client Error Codes (4xx)

| Code | Status | Description |
| :--- | :--- | :--- |
| `400` | **Bad Request** | Malformed JSON or missing required fields. |
| `401` | **Unauthorized** | Missing or invalid API key. |
| `403` | **Forbidden** | Your key does not have permission for this action. |
| `404` | **Not Found** | The specified resource (e.g., job ID) does not exist. |
| `409` | **Conflict** | Usually related to idempotency key reuse with a different body. |
| `429` | **Too Many Requests** | Rate limit exceeded. |

## Server Error Codes (5xx)

| Code | Status | Description |
| :--- | :--- | :--- |
| `500` | **Internal Error** | Something went wrong on Bhejna's servers. |
| `502` | **Bad Gateway** | The upstream Meta API returned an invalid response. |
| `503` | **Service Unavailable** | Bhejna is temporarily overloaded or down for maintenance. |
| `504` | **Gateway Timeout** | The upstream service took too long to respond. |
