import type { Plugin } from 'vite';
import { compileOpenAPI } from './openapi-compiler';

/**
 * Vite plugin that compiles the OpenAPI spec into a static registry
 * at build time and on every change during development.
 */
export function openapiCompilerPlugin(): Plugin {
	return {
		name: 'openapi-compiler',
		async buildStart() {
			// Compile once at the start of the build
			await compileOpenAPI();
		},
		async handleHotUpdate({ file }) {
			// Re-compile if the specification changes
			if (file.endsWith('openapi.yaml') && file.includes('static/openapi')) {
				await compileOpenAPI();
			}
		}
	};
}
