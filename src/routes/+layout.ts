import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import { createBrowserClient, isBrowser, parse } from '@supabase/ssr';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
    /**
     * This tells SvelteKit to re-run this load function if 'supabase:auth' changes.
     * We use this in the onAuthStateChange listener to force cookie synchronization.
     */
    depends('supabase:auth');

    const supabase = createBrowserClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
            global: { fetch },
            cookies: {
                get(key) {
                    if (!isBrowser()) {
                        return JSON.stringify(data.session);
                    }
                    const cookie = parse(document.cookie);
                    return cookie[key];
                }
            }
        }
    );

    /**
     * Get the session from the newly configured client.
     * Note: getSession() is safe on the client, but for server use locals.safeGetSession().
     */
    const { data: { session } } = await supabase.auth.getSession();

    return { supabase, session };
};
