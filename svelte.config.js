import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import path from 'path';
import { highlight } from './src/lib/utils/docs.ts';
import visit from 'unist-util-visit';

function rehypeComponentMapping() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			const mapping = {
				h1: 'DocsH1',
				h2: 'DocsH2',
				h3: 'DocsH3',
				pre: 'DocsPre',
				table: 'DocsTable',
				blockquote: 'DocsBlockquote',
				ul: 'DocsUl',
				ol: 'DocsOl'
			};
			if (mapping[node.tagName]) {
				node.tagName = mapping[node.tagName];
			}
		});
	};
}

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md', '.svx'],
	highlight: {
		highlighter: async (code, lang) => {
			const html = await highlight(code, lang);
			return `{@html \`${html}\` }`;
		}
	},
	remarkPlugins: [],
	rehypePlugins: [
		rehypeSlug,
		[rehypeAutolinkHeadings, { behavior: 'wrap' }],
		rehypeComponentMapping
	],
	layout: {
		docs: path.resolve('./src/lib/components/docs/DocsLayout.svelte')
	},
	smartypants: true
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md', '.svx'],
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
	compilerOptions: {
		runes: ({ filename }) => {
			if (filename.includes('node_modules')) return undefined;
			if (filename.endsWith('.md') || filename.endsWith('.svx')) return false;
			return true;
		}
	},
	kit: {
		adapter: adapter(),
		alias: {
			$docs: './src/lib/components/docs'
		}
	}
};

export default config;
