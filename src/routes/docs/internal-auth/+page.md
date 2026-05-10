---
layout: docs
---
<script>
  import { ApiEndpoint, Callout, CodeGroup, SchemaTable } from '$docs';
  import { DocsH1, DocsH2, DocsH3, DocsPre, DocsTable, DocsBlockquote, DocsUl, DocsOl } from '$docs/MDX';
</script>


# Internal Authentication

This section covers authentication for internal Bhejna microservices and management operations.

## Bearer JWT
Internal requests must include a Bearer JWT in the `Authorization` header.

## Service-to-Service
Services identify themselves using specific claims in the JWT, allowing for fine-grained role-based access control (RBAC) within the cluster.
