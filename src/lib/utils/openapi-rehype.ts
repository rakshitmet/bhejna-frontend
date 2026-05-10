import visit from 'unist-util-visit';
import { operations, webhooks, schemas } from '../generated/openapi.server.ts';
import { highlight } from './docs.server.ts';

/**
 * Rehype plugin that injects OpenAPI operation data into ApiEndpoint components
 * at build-time. This ensures the client bundle doesn't need to import the
 * entire OpenAPI registry.
 */
export function rehypeOpenApi() {
	return async (tree: any) => {
		const promises: Promise<void>[] = [];

		visit(tree, 'element', (node: any) => {
			if (node.tagName === 'ApiEndpoint') {
				const operationId = node.properties?.operationId;
				
				if (operationId) {
					const opData = { ...((operations as any)[operationId] || (webhooks as any)[operationId]) };
					
					if (opData && Object.keys(opData).length > 0) {
						// Pre-highlight code samples
						const processSamples = async () => {
							if (opData['x-codeSamples']) {
								for (const sample of opData['x-codeSamples']) {
									sample.highlightedSource = await highlight(sample.source, sample.lang);
								}
							}
							
							// Also highlight default examples if they exist
							const requestExample = opData.requestBody?.content?.['application/json']?.example;
							if (requestExample) {
								opData.highlightedRequestExample = await highlight(JSON.stringify(requestExample, null, 2), 'json');
							}
							
							const successResponse = opData.responses?.['200'] || opData.responses?.['201'] || opData.responses?.['202'];
							const responseExample = successResponse?.content?.['application/json']?.example;
							if (responseExample) {
								opData.highlightedResponseExample = await highlight(JSON.stringify(responseExample, null, 2), 'json');
							}

							node.properties.opData = JSON.stringify(opData);
						};
						
						promises.push(processSamples());
					} else {
						console.warn(`⚠️  rehypeOpenApi: OperationId "${operationId}" not found in registry.`);
					}
				}
			}

			if (node.tagName === 'SchemaTable') {
				const schemaName = node.properties?.schemaName;
				// If MDX uses <SchemaTable schema={schemas.ErrorResponse} />, 
				// it might come in as a string in node.properties.schema
				const schemaProp = node.properties?.schema;

				let targetSchema = schemaName;
				if (!targetSchema && typeof schemaProp === 'string') {
					// Extract "ErrorResponse" from "{schemas.ErrorResponse}"
					const match = schemaProp.match(/schemas\.(\w+)/);
					if (match) targetSchema = match[1];
				}

				if (targetSchema) {
					const schemaData = (schemas as any)[targetSchema];
					if (schemaData) {
						node.properties.schemaData = JSON.stringify(schemaData);
					} else {
						console.warn(`⚠️  rehypeOpenApi: Schema "${targetSchema}" not found in registry.`);
					}
				}
			}
		});

		await Promise.all(promises);
	};
}
