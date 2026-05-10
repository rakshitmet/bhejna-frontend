import { createHighlighter } from 'shiki';

/**
 * Centralized language aliases for Shiki
 */
export const langMap: Record<string, string> = {
	curl: 'bash',
	sh: 'bash',
	shell: 'bash',
	js: 'javascript',
	ts: 'typescript',
	py: 'python',
	yml: 'yaml'
};

/**
 * Supported languages for the highlighter
 */
export const supportedLangs = [
	'javascript',
	'typescript',
	'go',
	'python',
	'bash',
	'json',
	'yaml',
	'html',
	'css'
];

let highlighter: any;

/**
 * Get or create the Shiki highlighter instance
 */
export async function getHighlighter() {
	if (!highlighter) {
		highlighter = await createHighlighter({
			themes: ['nord'],
			langs: supportedLangs
		});
	}
	return highlighter;
}

/**
 * Highlight code using centralized configuration
 */
export async function highlight(code: string, lang: string = 'text') {
	const h = await getHighlighter();
	const shikiLang = langMap[lang.toLowerCase()] || lang.toLowerCase();
	
	try {
		return h.codeToHtml(code, {
			lang: supportedLangs.includes(shikiLang) ? shikiLang : 'text',
			theme: 'nord'
		});
	} catch (e) {
		console.error(`Highlighting failed for lang: ${lang}`, e);
		return h.codeToHtml(code, { lang: 'text', theme: 'nord' });
	}
}
