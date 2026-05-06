<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let message = $state('');
	let isSignUp = $state(false);

	async function handleAuth(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		message = '';

		try {
			if (isSignUp) {
				const { error } = await supabase.auth.signUp({ email, password });
				if (error) throw error;
				message = 'Check your email for the confirmation link!';
			} else {
				const { error } = await supabase.auth.signInWithPassword({ email, password });
				if (error) throw error;
				goto('/dashboard');
			}
		} catch (error: any) {
			message = error.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-950 p-4">
	<div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
		<div class="text-center">
			<h1 class="text-3xl font-bold text-white tracking-tight">Bhejna</h1>
			<p class="text-slate-400 mt-2">Control Plane Dashboard</p>
		</div>

		<form onsubmit={handleAuth} class="space-y-4">
			<div>
				<label for="email" class="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					required
					class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
					placeholder="name@company.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-slate-300 mb-1">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					required
					class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
					placeholder="••••••••"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded-lg transition-colors shadow-lg shadow-cyan-900/20 disabled:opacity-50"
			>
				{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
			</button>
		</form>

		{#if message}
			<p class="text-center text-sm {message.includes('Check') ? 'text-green-400' : 'text-red-400'} animate-pulse">
				{message}
			</p>
		{/if}

		<div class="text-center pt-4 border-t border-slate-800">
			<button
				onclick={() => (isSignUp = !isSignUp)}
				class="text-sm text-slate-400 hover:text-cyan-400 transition-colors underline underline-offset-4"
			>
				{isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
			</button>
		</div>
	</div>
</div>
