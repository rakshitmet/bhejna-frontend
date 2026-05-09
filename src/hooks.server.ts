import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getTextDirection } from '$lib/paraglide/runtime';

const handleSupabase: Handle = async ({ event, resolve }) => {
	/**
	 * Initialize Supabase client in locals.
	 * We use the 'sb-access-token' cookie set by the frontend to maintain session.
	 */
	const token = event.cookies.get('sb-access-token');

	event.locals.supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: false
		},
		global: {
			headers: token ? { Authorization: `Bearer ${token}` } : {}
		}
	});

	/**
	 * Robust session retrieval.
	 */
	event.locals.safeGetSession = async () => {
		const { data: { session }, error: sessionError } = await event.locals.supabase.auth.getSession();
		if (sessionError) {
			return { session: null, user: null };
		}

		const { data: { user }, error: userError } = await event.locals.supabase.auth.getUser();
		if (userError) {
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle: Handle = sequence(handleSupabase, handleParaglide);
