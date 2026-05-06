import { json, type RequestEvent } from '@sveltejs/kit';
import { BHEJNA_GO_BACKEND_URL } from '$env/static/private';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';

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

export const POST = async ({ request, cookies }: RequestEvent): Promise<Response> => {
	try {
		const { recipient_phone, message_text } = await request.json();

		if (!recipient_phone || !message_text) {
			return json({ message: 'Missing recipient_phone or message_text' }, { status: 400 });
		}

		const supabase = getSupabase(cookies);
		const { data: { user }, error: userError } = await supabase.auth.getUser();

		if (userError || !user) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}

		// Fetch the tenant record to get the API Key and phone_number_id
		const { data: tenant, error: tenantError } = await supabase
			.from('tenants')
			.select('api_key, phone_number_id')
			.eq('user_id', user.id)
			.single();

		if (tenantError || !tenant) {
			return json({ message: 'Tenant configuration not found' }, { status: 404 });
		}

		// Proxy request to the Go backend infrastructure
		const response = await fetch(`${BHEJNA_GO_BACKEND_URL}/v1/messages`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${tenant.api_key}`
			},
			body: JSON.stringify({
				type: "text",
				to: recipient_phone,
				body: message_text
			})
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return json(
				{ message: errorData.error || 'Failed to send message via Go Backend' },
				{ status: response.status }
			);
		}

		const data = await response.json();
		
		// Return the Go backend's response (Job ID) to the frontend
		return json(data);
	} catch (error: any) {
		console.error('Test message proxy error:', error);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
};
