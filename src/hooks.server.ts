import { createSupabaseServerClient } from '$lib/supabase/server';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getTextDirection } from '$lib/paraglide/runtime';

const handleSupabase: Handle = async ({ event, resolve }) => {
    // 1. Inject the secure, per-request server client
    event.locals.supabase = createSupabaseServerClient(event);

    // 2. Define the safe session fetcher
    event.locals.safeGetSession = async () => {
        const { data: { session } } = await event.locals.supabase.auth.getSession();
        if (!session) {
            return { session: null, user: null };
        }

        // Validate the token cryptographically
        const { data: { user }, error } = await event.locals.supabase.auth.getUser();
        
        if (error) {
            // Expected behavior if token is expired or malformed.
            // We gracefully swallow the error to keep the terminal clean,
            // and we tell Supabase to destroy the dead session cookies.
            
            // This forces the SSR client to clear the bad cookies in the user's browser
            await event.locals.supabase.auth.signOut(); 
            
            return { session: null, user: null };
        }

        return { session, user };
    };

    // 3. Populate locals for downstream usage
    const { session, user } = await event.locals.safeGetSession();
    event.locals.session = session;
    event.locals.user = user;

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'x-supabase-api-version';
        },
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
