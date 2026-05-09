import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { BHEJNA_GO_BACKEND_URL, BHEJNA_INTERNAL_SECRET } from '$env/static/private';
import crypto from 'crypto';

export const POST = async ({ request, locals }: RequestEvent): Promise<Response> => {
    // 1. Auth Guard: Use the pre-verified session from our hooks
    const { session, user } = await locals.safeGetSession();

    if (!session || !user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Parse Request: Extract waba_id and phone_number_id
        const { waba_id, phone_number_id } = await request.json();

        if (!waba_id || !phone_number_id) {
            return json({ message: 'Missing WABA ID or Phone Number ID' }, { status: 400 });
        }

        // 3. Generate Key: Secure key prefixed with nxt_live_
        const apiKey = 'nxt_live_' + crypto.randomUUID().replace(/-/g, '');

        // 4. Strict RLS Database Insert
        // CRITICAL: We MUST include user_id to satisfy the Supabase INSERT policy.
        const { data: newTenant, error: insertError } = await locals.supabase
            .from('tenants')
            .insert({
                user_id: user.id,
                waba_id,
                phone_number_id,
                api_key: apiKey
            })
            .select()
            .single();

        if (insertError || !newTenant) {
            console.error('Manual Provisioning Database Error:', JSON.stringify(insertError, null, 2));
            return json({ message: 'Failed to create tenant record' }, { status: 500 });
        }

        // 5. Go Backend Hydration (The 500 Fix)
        // CRITICAL MAPPING: Map api_key to access_token.
        // FALLBACK: Go panics on null strings. Fallback to empty strings.
        const goPayload = {
            id: newTenant.id,
            waba_id: newTenant.waba_id,
            phone_number_id: newTenant.phone_number_id,
            access_token: newTenant.api_key,
            webhook_url: newTenant.webhook_url || "",
            webhook_secret: newTenant.webhook_secret || ""
        };

        const syncUrl = new URL('/v1/internal/tenant', BHEJNA_GO_BACKEND_URL).toString();
        
        try {
            const syncResponse = await fetch(syncUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${BHEJNA_INTERNAL_SECRET}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(goPayload)
            });

            if (!syncResponse.ok) {
                const errorText = await syncResponse.text();
                console.error(`Go Backend Sync Failed: ${syncResponse.status} - ${errorText}`);
                return json({ message: 'Infrastructure synchronization failed' }, { status: 500 });
            }
        } catch (fetchError) {
            console.error('Data Plane Connection Error:', fetchError);
            return json({ message: 'Infrastructure connection failure' }, { status: 503 });
        }

        // 6. Return Success
        return json({ tenant: newTenant });

    } catch (err: any) {
        console.error('Provisioning internal error:', err);
        return json({ message: 'Internal Server Error' }, { status: 500 });
    }
};
