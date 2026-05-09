import { fail } from '@sveltejs/kit';
import type { ServerLoadEvent, RequestEvent } from '@sveltejs/kit';
import { BHEJNA_GO_BACKEND_URL, BHEJNA_INTERNAL_SECRET } from '$env/static/private';
import { randomBytes } from 'crypto';

export const load = async ({ locals }: ServerLoadEvent) => {
    // Identify User: Retrieve from locals.safeGetSession() as requested
    const { session, user } = await locals.safeGetSession();

    if (!session || !user) {
        return { tenant: null };
    }

    // Lookup by User Ownership: Verify tenant existence and fetch data
    const { data: tenant } = await locals.supabase
        .from('tenants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    return { tenant };
};

export const actions = {
    updateWebhook: async ({ request, locals }: RequestEvent) => {
        // 1. Identify User: Retrieve the authenticated user.id from locals.safeGetSession()
        const { session, user } = await locals.safeGetSession();

        if (!session || !user) {
            return fail(401, { message: 'Unauthorized. Please sign in.' });
        }

        const formData = await request.formData();
        const webhook_url = formData.get('webhook_url')?.toString() || '';

        // Validation: Basic sanity check for HTTPS
        if (!webhook_url || !webhook_url.startsWith('https://')) {
            return fail(400, { message: 'A valid https:// Webhook URL is required' });
        }

        const supabase = locals.supabase;

        // 2. Lookup by User Ownership: Ensure we update the tenant belonging to this user
        const { data: existingTenant, error: fetchError } = await supabase
            .from('tenants')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (fetchError) {
            console.error("Supabase Tenant Lookup Failed:", JSON.stringify(fetchError, null, 2));
            return fail(500, { message: "Database Lookup Failed" });
        }

        if (!existingTenant) {
            return fail(404, { message: "Tenant record not found. Please provision your account first." });
        }

        // 3. Server-Side Secret Generation: Generate if null or empty
        let webhook_secret = existingTenant.webhook_secret;
        if (!webhook_secret || webhook_secret.trim() === "") {
            webhook_secret = randomBytes(16).toString('hex'); // 32-character secure hex
        }

        // 4. Strict Atomic Update: Perform write and return mutated row
        const { data: updatedTenant, error: updateError } = await supabase
            .from('tenants')
            .update({ webhook_url, webhook_secret })
            .eq('user_id', user.id)
            .select()
            .single();

        if (updateError) {
            // Log full JSON error object for debugging as requested
            console.error("CRITICAL: Database Save Failed", JSON.stringify(updateError, null, 2));
            return fail(500, { message: "Database Save Failed" });
        }

        // 5. Data Plane Sync (Go Proxy): Immediate hydration of edge cache
        try {
            const syncUrl = new URL('/v1/internal/tenant', BHEJNA_GO_BACKEND_URL).toString();
            const syncResponse = await fetch(syncUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${BHEJNA_INTERNAL_SECRET}`, // SYSTEM_TOKEN
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: updatedTenant.id,
                    waba_id: updatedTenant.waba_id,
                    phone_number_id: updatedTenant.phone_number_id,
                    access_token: updatedTenant.api_key, // mapped from api_key
                    webhook_url: updatedTenant.webhook_url,
                    webhook_secret: updatedTenant.webhook_secret
                })
            });

            if (!syncResponse.ok) {
                const errorText = await syncResponse.text();
                console.error(`Data Plane Sync Failed: ${syncResponse.status} - ${errorText}`);
                // In production, we treat backend sync as a fatal failure to ensure consistency
                return fail(503, { message: "Infrastructure Synchronization Failed" });
            }
        } catch (syncErr: any) {
            console.error('Data Plane Communication Error:', syncErr);
            return fail(503, { message: "Infrastructure Connection Failure" });
        }

        return { 
            success: true, 
            webhook_url: updatedTenant.webhook_url, 
            webhook_secret: updatedTenant.webhook_secret 
        };
    }
};
