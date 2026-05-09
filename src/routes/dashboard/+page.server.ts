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
        if (!webhook_url) {
            return fail(400, { error: 'Webhook URL is required', webhook_url });
        }

        if (!webhook_url.startsWith('https://')) {
            return fail(400, { error: 'Webhook URL must use https:// for security', webhook_url });
        }

        try {
            new URL(webhook_url);
        } catch {
            return fail(400, { error: 'Invalid Webhook URL format', webhook_url });
        }

        const supabase = getSupabase(cookies);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return fail(401, { error: 'Unauthorized. Please sign in again.' });
        }

        // Fetch existing tenant to check for secret and get IDs
        const { data: existingTenant, error: fetchError } = await supabase
            .from('tenants')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (fetchError || !existingTenant) {
            return fail(404, { error: 'Tenant record not found. Please provision your account first.' });
        }

        // 2. Secret Generation: Only if not already present
        let webhook_secret = existingTenant.webhook_secret;
        if (!webhook_secret) {
            webhook_secret = randomBytes(16).toString('hex'); // 32-character random hex string
        }

        // 3. Database Update (Source of Truth)
        const { error: updateError } = await supabase
            .from('tenants')
            .update({ webhook_url, webhook_secret })
            .eq('user_id', user.id);

        if (updateError) {
            console.error('Failed to update webhook settings:', updateError);
            return fail(500, { error: 'Database update failed' });
        }

        // Fetch updated row to ensure we have the latest state for hydration
        const { data: updatedTenant } = await supabase
            .from('tenants')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!updatedTenant) {
            return fail(500, { error: 'Failed to verify updated tenant record' });
        }

        // 4. Edge Cache Hydration (Critical)
        try {
            const syncUrl = new URL('/v1/internal/tenant', BHEJNA_GO_BACKEND_URL).toString();
            const syncResponse = await fetch(syncUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${BHEJNA_INTERNAL_SECRET}`, // Using INTERNAL_SECRET as the SYSTEM_TOKEN
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
                console.error(`Edge Cache Sync Failed: ${syncResponse.status} - ${errorText}`);
                return fail(500, { error: 'Failed to synchronize settings with edge cache. Please try again.' });
            }
        } catch (syncErr: any) {
            console.error('Edge Cache Sync Error:', syncErr);
            return fail(500, { error: 'Infrastructure synchronization error' });
        }

        return { 
            success: true, 
            webhook_url: updatedTenant.webhook_url, 
            webhook_secret: updatedTenant.webhook_secret 
        };
    }
};

