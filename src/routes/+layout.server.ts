import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url, depends }) => {
    depends('supabase:auth');
	const { session, user } = await locals.safeGetSession();

	if (!session && url.pathname.startsWith('/dashboard')) {
		throw redirect(303, '/login');
	}

	if (session && url.pathname === '/login') {
		throw redirect(303, '/dashboard');
	}

	return {
		session,
		user
	};
};
