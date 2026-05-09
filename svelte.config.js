import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import { createHighlighter } from 'shiki';

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md', '.svx'],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const highlighter = await createHighlighter({
				themes: ['nord'],
				langs: ['javascript', 'typescript', 'go', 'python', 'bash', 'json', 'yaml', 'curl']
			});
			await highlighter.loadLanguages(['javascript', 'typescript', 'go', 'python', 'bash', 'json', 'yaml', 'curl']);
			const html = highlighter.codeToHtml(code, { lang, theme: 'nord' });
			return `{@html \`${html}\` }`;
		}
	},
	rehypePlugins: [
		rehypeSlug,
		[rehypeAutolinkHeadings, { behavior: 'wrap' }]
	],
	layout: {
		docs: './src/lib/components/docs/DocsLayout.svelte'
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md', '.svx'],
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter()
	}
};

export default config;
