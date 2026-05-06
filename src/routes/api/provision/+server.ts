import { json, type RequestEvent } from '@sveltejs/kit';
import { BHEJNA_GO_BACKEND_URL, BHEJNA_INTERNAL_SECRET } from '$env/static/private';

export const POST = async ({ request }: RequestEvent): Promise<Response> => {
	try {
		const { waba_id, phone_number_id } = await request.json();

		if (!waba_id || !phone_number_id) {
			return json({ message: 'Missing required fields' }, { status: 400 });
		}

		// Proxy request to the Go backend
		const response = await fetch(`${BHEJNA_GO_BACKEND_URL}/api/internal/tenants`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${BHEJNA_INTERNAL_SECRET}`
			},
			body: JSON.stringify({
				waba_id,
				phone_number_id
			})
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return json(
				{ message: errorData.error || 'Failed to provision with backend' },
				{ status: response.status }
			);
		}

		const data = await response.json();

		// Return the generated API Key back to the frontend
		// Assuming the Go backend returns { api_key: "...", id: "..." }
		return json({
			apiKey: data.api_key,
			tenantId: data.id
		});
	} catch (error: any) {
		console.error('Provisioning error:', error);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
};
