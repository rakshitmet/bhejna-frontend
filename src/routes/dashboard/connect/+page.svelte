<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { PUBLIC_META_APP_ID, PUBLIC_META_CONFIG_ID } from '$env/static/public';

	let loading = $state(true);
	let connecting = $state(false);
	let error = $state('');

	onMount(() => {
		// Asynchronously load the Facebook SDK
		window.fbAsyncInit = function() {
			window.FB.init({
				appId: PUBLIC_META_APP_ID,
				cookie: true,
				xfbml: true,
				version: 'v25.0'
			});
			loading = false;
		};

		(function(d, s, id){
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {return;}
			js = d.createElement(s) as HTMLScriptElement; js.id = id;
			js.src = "https://connect.facebook.net/en_US/sdk.js";
			if (fjs.parentNode) {
				fjs.parentNode.insertBefore(js, fjs);
			}
		}(document, 'script', 'facebook-jssdk'));
	});

	function handleConnect() {
		connecting = true;
		error = '';

		window.FB.login(
			(response: any) => {
				if (response.authResponse) {
					const accessToken = response.authResponse.accessToken;
					exchangeToken(accessToken);
				} else {
					connecting = false;
					error = 'User cancelled login or did not fully authorize.';
				}
			},
			{
				config_id: PUBLIC_META_CONFIG_ID,
				scope: 'whatsapp_business_management,whatsapp_business_messaging',
				extinfo: { setup: {} },
				feature: 'whatsapp_embedded_signup'
			}
		);
	}

	async function exchangeToken(accessToken: string) {
		try {
			const res = await fetch('/api/ess-exchange', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ accessToken })
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Token exchange failed');
			}

			// On success, redirect back to dashboard
			goto('/dashboard');
		} catch (err: any) {
			error = err.message;
			connecting = false;
		}
	}
</script>

<svelte:head>
	<title>Connect WhatsApp - Bhejna</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
	<div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
		<img src="/favicon.svg" alt="Bhejna Logo" class="w-12 h-12 mx-auto mb-4" />
		<h2 class="text-xl font-bold text-white mb-2">Connect WhatsApp</h2>
		<p class="text-slate-400 text-sm mb-6">
			Link your WhatsApp Business Account securely to Bhejna.
		</p>

		{#if loading}
			<div class="flex justify-center py-2">
				<div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500"></div>
			</div>
		{:else}
			<button
				onclick={handleConnect}
				disabled={connecting}
				class="w-full bg-[#128C7E] hover:bg-[#075E54] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center text-sm"
			>
				{#if connecting}
					Connecting...
				{:else}
					Connect WhatsApp
				{/if}
			</button>
		{/if}

		{#if error}
			<div class="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs">
				{error}
			</div>
		{/if}
		
		<button
			onclick={() => goto('/dashboard')}
			class="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
		>
			Cancel
		</button>
	</div>
</div>
