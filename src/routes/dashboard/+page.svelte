<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let loading = $state(false);
	let provisioning = $state(false);
	let userEmail = $derived(data.user?.email || '');
	let waba_id = $state('');
	let phone_number_id = $state('');
	let apiKey = $state('');
	let error = $state('');

	// API Playground state
	let recipientPhone = $state('');
	let testing = $state(false);
	let updatingWebhook = $state(false);
	let testResult = $state('');
	let testError = $state('');
	let copiedSecret = $state(false);
	let showSecret = $state(false);



	async function copySecretToClipboard(secret: string | undefined) {
		if (secret) {
			await navigator.clipboard.writeText(secret);
			copiedSecret = true;
			setTimeout(() => { copiedSecret = false; }, 2000);
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
			
			apiKey = data.api_key;
			// Clear fields on success
			waba_id = '';
			phone_number_id = '';
		} catch (err: any) {
			error = err.message;
		} finally {
			provisioning = false;
		}
	}



	function copyToClipboard() {
		navigator.clipboard.writeText(apiKey);
	}

	async function handleTestMessage(e: SubmitEvent) {
		e.preventDefault();
		testing = true;
		testResult = '';
		testError = '';
		if (!recipientPhone) {
			testError = 'Recipient phone is required for sending messages.';
			testing = false;
			return;
		}

		try {
			const res = await fetch('/api/test-message', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ recipient_phone: recipientPhone })
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


</script>

<div class="min-h-screen bg-slate-900 text-white font-sans">
	<nav class="border-b border-white/[0.05] bg-[#111827]/80 backdrop-blur-md sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<img src="/favicon.svg" alt="Bhejna Logo" class="w-8 h-8" />
				<span class="text-xl font-bold tracking-tight">Bhejna</span>
			</div>
			<div class="flex items-center space-x-6">
				<a href="/docs" class="text-sm font-medium text-slate-400 hover:text-white transition-colors">Documentation</a>
				<span class="text-sm text-slate-400 hidden sm:inline">{userEmail}</span>
				<form method="POST" action="/dashboard?/signout" use:enhance>
					<button
						type="submit"
						class="text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] px-4 py-2 rounded-lg transition-all"
					>
						Sign Out
					</button>
				</form>
			</div>
		</div>
	</nav>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
		{#if loading}
			<div class="flex justify-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		{:else}
			<div class="mb-8 border-b border-white/[0.05] pb-5">
				<h1 class="text-2xl font-semibold text-white tracking-tight">API & Integration Settings</h1>
				<p class="text-sm text-slate-400 mt-1">Manage your WhatsApp Business connection, API keys, and webhook routing.</p>
			</div>

			<div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
				<!-- Left Column: Settings -->
				<div class="xl:col-span-8 flex flex-col gap-6">
					
					<!-- WhatsApp Connection Card -->
					<div class="bg-[#111827]/80 backdrop-blur-xl rounded-xl border border-white/[0.05] shadow-sm overflow-hidden">
						<div class="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
							<h2 class="text-sm font-semibold text-slate-200">WhatsApp Connection</h2>
						</div>
						<div class="p-6">
							{#if data.tenant}
								<div class="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
									<div class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
									<div class="flex flex-col">
										<span class="text-sm font-medium text-emerald-400">Connected to WhatsApp API</span>
										<span class="text-xs font-mono text-slate-500 mt-1">WABA ID: {data.tenant.waba_id}</span>
									</div>
								</div>
							{:else}
								<div class="space-y-6">
									<div class="bg-blue-500/5 border border-white/[0.05] p-4 rounded-lg">
										<h3 class="text-sm font-medium text-blue-400 mb-1">Embedded Signup (Recommended)</h3>
										<p class="text-xs text-slate-400 mb-4">The fastest way to connect your WhatsApp Business Account via Meta's official onboarding.</p>
										<a href="/dashboard/connect" class="inline-flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-[0.98]">
											<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
												<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.03c0 2.12.551 4.189 1.595 6.048L0 24l6.105-1.602a11.83 11.83 0 005.937 1.598h.005c6.637 0 12.032-5.395 12.035-12.032a11.762 11.762 0 00-3.528-8.508z"/>
											</svg>
											Connect WhatsApp Account
										</a>
									</div>

									<div class="relative py-2">
										<div class="absolute inset-0 flex items-center"><span class="w-full border-t border-white/[0.05]"></span></div>
										<div class="relative flex justify-center text-xs uppercase"><span class="bg-slate-900 px-2 text-slate-500">Or Manual Provisioning</span></div>
									</div>

									<form onsubmit={handleProvision} class="space-y-4">
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label for="waba_id" class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">WABA ID</label>
												<input
													type="text"
													id="waba_id"
													bind:value={waba_id}
													required
													placeholder="e.g. 1029384756..."
													class="w-full bg-[#0B1120] border border-white/[0.05] text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner font-mono"
												/>
											</div>
											<div>
												<label for="phone_number_id" class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Phone Number ID</label>
												<input
													type="text"
													id="phone_number_id"
													bind:value={phone_number_id}
													required
													placeholder="e.g. 987654321..."
													class="w-full bg-[#0B1120] border border-white/[0.05] text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner font-mono"
												/>
											</div>
										</div>

										<button
											type="submit"
											disabled={provisioning}
											class="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold py-2.5 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-[0.98] disabled:opacity-50"
										>
											{provisioning ? 'Provisioning...' : 'Provision Bhejna API Key'}
										</button>
									</form>
								</div>
							{/if}

							{#if error}
								<div class="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs">
									{error}
								</div>
							{/if}

							{#if apiKey}
								<div class="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-blue-500/5 p-4 rounded-xl border border-white/[0.05]">
									<h3 class="text-xs font-semibold mb-3 text-blue-400 flex items-center uppercase tracking-wider">
										<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
										</svg>
										API Key Generated
									</h3>
									<div class="flex items-center gap-2">
										<div class="flex-1 bg-black/50 border border-white/[0.05] rounded-lg p-3 font-mono text-blue-300 text-xs overflow-x-auto break-all shadow-inner">
											{apiKey}
										</div>
										<button
											onclick={copyToClipboard}
											class="p-2.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-slate-400 hover:text-white transition-colors"
											title="Copy to clipboard"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
											</svg>
										</button>
									</div>
									<p class="mt-3 text-[10px] text-slate-500 italic">
										Save this key securely. It will not be shown again.
									</p>
								</div>
							{/if}
						</div>
					</div>

					<!-- Developer Settings Card -->
					<div class="bg-[#111827]/80 backdrop-blur-xl rounded-xl border border-white/[0.05] shadow-sm overflow-hidden">
						<div class="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
							<h2 class="text-sm font-semibold text-slate-200">Developer Settings</h2>
						</div>
						<div class="p-6">
							<form 
								method="POST" 
								action="?/updateWebhook" 
								use:enhance={() => {
									updatingWebhook = true;
									return async ({ update, result }) => {
										updatingWebhook = false;
										await update();
									};
								}} 
								class="space-y-6"
							>
								<div>
									<label for="webhook_url" class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Webhook URL</label>
									<input
										type="url"
										name="webhook_url"
										id="webhook_url"
										value={form?.webhook_url ?? data.tenant?.webhook_url ?? ''}
										required
										placeholder="https://your-app.com/api/webhooks/bhejna"
										class="w-full bg-[#0B1120] border border-white/[0.05] text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner font-mono"
									/>
									<p class="text-[10px] text-slate-500 mt-2">Bhejna will POST status updates and inbound messages to this URL.</p>
								</div>

								<button
									type="submit"
									disabled={updatingWebhook}
									class="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold py-2.5 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-[0.98] disabled:opacity-50"
								>
									{updatingWebhook ? 'Saving Settings...' : 'Save Webhook Settings'}
								</button>
							</form>

							{#if form?.success && form.message.includes('Webhook saved')}
								<div class="mt-4 p-3 bg-emerald-900/20 border border-emerald-900/50 rounded-lg text-emerald-400 text-xs flex items-center">
									<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
									{form.message}
								</div>
							{/if}

							{#if data.tenant?.webhook_secret}
								<div class="mt-6 pt-6 border-t border-white/[0.05]">
									<span class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Webhook Secret</span>
									<div class="flex items-center gap-3">
										<div class="flex-1 bg-[#0B1120] border border-white/[0.05] rounded-lg px-4 py-2.5 font-mono text-sm text-slate-300 overflow-hidden text-ellipsis">
											{showSecret ? data.tenant.webhook_secret : '••••••••••••••••••••••••••••••••'}
										</div>
										<button 
											type="button" 
											onclick={() => showSecret = !showSecret} 
											class="p-2.5 rounded-lg border border-white/[0.05] hover:bg-white/[0.05] text-slate-400 transition-colors"
											title={showSecret ? 'Hide Secret' : 'Show Secret'}
										>
											{showSecret ? 'Hide' : 'Show'}
										</button>
										<button 
											type="button" 
											onclick={() => {
												navigator.clipboard.writeText(data.tenant?.webhook_secret || '');
											}} 
											class="p-2.5 rounded-lg border border-white/[0.05] hover:bg-white/[0.05] text-slate-400 transition-colors"
											title="Copy Secret"
										>
											Copy
										</button>
									</div>
									<div class="mt-3 flex justify-between items-center">
										<p class="text-[9px] uppercase tracking-widest text-slate-500 font-bold">HMAC-SHA256 Payload Verification</p>
										<form method="POST" action="?/rotateSecret" use:enhance>
											<button type="submit" class="text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors">Rotate Secret Key</button>
										</form>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Right Column: API Playground (Sticky) -->
				<div class="xl:col-span-4 sticky top-24">
					<div class="bg-[#111827]/80 backdrop-blur-xl rounded-xl border border-white/[0.05] shadow-sm overflow-hidden border-t-2 border-t-[#2563EB]">
						<div class="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
							<h2 class="text-sm font-semibold text-slate-200">API Playground</h2>
						</div>
						<div class="p-6">
							<p class="text-xs text-slate-400 mb-6 leading-relaxed">Send a test message to ensure your integration is active. Requests are proxied via Bhejna infrastructure.</p>

							<form onsubmit={handleTestMessage} class="space-y-5">
								<div>
									<label for="recipient_phone" class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Recipient Phone</label>
									<input
										type="text"
										id="recipient_phone"
										bind:value={recipientPhone}
										placeholder="e.g. 15551234567"
										class="w-full bg-[#0B1120] border border-white/[0.05] text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner font-mono"
									/>
								</div>
								<button
									type="submit"
									disabled={testing}
									class="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold py-2.5 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
								>
									{#if testing}
										<svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
										Sending...
									{:else}
										Send 'hello_world' Template
									{/if}
								</button>
							</form>

							{#if testError}
								<div class="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs">
									{testError}
								</div>
							{/if}

							{#if testResult}
								<div class="mt-4 p-3 bg-emerald-900/20 border border-emerald-900/50 rounded-lg text-emerald-400 text-xs font-mono flex items-center">
									<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
									{testResult}
								</div>
							{/if}
						</div>
					</div>
					
					<div class="mt-6 p-4 bg-blue-500/5 border border-white/[0.05] rounded-xl">
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
							<div>
								<h4 class="text-xs font-semibold text-slate-200">Production Ready</h4>
								<p class="text-[10px] text-slate-500 mt-1 leading-relaxed">This playground uses your production API configuration. Standard messaging rates apply.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>
