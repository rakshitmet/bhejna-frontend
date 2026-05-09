import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getTextDirection } from '$lib/paraglide/runtime';

const handleSupabase: Handle = async ({ event, resolve }) => {
	/**
	 * Initialize Supabase server client.
	 * We use the createServerClient from @supabase/ssr for robust cookie handling.
	 */
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		cookies: {
			getAll() {
				return event.cookies.getAll();
			},
			setAll(cookiesToSet) {
				/**
				 * Note: SvelteKit's resolve() will handle setting these cookies on the response
				 * if we pass them through the event.cookies.set() calls.
				 */
				cookiesToSet.forEach(({ name, value, options }) =>
					event.cookies.set(name, value, { 
						...options, 
						path: '/',
						httpOnly: true,
						sameSite: 'lax'
					})
				);
			}
		}
	});

	/**
	 * Robust session retrieval via locals.safeGetSession().
	 * This is the production-ready way to verify the user on the server.
	 */
	event.locals.safeGetSession = async () => {
		const { data: { session } } = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		const { data: { user }, error } = await event.locals.supabase.auth.getUser();
		if (error) {
			// Token is invalid/expired
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
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
