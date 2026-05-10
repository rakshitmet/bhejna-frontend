import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { openapiCompilerPlugin } from './src/lib/utils/openapi-vite';

export default defineConfig({
	plugins: [
		openapiCompilerPlugin(),
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({ project: './project.inlang', outdir: './src/lib/paraglide' })
	],
	build: {
		target: 'esnext',
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					if (id.includes('node_modules')) {
						if (id.includes('lucide')) return 'vendor-icons';
						return 'vendor';
					}
				}
			}
		}
	}
});
