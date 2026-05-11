import { fail, redirect } from '@sveltejs/kit';
import type { ServerLoadEvent, RequestEvent } from '@sveltejs/kit';
import { bhejnaClient } from '$lib/api/client';
import { randomBytes } from 'crypto';

export const load = async ({ locals }: ServerLoadEvent) => {
    // Identify User: Retrieve from locals.safeGetSession() as requested
    const { session, user } = await locals.safeGetSession();

    if (!session || !user) {
        return { tenant: null };
    }

    // Lookup by User Ownership: Verify tenant existence and fetch data
    const { data, error } = await locals.supabase
        .from('tenants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    console.log("Dashboard Load Data:", data, error);

    return { tenant: data || null };
};

export const actions = {
    signout: async ({ locals: { supabase } }) => {
        await supabase.auth.signOut();
        throw redirect(303, '/login');
    },
    updateWebhook: async ({ request, locals }: RequestEvent) => {
        // 1. Auth Guard: Retrieve the authenticated user from safeGetSession
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

        // 2. Strict Client: Use locals.supabase to ensure RLS context is passed via JWT
        const supabase = locals.supabase;

        // 3. Two-Step DB Op: 
        // First, fetch the tenant record by user_id to verify ownership
        const { data: existingTenant, error: fetchError } = await supabase
            .from('tenants')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (fetchError || !existingTenant) {
            console.error("Supabase Tenant Lookup Failed:", JSON.stringify(fetchError, null, 2));
            return fail(404, { message: "Tenant record not found. Please provision your account first." });
        }

        // Server-Side Secret Generation: Generate if missing
        let webhook_secret = existingTenant.webhook_secret;
        if (!webhook_secret || webhook_secret.trim() === "") {
            webhook_secret = randomBytes(16).toString('hex');
        }

        // Second, perform the update using the primary key ID for precision
        const { data: updatedTenant, error: updateError } = await supabase
            .from('tenants')
            .update({ webhook_url, webhook_secret })
            .eq('id', existingTenant.id)
            .select()
            .single();

        // 4. The Failsafe: Halt execution immediately if the update failed
        if (updateError || !updatedTenant) {
            console.error("CRITICAL: Database Save Failed", JSON.stringify(updateError, null, 2));
            return fail(500, { message: "Database Save Failed" });
        }

        // 5. Go Payload: Explicit mapping of api_key to access_token
        // Aggressively trim all string fields to prevent Go validation errors (e.g. leading spaces)
        // Spread updatedTenant to satisfy Go's requirement for a complete schema
        const goPayload = {
            id: updatedTenant.id,
            waba_id: updatedTenant.waba_id?.trim() || "",
            phone_number_id: updatedTenant.phone_number_id?.trim() || "",
            api_key: updatedTenant.api_key?.trim() || "", // CRITICAL: Use api_key, NOT access_token
            messaging_limit: Number(updatedTenant.messaging_limit) || 250, // Must be integer
            quality_rating: updatedTenant.quality_rating || "GREEN",
            is_paused: Boolean(updatedTenant.is_paused), // Must be boolean
            webhook_url: updatedTenant.webhook_url?.trim() || "",
            webhook_secret: updatedTenant.webhook_secret?.trim() || "",
            created_at: updatedTenant.created_at || new Date().toISOString()
        };

        try {
            await bhejnaClient.syncTenant(goPayload);
        } catch (syncErr: any) {
            console.error('Data Plane Communication Error:', syncErr);
            return { 
                success: true, 
                message: "Webhook saved. Infrastructure sync pending.",
                webhook_url: updatedTenant.webhook_url, 
                webhook_secret: updatedTenant.webhook_secret 
            };
        }

		return { 
			success: true, 
			message: "Webhook saved and synchronized.",
			webhook_url: updatedTenant.webhook_url, 
			webhook_secret: updatedTenant.webhook_secret 
		};
	},
	rotateSecret: async ({ locals }: RequestEvent) => {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) return fail(401, { message: 'Unauthorized' });

		const newSecret = randomBytes(16).toString('hex');
		const { data: updatedTenant, error: updateError } = await locals.supabase
			.from('tenants')
			.update({ webhook_secret: newSecret })
			.eq('user_id', user.id)
			.select()
			.single();

		if (updateError || !updatedTenant) {
			return fail(500, { message: "Failed to rotate secret" });
		}

		// Go Sync
		const goPayload = {
			id: updatedTenant.id,
			waba_id: updatedTenant.waba_id?.trim() || "",
			phone_number_id: updatedTenant.phone_number_id?.trim() || "",
			api_key: updatedTenant.api_key?.trim() || "",
			messaging_limit: Number(updatedTenant.messaging_limit) || 250,
			quality_rating: updatedTenant.quality_rating || "GREEN",
			is_paused: Boolean(updatedTenant.is_paused),
			webhook_url: updatedTenant.webhook_url?.trim() || "",
			webhook_secret: updatedTenant.webhook_secret?.trim() || "",
			created_at: updatedTenant.created_at || new Date().toISOString()
		};

		try {
			await bhejnaClient.syncTenant(goPayload);
		} catch (err) {
			console.error("Go Sync Error during rotation:", err);
		}

		return { success: true, message: "Webhook secret rotated successfully." };
	}
};
