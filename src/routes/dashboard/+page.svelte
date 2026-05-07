<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';

	let { data, form }: { data: { tenant: any }, form: any } = $props();

	let loading = $state(true);
	let provisioning = $state(false);
	let userEmail = $state('');
	let waba_id = $state('');
	let phone_number_id = $state('');
	let apiKey = $state('');
	let error = $state('');

	// API Playground state
	let recipientPhone = $state('');
	let messageText = $state('');
	let testing = $state(false);
	let testResult = $state('');
	let testError = $state('');

	let creatingTemplate = $state(false);
	let templateResult = $state('');
	let templateError = $state('');

	onMount(async () => {
		const { data: { session } } = await supabase.auth.getSession();
		if (!session) {
			goto('/login');
		} else {
			userEmail = session.user.email || '';
			// Set cookie for server-side actions
			document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax; secure`;
			loading = false;
		}
	});

	function copySecretToClipboard(secret: string | undefined) {
		if (secret) {
			navigator.clipboard.writeText(secret);
		}
	}

	async function handleProvision(e: SubmitEvent) {
		e.preventDefault();
		provisioning = true;
		error = '';
		apiKey = '';

		try {
			const response = await fetch('/api/provision', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ waba_id, phone_number_id })
			});

			const data = await response.json();

			if (!response.ok) throw new Error(data.message || 'Provisioning failed');

			apiKey = data.apiKey;
		} catch (err: any) {
			error = err.message;
		} finally {
			provisioning = false;
		}
	}

	async function signOut() {
		await supabase.auth.signOut();
		goto('/login');
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(apiKey);
	}

	async function handleTestMessage(e: SubmitEvent) {
		e.preventDefault();
		testing = true;
		testResult = '';
		testError = '';
		templateResult = '';
		templateError = '';

		if (!recipientPhone || !messageText) {
			testError = 'Recipient phone and message text are required for sending messages.';
			testing = false;
			return;
		}

		try {
			const res = await fetch('/api/test-message', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ recipient_phone: recipientPhone, message_text: messageText })
			});

			const resData = await res.json();
			if (!res.ok) throw new Error(resData.message || 'Failed to send test message');

			// Return the Go backend's response (Job ID) to the frontend
			testResult = `Message Queued: ${resData.id || resData.job_id || 'Success'}`;
		} catch (err: any) {
			testError = err.message;
		} finally {
			testing = false;
		}
	}

	async function handleCreateTemplate() {
		creatingTemplate = true;
		templateResult = '';
		templateError = '';
		testResult = '';
		testError = '';

		try {
			const res = await fetch('/api/create-template', {
				method: 'POST'
			});

			const resData = await res.json();
			if (!res.ok) throw new Error(resData.message || 'Failed to create template');

			templateResult = `Template Created! ID: ${resData.id}`;
		} catch (err: any) {
			templateError = err.message;
		} finally {
			creatingTemplate = false;
		}
	}
</script>

<div class="min-h-screen bg-slate-950 text-white font-sans">
	<nav class="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<img src="/favicon.svg" alt="Bhejna Logo" class="w-8 h-8" />
				<span class="text-xl font-bold tracking-tight">Bhejna</span>
			</div>
			<div class="flex items-center space-x-4">
				<span class="text-sm text-slate-400 hidden sm:inline">{userEmail}</span>
				<button
					onclick={signOut}
					class="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
				>
					Sign Out
				</button>
			</div>
		</div>
	</nav>

	<main class="max-w-3xl mx-auto px-4 py-12">
		{#if loading}
			<div class="flex justify-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
			</div>
		{:else}
			<section class="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl mb-8">
				<header class="mb-6">
					<h3 class="text-2xl font-bold text-white flex items-center">
						<svg class="w-6 h-6 mr-2 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.03c0 2.12.551 4.189 1.595 6.048L0 24l6.105-1.602a11.83 11.83 0 005.937 1.598h.005c6.637 0 12.032-5.395 12.035-12.032a11.762 11.762 0 00-3.528-8.508z"/>
						</svg>
						Embedded Signup (Recommended)
					</h3>
					<p class="text-slate-400 mt-2 text-sm">The fastest way to connect your WhatsApp Business Account. Use Meta's official onboarding flow.</p>
				</header>
				<a href="/dashboard/connect" class="w-full inline-flex items-center justify-center bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-900/30 active:scale-[0.98]">
					<svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.03c0 2.12.551 4.189 1.595 6.048L0 24l6.105-1.602a11.83 11.83 0 005.937 1.598h.005c6.637 0 12.032-5.395 12.035-12.032a11.762 11.762 0 00-3.528-8.508z"/>
					</svg>
					Connect WhatsApp Account
				</a>
			</section>

			<header class="mb-12">
				<h2 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
					Manual Provisioning (Advanced)
				</h2>
				<p class="text-slate-400 mt-2">Connect your WhatsApp Business Account (WABA) manually if you already have the IDs.</p>
			</header>

			<section class="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
				<form onsubmit={handleProvision} class="space-y-6">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label for="waba_id" class="block text-sm font-medium text-slate-300 mb-2">WABA ID</label>
							<input
								type="text"
								id="waba_id"
								bind:value={waba_id}
								required
								placeholder="e.g. 1029384756..."
								class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
							/>
						</div>
						<div>
							<label for="phone_number_id" class="block text-sm font-medium text-slate-300 mb-2">Phone Number ID</label>
							<input
								type="text"
								id="phone_number_id"
								bind:value={phone_number_id}
								required
								placeholder="e.g. 987654321..."
								class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={provisioning}
						class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-cyan-900/30 active:scale-[0.98] disabled:opacity-50"
					>
						{provisioning ? 'Provisioning...' : 'Provision Bhejna API Key'}
					</button>
				</form>

				{#if error}
					<div class="mt-6 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-400 text-sm">
						{error}
					</div>
				{/if}

				{#if apiKey}
					<div class="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
						<h3 class="text-lg font-semibold mb-4 text-cyan-400 flex items-center">
							<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							Success! Your API Key is Ready
						</h3>
						<div class="relative group">
							<pre class="bg-black/50 border border-cyan-500/30 rounded-xl p-6 font-mono text-cyan-300 overflow-x-auto break-all shadow-inner"><code>{apiKey}</code></pre>
							<button
								onclick={copyToClipboard}
								class="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
								title="Copy to clipboard"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
								</svg>
							</button>
						</div>
						<p class="mt-4 text-sm text-slate-500 italic">
							Save this key securely. It will not be shown again.
						</p>
					</div>
				{/if}
			</section>

			<!-- Developer Settings Panel -->
			<section class="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl mt-8">
				<header class="mb-6">
					<h3 class="text-2xl font-bold text-white flex items-center">
						<svg class="w-6 h-6 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
						Developer Settings
					</h3>
					<p class="text-slate-400 mt-2 text-sm">Configure Client Webhook Egress for asynchronous WhatsApp status updates.</p>
				</header>

				<form method="POST" action="?/updateWebhook" use:enhance class="space-y-6">
					<div>
						<label for="webhook_url" class="block text-sm font-medium text-slate-300 mb-2">Webhook URL</label>
						<input
							type="url"
							name="webhook_url"
							id="webhook_url"
							value={form?.webhook_url ?? data?.tenant?.webhook_url ?? ''}
							required
							placeholder="https://your-app.com/api/webhooks/bhejna"
							class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
						/>
					</div>

					<button
						type="submit"
						class="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-[0.98]"
					>
						Save Webhook Settings
					</button>
				</form>

				{#if form?.error}
					<div class="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-400 text-sm">
						{form.error}
					</div>
				{/if}

				{#if form?.success || data?.tenant?.webhook_secret}
					<div class="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-950/50 p-6 rounded-xl border border-slate-800">
						<h4 class="text-sm font-semibold mb-3 text-slate-300 flex items-center justify-between">
							Webhook Secret
							<button
								onclick={() => copySecretToClipboard(form?.webhook_secret || data?.tenant?.webhook_secret)}
								class="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center text-xs"
								title="Copy secret"
							>
								<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
								Copy
							</button>
						</h4>
						<div class="relative group mb-4">
							<pre class="bg-black/80 border border-cyan-900/50 rounded-lg p-4 font-mono text-cyan-400 overflow-x-auto shadow-inner text-sm"><code>{form?.webhook_secret || data?.tenant?.webhook_secret}</code></pre>
						</div>
						
						<div class="mt-4 pt-4 border-t border-slate-800">
							<p class="text-xs text-slate-400 mb-2">
								<strong>Verification Note:</strong> Bhejna signs all webhook requests. Compute an HMAC SHA-256 hash of the raw request body using your secret, and compare it to the <code class="text-cyan-300 bg-slate-900 px-1 rounded">X-Bhejna-Signature</code> header.
							</p>
							<pre class="bg-slate-900/80 rounded-lg p-3 text-xs text-slate-500 overflow-x-auto border border-slate-800"><code>const hash = crypto.createHmac('sha256', secret)
  .update(rawBody)
  .digest('hex');

if (hash === headers['x-bhejna-signature']) {'{'}
  // Request is verified
{'}'}</code></pre>
						</div>
					</div>
				{/if}
			</section>

			<!-- API Playground Panel -->
			<section class="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl mt-8">
				<header class="mb-6">
					<h3 class="text-2xl font-bold text-white flex items-center">
						<svg class="w-6 h-6 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
						API Playground
					</h3>
					<p class="text-slate-400 mt-2 text-sm">Send a test message to ensure the integration with Bhejna infrastructure is active. This utility safely proxies the request without exposing your raw API Key to the client.</p>
				</header>

				<form onsubmit={handleTestMessage} class="space-y-6">
					<div>
						<label for="recipient_phone" class="block text-sm font-medium text-slate-300 mb-2">Recipient Phone</label>
						<input
							type="text"
							id="recipient_phone"
							bind:value={recipientPhone}
							placeholder="e.g. 15551234567"
							class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
						/>
					</div>
					<div>
						<label for="message_text" class="block text-sm font-medium text-slate-300 mb-2">Message Body</label>
						<textarea
							id="message_text"
							bind:value={messageText}
							rows="3"
							placeholder="Hello from Bhejna API!"
							class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
						></textarea>
					</div>

					<div class="flex flex-col sm:flex-row gap-4">
						<button
							type="submit"
							disabled={testing || creatingTemplate}
							class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
						>
							{#if testing}
								<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
								Sending...
							{:else}
								Send Test Message
							{/if}
						</button>

						<button
							type="button"
							onclick={handleCreateTemplate}
							disabled={creatingTemplate || testing}
							class="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
						>
							{#if creatingTemplate}
								<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
								Creating...
							{:else}
								Create Test Template
							{/if}
						</button>
					</div>
				</form>

				{#if testError || templateError}
					<div class="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-400 text-sm">
						{testError || templateError}
					</div>
				{/if}

				{#if testResult || templateResult}
					<div class="mt-4 p-4 bg-green-900/20 border border-green-900/50 rounded-xl text-green-400 text-sm font-mono flex items-center">
						<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
						{testResult || templateResult}
					</div>
				{/if}
			</section>
		{/if}
	</main>
</div>
