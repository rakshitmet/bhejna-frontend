import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
    /**
     * This tells SvelteKit to re-run this load function if 'supabase:auth' changes.
     */
    depends('supabase:auth');

    const supabase = isBrowser()
        ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
              global: { fetch }
          })
        : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
              global: { fetch },
              cookies: {
                  getAll() {
                      return data.cookies;
                  }
              }
          });

    /**
     * We rely on the server-validated session and user from +layout.server.ts
     */
    return { 
        supabase, 
        session: data.session, 
        user: data.user 
    };
};
