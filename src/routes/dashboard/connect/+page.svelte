<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { PUBLIC_META_APP_ID, PUBLIC_META_CONFIG_ID } from '$env/static/public';

	let loading = $state(true);
	let connecting = $state(false);
	let error = $state('');
	
	let waba_id = $state('');
	let phone_number_id = $state('');
	let code = $state('');

	// Watcher to trigger provisioning when all data is collected
	$effect(() => {
		if (waba_id && phone_number_id && code && connecting) {
			provisionTenant();
		}
	});

	const sessionInfoListener = (event: MessageEvent) => {
		// Robust origin check based on official recommendation
		if (!event.origin.endsWith('facebook.com')) return;
		
		try {
			const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
			if (data.type === 'WA_EMBEDDED_SIGNUP') {
				console.log('ESS Message Event:', data);
				
				if (data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING' || data.event === 'FINISH') {
					// Successful completion
					const { waba_id: id, phone_number_id: phoneId } = data.data;
					waba_id = id;
					phone_number_id = phoneId;
				} else if (data.event === 'CANCEL') {
					// User abandoned or error occurred
					const { current_step, error_message } = data.data;
					if (error_message) {
						error = `Meta Error: ${error_message}`;
					} else if (current_step) {
						error = `Flow abandoned at step: ${current_step}`;
					} else {
						error = 'Signup cancelled by user.';
					}
					connecting = false;
				}
			}
		} catch (e) {
			// Ignore non-JSON messages
		}
	};

	onMount(() => {
		window.addEventListener("message", sessionInfoListener);

		window.fbAsyncInit = function() {
			window.FB.init({
				appId: PUBLIC_META_APP_ID,
				autoLogAppEvents: true,
				cookie: true,
				xfbml: true,
				version: 'v25.0'
			});
			loading = false;
		};

		// Load SDK
		(function(d, s, id){
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {return;}
			js = d.createElement(s) as HTMLScriptElement; js.id = id;
			js.src = "https://connect.facebook.net/en_US/sdk.js";
			if (fjs.parentNode) fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener("message", sessionInfoListener);
		}
	});

	function fbLoginCallback(response: any) {
		if (response.authResponse) {
			code = response.authResponse.code;
			console.log('Captured Code from callback:', code);
		} else {
			connecting = false;
			error = 'User cancelled login or did not fully authorize.';
		}
	}

	function handleConnect() {
		connecting = true;
		error = '';
		waba_id = '';
		phone_number_id = '';
		code = '';

		window.FB.login(fbLoginCallback, {
			config_id: PUBLIC_META_CONFIG_ID,
			response_type: 'code',
			override_default_response_type: true,
			extras: {
				sessionInfoVersion: 3,
				featureType: 'whatsapp_business_app_onboarding'
			}
		});
	}

	async function provisionTenant() {
		try {
			const res = await fetch('/api/ess-exchange', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ waba_id, phone_number_id, code })
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Provisioning failed');

			goto('/dashboard');
		} catch (err: any) {
			error = err.message;
			connecting = false;
		}
	}
</script>

<svelte:head>
	<title>Connect WhatsApp | Bhejna</title>
</svelte:head>

<div class="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
	<!-- Background Gradients -->
	<div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]"></div>
	<div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>

	<div class="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
		<div class="flex justify-center mb-8">
			<div class="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl border border-cyan-500/30">
				<img src="/favicon.svg" alt="Bhejna Logo" class="w-12 h-12" />
			</div>
		</div>

		<h2 class="text-3xl font-bold text-white text-center mb-2 tracking-tight">Connect WhatsApp</h2>
		<p class="text-slate-400 text-center text-sm mb-10 leading-relaxed px-4">
			Link your WhatsApp Business Account to start sending messages through Bhejna's secure infrastructure.
		</p>

		<div class="space-y-4">
			{#if loading}
				<div class="flex flex-col items-center py-6 space-y-4">
					<div class="relative w-12 h-12">
						<div class="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
						<div class="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
					</div>
					<p class="text-xs text-slate-500 font-medium animate-pulse">Initializing SDK...</p>
				</div>
			{:else}
				<button
					onclick={handleConnect}
					disabled={connecting}
					class="group w-full relative flex items-center justify-center bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
				>
					<span class="flex items-center gap-3">
						{#if connecting}
							<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Processing...
						{:else}
							<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
								<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
							</svg>
							Continue with Facebook
						{/if}
					</span>
				</button>
			{/if}

			{#if error}
				<div class="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
					<div class="flex gap-3">
						<svg class="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
						<p class="text-sm text-red-200 font-medium leading-tight">{error}</p>
					</div>
				</div>
			{/if}

			<button
				onclick={() => goto('/dashboard')}
				class="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors py-2 font-medium"
			>
				Go back to Dashboard
			</button>
		</div>

		<!-- Trust Footer -->
		<div class="mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-2 opacity-50">
			<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
			</svg>
			<span class="text-[10px] uppercase tracking-widest font-bold text-slate-400">Secure Meta Integration</span>
		</div>
	</div>
</div>

<style>
	:global(body) {
		background-color: #020617;
	}
</style>
