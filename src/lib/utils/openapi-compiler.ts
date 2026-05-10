import $RefParser from '@apidevtools/json-schema-ref-parser';
import fs from 'fs';
import path from 'path';
import { glob } from 'fs/promises';

/**
 * Compiles the OpenAPI specification into a static TypeScript registry.
 * This ensures zero runtime overhead and full type safety for the documentation.
 *
 * Generates two files:
 *   - openapi.server.ts  — full spec blob (server-only, used by rehype plugin)
 *   - openapi.ts         — extracted operations/webhooks/schemas (safe for .svelte imports)
 */
export async function compileOpenAPI() {
	const specPath = path.resolve('static/openapi/openapi.yaml');
	const serverOutPath = path.resolve('src/lib/generated/openapi.server.ts');
	const clientOutPath = path.resolve('src/lib/generated/openapi.ts');

	// Ensure the spec exists
	if (!fs.existsSync(specPath)) {
		console.warn('⚠️  openapi.yaml not found at static/openapi/openapi.yaml');
		return;
	}

	try {
		console.log('🔍 Validating and resolving OpenAPI spec...');

		// 1. Resolve all $ref pointers to create a flattened spec
		const api = await $RefParser.dereference(specPath);

		// 2. Extract and index operations by operationId for instant lookup
		const operations: Record<string, any> = {};
		const paths = (api as any).paths || {};
		const routeTracker = new Set<string>();

		for (const [pathStr, methods] of Object.entries(paths)) {
			for (const [method, op] of Object.entries(methods as any)) {
				const operation = op as any;
				const routeKey = `${method.toUpperCase()} ${pathStr}`;

				// Validation: Check for duplicate routes
				if (routeTracker.has(routeKey)) {
					throw new Error(`Duplicate route detected: ${routeKey}`);
				}
				routeTracker.add(routeKey);

				// Validation: Ensure operationId exists
				if (!operation.operationId) {
					throw new Error(
						`Missing operationId for ${routeKey}. Every endpoint MUST have a unique operationId.`
					);
				}

				// Validation: Check for duplicate operationIds
				if (operations[operation.operationId]) {
					throw new Error(`Duplicate operationId detected: ${operation.operationId}`);
				}

				// Warn for missing examples (recommended for documentation quality)
				const hasRequestExample =
					operation.requestBody?.content?.['application/json']?.example ||
					operation.requestBody?.content?.['application/json']?.examples;

				if (
					!hasRequestExample &&
					operation.requestBody &&
					operation.requestBody.content?.['application/json']
				) {
					console.warn(`⚠️  Missing example for request body in operation: ${operation.operationId}`);
				}

				operations[operation.operationId] = {
					path: pathStr,
					method: method.toUpperCase(),
					...operation
				};
			}
		}

		// 3. Extract webhooks if they exist
		const rawWebhooks = (api as any).webhooks || {};
		for (const [key, webhookOp] of Object.entries(rawWebhooks)) {
			const methods = webhookOp as any;
			for (const [method, op] of Object.entries(methods)) {
				const operation = op as any;
				if (operation.operationId) {
					// Add webhooks to the unified operations registry indexed by operationId
					// This ensures <ApiEndpoint operationId="handleDeliveryUpdate" /> resolves correctly
					operations[operation.operationId] = {
						path: 'WEBHOOK',
						method: method.toUpperCase(),
						isWebhook: true,
						webhookKey: key,
						...operation
					};
				}
			}
		}

		// 4. Extract schemas
		const schemas = (api as any).components?.schemas || {};

		// 5. Run build-time validation of markdown references
		await validateMarkdownReferences(operations, schemas);

		// 6. Generate the SERVER registry (full spec blob, rehype-compatible)
		const serverContent = `// THIS FILE IS GENERATED. DO NOT EDIT MANUALLY.
/* eslint-disable */
// @ts-nocheck

/**
 * The complete, resolved OpenAPI specification
 */
export const spec = ${JSON.stringify(api, null, 2)} as const;

/**
 * API Operations indexed by operationId (includes webhooks for uniform ApiEndpoint access)
 */
export const operations = ${JSON.stringify(operations, null, 2)} as const;

/**
 * API Webhooks indexed by webhook key (e.g. "delivery_update")
 */
export const webhooks = ${JSON.stringify(rawWebhooks, null, 2)} as const;

/**
 * Common Schema Definitions
 */
export const schemas = (spec.components?.schemas || {}) as const;

export type OperationId = keyof typeof operations;
export type WebhookKey = keyof typeof webhooks;
export type SchemaName = keyof typeof schemas;
`;

		// 7. Generate the CLIENT registry (no spec blob — safe to import from .svelte)
		//    All docs pages have csr=false + prerender=true so this file is server-only at runtime,
		//    but we keep it clean (no full spec) to avoid accidental client bundle inflation.
		const clientContent = `// THIS FILE IS GENERATED. DO NOT EDIT MANUALLY.
/* eslint-disable */
// @ts-nocheck

/**
 * API Operations indexed by operationId.
 * Webhooks are also included here (with isWebhook: true) for uniform ApiEndpoint resolution.
 * 
 * Import this file from .svelte components in docs pages (csr=false, prerender=true).
 */
export const operations = ${JSON.stringify(operations, null, 2)} as const;

/**
 * API Webhooks indexed by webhook key (e.g. "delivery_update")
 */
export const webhooks = ${JSON.stringify(rawWebhooks, null, 2)} as const;

/**
 * Common Schema Definitions (extracted from OpenAPI components.schemas)
 */
export const schemas = ${JSON.stringify(schemas, null, 2)} as const;

export type OperationId = keyof typeof operations;
export type WebhookKey = keyof typeof webhooks;
export type SchemaName = keyof typeof schemas;
`;

		// 8. Atomic write both files
		const outDir = path.dirname(serverOutPath);
		if (!fs.existsSync(outDir)) {
			fs.mkdirSync(outDir, { recursive: true });
		}

		fs.writeFileSync(serverOutPath, serverContent);
		fs.writeFileSync(clientOutPath, clientContent);

		const timestamp = new Date().toLocaleTimeString();
		const opCount = Object.keys(operations).length;
		const schemaCount = Object.keys(schemas).length;
		console.log(
			`[${timestamp}] ✅ OpenAPI registry compiled:\n` +
				`   operations: ${opCount} (${Object.keys(operations).join(', ')})\n` +
				`   schemas:    ${schemaCount} (${Object.keys(schemas).join(', ')})\n` +
				`   → src/lib/generated/openapi.server.ts\n` +
				`   → src/lib/generated/openapi.ts`
		);
	} catch (err) {
		console.error('❌ OpenAPI compilation failed:');
		console.error(err instanceof Error ? err.message : err);
		process.exit(1); // Fail build on invalid contract
	}
}

/**
 * Validates all markdown files in src/routes/docs/ against the compiled registry.
 * Throws if any operationId reference is missing from the registry.
 * This prevents broken docs from reaching production.
 */
async function validateMarkdownReferences(
	operations: Record<string, any>,
	schemas: Record<string, any>
) {
	const docsDir = path.resolve('src/routes/docs');
	if (!fs.existsSync(docsDir)) return;

	const validIds = new Set(Object.keys(operations));
	const validSchemas = new Set(Object.keys(schemas));
	const errors: string[] = [];

	// Find all .md files recursively
	const files = walkDir(docsDir, '.md');

	for (const filePath of files) {
		const content = fs.readFileSync(filePath, 'utf8');
		const relPath = path.relative(process.cwd(), filePath);

		// Match all operationId="..." references in ApiEndpoint tags
		const opIdMatches = content.matchAll(/<ApiEndpoint[^>]*operationId=["']([^"']+)["'][^>]*>/g);
		for (const match of opIdMatches) {
			const opId = match[1];
			if (!validIds.has(opId)) {
				errors.push(
					`[${relPath}] <ApiEndpoint operationId="${opId}"> — operationId not found in registry.\n` +
						`  Available: ${[...validIds].join(', ')}`
				);
			}
		}

		// Match all schemaName="..." references in SchemaTable tags
		const schemaMatches = content.matchAll(/<SchemaTable[^>]*schemaName=["']([^"']+)["'][^>]*>/g);
		for (const match of schemaMatches) {
			const schemaName = match[1];
			if (!validSchemas.has(schemaName)) {
				errors.push(
					`[${relPath}] <SchemaTable schemaName="${schemaName}"> — schema not found in registry.\n` +
						`  Available: ${[...validSchemas].join(', ')}`
				);
			}
		}
	}

	if (errors.length > 0) {
		const header =
			`\n❌ Docs registry validation failed — ${errors.length} broken reference(s):\n\n` +
			`These references MUST be fixed before deploying:\n`;
		throw new Error(header + errors.map((e) => `  • ${e}`).join('\n\n'));
	}

	if (files.length > 0) {
		console.log(
			`✅ Registry validation passed — ${files.length} markdown file(s) checked, all references valid.`
		);
	}
}

/** Recursively walk a directory and return all files with the given extension. */
function walkDir(dir: string, ext: string): string[] {
	const results: string[] = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...walkDir(fullPath, ext));
		} else if (entry.name.endsWith(ext)) {
			results.push(fullPath);
		}
	}
	return results;
}

// Allow running directly: npm run generate:api
if (import.meta.url === `file://${process.argv[1]}`) {
	compileOpenAPI();
}
