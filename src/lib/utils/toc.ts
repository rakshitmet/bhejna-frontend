export interface TocItem {
	id: string;
	text: string;
	level: number;
}

/**
 * Extract Table of Contents from a document element
 */
export function extractToc(container: HTMLElement): TocItem[] {
	const headings = container.querySelectorAll('h1, h2, h3');
	return Array.from(headings).map((h) => ({
		id: h.id,
		text: (h as HTMLElement).innerText.replace('#', '').trim(),
		level: parseInt(h.tagName[1])
	}));
}
