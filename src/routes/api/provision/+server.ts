import { json, type RequestEvent } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const POST = async ({ request, cookies }: RequestEvent): Promise<Response> => {
	try {
		const { waba_id, phone_number_id } = await request.json();

		if (!waba_id || !phone_number_id) {
			return json({ message: 'Missing WABA ID or Phone Number ID' }, { status: 400 });
		}

		// 1. Retrieve auth context from cookies
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

		// 2. Generate a secure API Key
		const generatedKey = 'nxt_live_' + crypto.randomBytes(32).toString('hex');

		// 3. Upsert into the tenants table
		// Requirement: Use phone_number_id as conflict target
		const { error: upsertError } = await supabaseClient
			.from('tenants')
			.upsert({
				user_id: user.id,
				waba_id,
				phone_number_id,
				api_key: generatedKey
			}, {
				onConflict: 'phone_number_id'
			});

		if (upsertError) {
			console.error('Manual Provisioning Error:', upsertError);
			return json({ message: upsertError.message || 'Failed to provision tenant' }, { status: 500 });
		}

		// 4. Return success with the key
		return json({
			success: true,
			api_key: generatedKey
		});

	} catch (error: any) {
		console.error('Provisioning API Error:', error);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
};
