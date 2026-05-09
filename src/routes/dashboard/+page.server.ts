import { fail } from '@sveltejs/kit';
import type { ServerLoadEvent, RequestEvent } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import { BHEJNA_GO_BACKEND_URL, BHEJNA_INTERNAL_SECRET } from '$env/static/private';
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

    // Fetch full tenant details to ensure we have all fields for the UI and sync
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', user.id)
        .single();

    return { tenant };
};

export const actions = {
    updateWebhook: async ({ request, cookies }: RequestEvent) => {
        const formData = await request.formData();
        const webhook_url = formData.get('webhook_url')?.toString() || '';

        // 1. Validation: Extract and validate HTTPS URL
        if (!webhook_url || !webhook_url.startsWith('https://')) {
            return fail(400, { error: 'A valid https:// Webhook URL is required', webhook_url });
        }

        const supabase = getSupabase(cookies);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return fail(401, { error: 'Unauthorized' });
        }

        // Fetch existing tenant to check for secret
        const { data: existingTenant } = await supabase
            .from('tenants')
            .select('webhook_secret')
            .eq('user_id', user.id)
            .single();

        let webhook_secret = existingTenant?.webhook_secret;
        if (!webhook_secret) {
            webhook_secret = randomBytes(16).toString('hex'); // 32-character random hex string
        }

        // 2. Strict Update: Chain .select().single() to query
        const { data: updatedTenant, error: updateError } = await supabase
            .from('tenants')
            .update({ webhook_url, webhook_secret })
            .eq('user_id', user.id)
            .select()
            .single();

        // Error Handling: Halt and throw error if Supabase write fails
        if (updateError) {
            console.error("Supabase Update Failed:", updateError);
            return fail(500, { error: "Database update failed" });
        }

        // 3. Go Hydration: Construct payload using the strictly returned 'updatedTenant' row
        try {
            const syncUrl = new URL('/v1/internal/tenant', BHEJNA_GO_BACKEND_URL).toString();
            const syncResponse = await fetch(syncUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${BHEJNA_INTERNAL_SECRET}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: updatedTenant.id,
                    waba_id: updatedTenant.waba_id,
                    phone_number_id: updatedTenant.phone_number_id,
                    access_token: updatedTenant.api_key,
                    webhook_url: updatedTenant.webhook_url,
                    webhook_secret: updatedTenant.webhook_secret
                })
            });

            if (!syncResponse.ok) {
                const errorText = await syncResponse.text();
                console.error(`Edge Cache Hydration Failed: ${syncResponse.status} - ${errorText}`);
                return fail(500, { error: "Infrastructure synchronization failed. Please retry again after few minutes." });
            }
        } catch (syncErr: any) {
            console.error('Edge Cache Hydration Error:', syncErr);
            return fail(500, { error: "Failed to communicate with backend infrastructure. Please retry again after few minutes." });
        }

        return { 
            success: true, 
            webhook_url: updatedTenant.webhook_url, 
            webhook_secret: updatedTenant.webhook_secret 
        };
    }
};

