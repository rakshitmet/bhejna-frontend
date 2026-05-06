import { json, type RequestEvent } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const POST = async ({ request, cookies }: RequestEvent): Promise<Response> => {
	try {
		const { accessToken } = await request.json();

		if (!accessToken) {
			return json({ message: 'Missing access token' }, { status: 400 });
		}

		// 1. Fetch businesses, WABAs, and Phone Numbers via Meta Graph API
		const url = `https://graph.facebook.com/v25.0/me/businesses?fields=id,name,owned_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number}}&access_token=${accessToken}`;
		const graphRes = await fetch(url);
		const graphData = await graphRes.json();

		if (!graphRes.ok) {
			return json({ message: graphData.error?.message || 'Failed to fetch from Meta Graph API' }, { status: 400 });
		}

		// 2. Traverse the JSON to extract the newly created waba_id and phone_number_id
		let waba_id: string | null = null;
		let phone_number_id: string | null = null;

		const businesses = graphData.data;
		if (businesses && businesses.length > 0) {
			for (const business of businesses) {
				const wabas = business.owned_whatsapp_business_accounts?.data;
				if (wabas && wabas.length > 0) {
					// We take the first WABA available
					waba_id = wabas[0].id;
					const phoneNumbers = wabas[0].phone_numbers?.data;
					if (phoneNumbers && phoneNumbers.length > 0) {
						// We take the first phone number attached to this WABA
						phone_number_id = phoneNumbers[0].id;
						break; // Break since we found our targets
					}
				}
			}
		}

		if (!waba_id || !phone_number_id) {
			return json({ message: 'Could not find a valid WABA or Phone Number ID in the connected account' }, { status: 400 });
		}

		// 3. Generate cryptographically secure API Key
		const apiKey = 'nxt_live_' + crypto.randomBytes(32).toString('hex');

		// 4. Retrieve auth context to insert into Supabase securely
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

		// 5. Insert into the tenants table
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

		// 6. Return success response to the frontend
		return json({
			success: true,
			tenant: data
		});

	} catch (error: any) {
		console.error('ESS Exchange Error:', error);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
};
