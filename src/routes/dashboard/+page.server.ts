import { fail, type ServerLoadEvent, type RequestEvent } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import { randomBytes } from 'crypto';

// Helper to get an authenticated Supabase client on the server
function getSupabase(cookies: any) {
    const token = cookies.get('sb-access-token');
    
    return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: false },
        global: {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
    });
}

export const load = async ({ cookies }: ServerLoadEvent) => {
    const supabase = getSupabase(cookies);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { tenant: null };
    }

    // Assuming the user is linked via user_id
    const { data: tenant } = await supabase
        .from('tenants')
        .select('webhook_url, webhook_secret')
        .eq('user_id', user.id)
        .single();

    return { tenant };
};

export const actions = {
    updateWebhook: async ({ request, cookies }: RequestEvent) => {
        const formData = await request.formData();
        const webhook_url = formData.get('webhook_url')?.toString() || '';

        if (!webhook_url) {
            return fail(400, { error: 'Webhook URL is required', webhook_url });
        }

        try {
            // Validate URL format
            new URL(webhook_url);
        } catch {
            return fail(400, { error: 'Invalid Webhook URL format', webhook_url });
        }

        const supabase = getSupabase(cookies);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return fail(401, { error: 'Unauthorized. Please sign in again.' });
        }

        // Generate a new cryptographically secure webhook secret
        // 24 bytes in base64url is 32 characters, prefix with whsec_
        const webhook_secret = 'whsec_' + randomBytes(24).toString('base64url');

        const { error } = await supabase
            .from('tenants')
            .update({ webhook_url, webhook_secret })
            .eq('user_id', user.id);

        if (error) {
            console.error('Failed to update webhook settings:', error);
            return fail(500, { error: 'Database update failed' });
        }

        return { success: true, webhook_url, webhook_secret };
    }
};
