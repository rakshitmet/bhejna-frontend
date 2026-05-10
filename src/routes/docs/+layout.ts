import type { LayoutLoad } from './$types';

export const csr = false;
export const prerender = true;

export const load: LayoutLoad = async () => {
	return {
		// Navigation data could be moved here if we want to make it truly dynamic
	};
};
