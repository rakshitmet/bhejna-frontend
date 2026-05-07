import { json, type RequestEvent } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const POST = async ({ request, cookies }: RequestEvent): Promise<Response> => {
	try {
		const { waba_id, phone_number_id, code } = await request.json();

		if (!waba_id || !phone_number_id) {
			return json({ message: 'Missing WABA ID or Phone Number ID' }, { status: 400 });
		}

		// 1. Retrieve auth context
		const token = cookies.get('sb-access-token');
		if (!token) {
			return json({ message: 'Unauthorized, no auth context found' }, { status: 401 });
		}

		// Create a Supabase client bound to the user's token
		const supabaseClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
			global: {
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		});

		// Get current user to ensure we have their ID
		const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
		if (userError || !user) {
			return json({ message: 'Failed to verify user session' }, { status: 401 });
		}

		// 2. Generate or retrieve existing API Key
		// We use upsert, but we might want to preserve the existing key if it exists
		// For simplicity in this flow, we'll generate a new one unless we fetch first
		const apiKey = 'nxt_live_' + crypto.randomBytes(32).toString('hex');

		// 3. Upsert into the tenants table
		// We include user_id to correctly link the tenant to the account
		const { data, error } = await supabaseClient
			.from('tenants')
			.upsert({
				user_id: user.id,
				waba_id,
				phone_number_id,
				api_key: apiKey,
				// Storing the code for potential future Meta token exchange
				// Note: Ensure this column exists in your schema or it will be ignored/error
				last_ess_code: code 
			}, {
				onConflict: 'user_id'
			})
			.select()
			.single();

		if (error) {
			console.error('Supabase Upsert Error:', error);
			// Fallback: if 'last_ess_code' doesn't exist, try without it
			if (error.message.includes('column "last_ess_code" does not exist')) {
				const { data: retryData, error: retryError } = await supabaseClient
					.from('tenants')
					.upsert({
						user_id: user.id,
						waba_id,
						phone_number_id,
						api_key: apiKey
					}, {
						onConflict: 'user_id'
					})
					.select()
					.single();
				
				if (retryError) {
					return json({ message: 'Failed to provision tenant in database' }, { status: 500 });
				}
				return json({ success: true, tenant: retryData });
			}
			return json({ message: 'Failed to provision tenant in database' }, { status: 500 });
		}

		return json({
			success: true,
			tenant: data
		});

	} catch (error: any) {
		console.error('ESS Exchange Error:', error);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
};
