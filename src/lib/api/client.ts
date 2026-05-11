import { BHEJNA_GO_BACKEND_URL, BHEJNA_INTERNAL_SECRET } from '$env/static/private';
import { operations, type OperationId } from '$lib/generated/openapi';

/**
 * Bhejna API Client
 * Provides a typed interface to communicate with the Bhejna Go backend.
 */
class BhejnaClient {
	private baseUrl: string;
	private internalSecret: string;

	constructor() {
		this.baseUrl = BHEJNA_GO_BACKEND_URL.replace(/\/$/, '');
		this.internalSecret = BHEJNA_INTERNAL_SECRET;
	}

	/**
	 * Makes a typed request to the backend based on operationId.
	 */
	async request<T = any>(
		operationId: OperationId,
		params: {
			path?: Record<string, string | number>;
			query?: Record<string, string | number | boolean>;
			body?: any;
			headers?: Record<string, string>;
			apiKey?: string;
		} = {}
	): Promise<T> {
		const op = operations[operationId];
		if (!op) {
			throw new Error(`Unknown operationId: ${operationId}`);
		}

		let urlPath = op.path;

		// 1. Path parameters
		if (params.path) {
			for (const [key, value] of Object.entries(params.path)) {
				urlPath = urlPath.replace(`{${key}}`, String(value));
			}
		}

		const url = new URL(urlPath, this.baseUrl);

		// 2. Query parameters
		if (params.query) {
			for (const [key, value] of Object.entries(params.query)) {
				if (value !== undefined) {
					url.searchParams.append(key, String(value));
				}
			}
		}

		// 3. Headers
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...params.headers
		};

		// 4. Authentication
		if (op.tags?.includes('Internal') || op.security?.some((s: any) => s.InternalAuth)) {
			headers['Authorization'] = `Bearer ${this.internalSecret}`;
		} else if (params.apiKey) {
			// Align with OpenAPI spec (X-API-Key) but maintain legacy compatibility (Authorization)
			headers['X-API-Key'] = params.apiKey;
			headers['Authorization'] = `Bearer ${params.apiKey}`;
		}

		const response = await fetch(url.toString(), {
			method: op.method,
			headers,
			body: params.body ? JSON.stringify(params.body) : undefined
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Bhejna API Error (${response.status}): ${errorText}`);
		}

		if (response.status === 204) {
			return {} as T;
		}

		return await response.json();
	}

	/** Shortcut for syncTenant */
	async syncTenant(tenant: any) {
		return this.request('syncTenant', { body: tenant });
	}

	/** Shortcut for pauseTenant */
	async pauseTenant(id: string) {
		return this.request('pauseTenant', { path: { id } });
	}
}

export const bhejnaClient = new BhejnaClient();
