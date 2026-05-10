---
layout: docs
---
<script>
  import { ApiEndpoint, Callout, CodeGroup, SchemaTable } from '$docs';
  import { DocsH1, DocsH2, DocsH3, DocsPre, DocsTable, DocsBlockquote, DocsUl, DocsOl } from '$docs/MDX';
</script>


# Management API

The Management API allows you to programmatically manage your Bhejna tenants, monitor system health, and pause delivery if necessary.

<Callout type="warning" title="Restricted Access">
  These endpoints require **Internal Authentication** (JWT) and are typically not exposed to end-users. Use them only for infrastructure management.
</Callout>

## Sync Tenant

Use this endpoint to synchronize tenant configuration between the dashboard and the Go delivery engine.

<ApiEndpoint operationId="syncTenant" />

## Pause Delivery

Manually pause message delivery for a specific tenant. This is useful for maintenance or when a tenant exceeds their quota.

<ApiEndpoint operationId="pauseTenant" />

## Status Codes

| Code | Status | Description |
| :--- | :--- | :--- |
| `200` | OK | Operation completed successfully. |
| `204` | No Content | Resource updated successfully, no body returned. |
| `401` | Unauthorized | Missing or invalid internal bearer token. |
| `404` | Not Found | The specified tenant ID does not exist. |
