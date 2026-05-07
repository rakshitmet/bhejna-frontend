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

		// 1. Generate cryptographically secure API Key
		const apiKey = 'nxt_live_' + crypto.randomBytes(32).toString('hex');

		// 2. Retrieve auth context to insert into Supabase securely
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

		// 3. Insert into the tenants table
		const { data, error } = await supabaseClient
			.from('tenants')
			.insert({
				waba_id,
				phone_number_id,
				api_key: apiKey
			})
			.select()
			.single();

		if (error) {
			console.error('Supabase Error:', error);
			return json({ message: 'Failed to provision tenant in database' }, { status: 500 });
		}

		// 4. Return success response to the frontend
		return json({
			success: true,
			tenant: data
		});

	} catch (error: any) {
		console.error('ESS Exchange Error:', error);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
};
