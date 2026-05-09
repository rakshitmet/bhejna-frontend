---
layout: docs
---

<script>
	import ApiEndpoint from '$lib/components/docs/ApiEndpoint.svelte';
	import Callout from '$lib/components/docs/Callout.svelte';
</script>

# Management API

The Management API allows you to programmatically manage your Bhejna tenants, monitor system health, and pause delivery if necessary.

<Callout type="warning" title="Restricted Access">
  These endpoints require **Internal Authentication** (JWT) and are typically not exposed to end-users. Use them only for infrastructure management.
</Callout>

## Sync Tenant

Use this endpoint to synchronize tenant configuration between the dashboard and the Go delivery engine.

<ApiEndpoint 
  method="POST" 
  path="/v1/internal/tenant" 
  summary="Provision or Update Tenant"
  description="Creates a new tenant record or updates an existing one in the Go engine's local cache."
  parameters={[
    {
      name: 'id',
      type: 'string',
      required: true,
      description: 'The internal UUID of the tenant.'
    },
    {
      name: 'waba_id',
      type: 'string',
      required: true,
      description: 'The Meta WhatsApp Business Account ID.'
    },
    {
      name: 'api_key',
      type: 'string',
      required: true,
      description: 'The API key used for message authentication.'
    }
  ]}
/>

## Pause Delivery

Manually pause message delivery for a specific tenant. This is useful for maintenance or when a tenant exceeds their quota.

<ApiEndpoint 
  method="PUT" 
  path="/v1/internal/tenants/{id}/pause" 
  summary="Pause Tenant"
  description="Prevents any new messages from being sent for this tenant until unpaused."
  parameters={[
    {
      name: 'id',
      type: 'string',
      required: true,
      description: 'The internal UUID of the tenant to pause.'
    }
  ]}
/>

## Status Codes

| Code | Status | Description |
| :--- | :--- | :--- |
| `200` | OK | Operation completed successfully. |
| `204` | No Content | Resource updated successfully, no body returned. |
| `401` | Unauthorized | Missing or invalid internal bearer token. |
| `404` | Not Found | The specified tenant ID does not exist. |
