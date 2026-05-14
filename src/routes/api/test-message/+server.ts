import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
// Import the newly generated Orval function!
import { sendMessage } from '$lib/api/generated/client'; 
import { SendMessageBody } from '$lib/api/generated/zod';

export const POST = async ({ request, locals }: RequestEvent): Promise<Response> => {
    try {
        const { recipient_phone } = await request.json();

        if (!recipient_phone) {
            return json({ message: 'Missing recipient_phone' }, { status: 400 });
        }

        // 1. Enterprise Auth Guard
        const { user } = await locals.safeGetSession();
        if (!user) {
            return json({ message: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch the tenant record
        const { data: tenant, error: tenantError } = await locals.supabase
            .from('tenants')
            .select('api_key, phone_number_id')
            .eq('user_id', user.id)
            .single();

        if (tenantError || !tenant) {
            return json({ message: 'Tenant configuration not found' }, { status: 404 });
        }

        // 3. Proxy request using the Orval-generated client
        const cleanPhone = recipient_phone.replace(/^\+|^00/, '');

        // Orval exposes standard fetch options as the second argument, 
        // perfect for injecting our dynamic Bearer token!
        const payload = {
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
        };

        const parsedPayload = SendMessageBody.parse(payload);

        const response = await sendMessage(
            parsedPayload as any, // Cast to any to align with Orval generated type if needed, but it should be fully compatible
            {
                headers: {
                    Authorization: `Bearer ${tenant.api_key}`
                }
            }
        );

        return json(response);
    } catch (error: any) {
        console.error('Test message proxy error:', error);
        return json({ message: 'Internal Server Error' }, { status: 500 });
    }
};
