import { json, type RequestEvent } from '@sveltejs/kit';
import crypto from 'crypto';

export const POST = async ({ request, locals }: RequestEvent): Promise<Response> => {
	try {
		const { waba_id, phone_number_id, code } = await request.json();

		if (!waba_id || !phone_number_id) {
			return json({ message: 'Missing WABA ID or Phone Number ID' }, { status: 400 });
		}

		// 1. Enterprise Auth Guard
		const { user } = await locals.safeGetSession();
		if (!user) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}

		// 2. Generate or retrieve existing API Key
		const apiKey = 'nxt_live_' + crypto.randomBytes(32).toString('hex');

		// 3. Upsert into the tenants table
		const { data, error } = await locals.supabase
			.from('tenants')
			.upsert({
				user_id: user.id,
				waba_id,
				phone_number_id,
				api_key: apiKey,
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
				const { data: retryData, error: retryError } = await locals.supabase
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
