import $RefParser from '@apidevtools/json-schema-ref-parser';
import fs from 'fs';
import path from 'path';

/**
 * Compiles the OpenAPI specification into a static TypeScript registry.
 * This ensures zero runtime overhead and full type safety for the documentation.
 */
export async function compileOpenAPI() {
	const specPath = path.resolve('static/openapi/openapi.yaml');
	const outPath = path.resolve('src/lib/generated/openapi.ts');

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
					throw new Error(`Missing operationId for ${routeKey}. Every endpoint MUST have a unique operationId.`);
				}

				// Validation: Check for duplicate operationIds
				if (operations[operation.operationId]) {
					throw new Error(`Duplicate operationId detected: ${operation.operationId}`);
				}

				// Validation: Warning for missing examples (optional but recommended in requirements)
				const hasRequestExample = operation.requestBody?.content?.['application/json']?.example || operation.requestBody?.content?.['application/json']?.examples;
				const hasResponseExample = operation.responses?.['200']?.content?.['application/json']?.example || operation.responses?.['200']?.content?.['application/json']?.examples;
				
				if (!hasRequestExample && operation.requestBody && operation.requestBody.content?.['application/json']) {
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
		const webhooks = (api as any).webhooks || {};
		for (const [key, webhookOp] of Object.entries(webhooks)) {
			const methods = webhookOp as any;
			for (const [method, op] of Object.entries(methods)) {
				const operation = op as any;
				if (operation.operationId) {
					// Add to operations registry for uniform access via ApiEndpoint
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

		// 4. Generate the TypeScript registry
		const tsContent = `// THIS FILE IS GENERATED. DO NOT EDIT MANUALLY.
/* eslint-disable */
// @ts-nocheck

/**
 * The complete, resolved OpenAPI specification
 */
export const spec = ${JSON.stringify(api, null, 2)} as const;

/**
 * API Operations indexed by operationId
 */
export const operations = ${JSON.stringify(operations, null, 2)} as const;

/**
 * API Webhooks indexed by key
 */
export const webhooks = ${JSON.stringify(webhooks, null, 2)} as const;

/**
 * Common Schema Definitions
 */
export const schemas = (spec.components?.schemas || {}) as const;

export type OperationId = keyof typeof operations;
export type WebhookKey = keyof typeof webhooks;
export type SchemaName = keyof typeof schemas;
`;

		// 5. Atomic write
		const outDir = path.dirname(outPath);
		if (!fs.existsSync(outDir)) {
			fs.mkdirSync(outDir, { recursive: true });
		}
		fs.writeFileSync(outPath, tsContent);
		
		const timestamp = new Date().toLocaleTimeString();
		console.log(`[${timestamp}] ✅ OpenAPI registry updated: src/lib/generated/openapi.ts`);
	} catch (err) {
		console.error('❌ OpenAPI compilation failed:');
		console.error(err instanceof Error ? err.message : err);
		process.exit(1); // Fail build on invalid contract
	}
}

// Allow running directly if needed
if (import.meta.url === `file://${process.argv[1]}`) {
	compileOpenAPI();
}

