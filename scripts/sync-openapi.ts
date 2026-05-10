import fs from 'fs';
import path from 'path';
import { compileOpenAPI } from '../src/lib/utils/openapi-compiler.js';

/**
 * Synchronizes the OpenAPI specification from the backend repository
 * to the frontend documentation platform.
 */
async function syncOpenAPI() {
	const backendSpecPath = '/home/rakshitbhai/bhejna/docs/openapi.yaml';
	const frontendSpecDir = path.resolve('static/openapi');
	const frontendSpecPath = path.join(frontendSpecDir, 'openapi.yaml');

	console.log('🔄 Synchronizing OpenAPI contract from backend...');

	// 1. Ensure target directory exists
	if (!fs.existsSync(frontendSpecDir)) {
		fs.mkdirSync(frontendSpecDir, { recursive: true });
	}

	// 2. Validate backend spec exists
	if (!fs.existsSync(backendSpecPath)) {
		console.error(`❌ Backend OpenAPI spec not found at: ${backendSpecPath}`);
		process.exit(1);
	}

	try {
		// 3. Copy the spec
		fs.copyFileSync(backendSpecPath, frontendSpecPath);
		console.log(`✅ Synced: ${backendSpecPath} -> ${frontendSpecPath}`);

		// 4. Trigger regeneration
		console.log('🏗️  Regenerating endpoint registry...');
		await compileOpenAPI();
		
		console.log('✨ OpenAPI synchronization complete.');
	} catch (err) {
		console.error('❌ Sync failed:', err);
		process.exit(1);
	}
}

syncOpenAPI();
