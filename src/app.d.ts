import { SupabaseClient, Session, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
		}
		interface PageData {
			session: Session | null;
			cookies: { name: string; value: string }[];
		}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		fbAsyncInit: () => void;
		FB: any;
	}
}

export {};
