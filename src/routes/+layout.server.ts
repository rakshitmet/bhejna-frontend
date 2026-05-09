import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, url, cookies }) => {
	const { session, user } = await safeGetSession();

	if (!session && url.pathname.startsWith('/dashboard')) {
		throw redirect(303, '/login');
	}

	if (session && url.pathname === '/login') {
		throw redirect(303, '/dashboard');
	}

	return {
		session,
		user,
		cookies: cookies.getAll()
	};
};
