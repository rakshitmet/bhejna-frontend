import { json, type RequestEvent } from '@sveltejs/kit';
import { bhejnaClient } from '$lib/api/client';

export const POST = async ({ request, locals }: RequestEvent): Promise<Response> => {
	try {
		const { recipient_phone } = await request.json();

		if (!recipient_phone) {
			return json({ message: 'Missing recipient_phone' }, { status: 400 });
		}

		// 1. Enterprise Auth Guard: Use the protected session fetcher from hooks.server.ts
		const { user } = await locals.safeGetSession();

		if (!user) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}

		// 2. Fetch the tenant record using the injected, secure supabase client
		const { data: tenant, error: tenantError } = await locals.supabase
			.from('tenants')
			.select('api_key, phone_number_id')
			.eq('user_id', user.id)
			.single();

		if (tenantError || !tenant) {
			return json({ message: 'Tenant configuration not found' }, { status: 404 });
		}

		// 3. Proxy request to the Go backend infrastructure
		const cleanPhone = recipient_phone.replace(/^\+|^00/, '');

		const data = await bhejnaClient.request('sendMessage', {
			apiKey: tenant.api_key,
			body: {
				recipient: cleanPhone,
				message_type: "template",
				payload: {
					template: {
						name: "hello_world",
						language: {
							code: "en_US"
						}
					}
				}
			}
		});

		// 4. Return the Go backend's response (Job ID) to the frontend
		return json(data);
	} catch (error: any) {
		console.error('Test message proxy error:', error);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
};
