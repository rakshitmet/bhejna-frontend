<script lang="ts">
	import { onMount } from 'svelte';
	
	let activeSection = $state('base-url');

	onMount(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					activeSection = entry.target.id;
				}
			});
		}, { threshold: 0.5 });

		document.querySelectorAll('section[id]').forEach((section) => {
			observer.observe(section);
		});

		return () => observer.disconnect();
	});

	const navItems = [
		{ id: 'base-url', label: 'Base URL' },
		{ id: 'authentication', label: 'Authentication' },
		{ id: 'send-message', label: 'Send Message' },
		{ id: 'request-body', label: 'Request Body' },
		{ id: 'response-codes', label: 'Response Codes' },
		{ id: 'integration', label: 'Integration Snippet' },
		{ id: 'webhooks', label: 'Webhooks' }
	];
</script>

<svelte:head>
	<title>Bhejna API Documentation | High-Reliability WhatsApp Infrastructure</title>
	<meta name="description" content="Technical documentation for Bhejna WhatsApp API Proxy. Learn how to integrate secure, asynchronous WhatsApp messaging into your application.">
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
	<!-- Glassmorphic Header -->
	<nav class="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<a href="/" class="flex items-center space-x-2 group">
					<img src="/favicon.svg" alt="Bhejna Logo" class="w-8 h-8 group-hover:scale-110 transition-transform" />
					<span class="text-xl font-bold tracking-tight text-white">Bhejna</span>
				</a>
				<span class="mx-3 text-slate-700">/</span>
				<span class="text-sm font-medium text-slate-400">API Reference v1.0</span>
			</div>
			<div class="flex items-center space-x-6">
				<a href="/dashboard" class="text-sm font-medium text-slate-300 hover:text-white transition-colors">Dashboard</a>
				<a href="https://github.com/codenxtlab/bhejna" target="_blank" class="text-slate-400 hover:text-white transition-colors">
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
				</a>
			</div>
		</div>
	</nav>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex gap-12">
		<!-- Sidebar -->
		<aside class="hidden lg:block w-64 shrink-0 sticky top-28 self-start">
			<nav class="space-y-1">
				{#each navItems as item}
					<a
						href="#{item.id}"
						class="block px-3 py-2 text-sm font-medium rounded-lg transition-all {activeSection === item.id ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500 pl-4' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}"
					>
						{item.label}
					</a>
				{/each}
			</nav>
			<div class="mt-12 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
				<h4 class="text-xs font-bold text-cyan-500 uppercase tracking-wider mb-2">Support</h4>
				<p class="text-xs text-slate-400 leading-relaxed">
					Need help with integration? Join our <a href="#" class="text-cyan-400 underline underline-offset-4 hover:text-cyan-300">Developer Community</a>.
				</p>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="flex-1 min-w-0">
			<div class="prose prose-invert prose-slate max-w-none 
				prose-headings:font-bold prose-headings:tracking-tight 
				prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
				prose-code:text-cyan-300 prose-code:bg-slate-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
				prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:shadow-2xl">
				
				<header class="mb-16">
					<h1 class="text-5xl font-black mb-4">Bhejna API Documentation</h1>
					<p class="text-xl text-slate-400 leading-relaxed max-w-2xl">
						The Bhejna Messaging API provides a high-reliability infrastructure layer for WhatsApp Cloud API. 
						Focus on your product while we handle queueing, retries, and deliverability.
					</p>
				</header>

				<section id="base-url" class="scroll-mt-24 mb-16">
					<h2>Base URL</h2>
					<p>All API requests should be made to the following production endpoint. We recommend using HTTPS for all communication.</p>
					<div class="relative group">
						<div class="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
						<pre class="relative bg-slate-900 p-4 rounded-lg border border-slate-800"><code>https://api.bhejna.codenxtlab.tech</code></pre>
					</div>
				</section>

				<section id="authentication" class="scroll-mt-24 mb-16">
					<h2>Authentication</h2>
					<p>
						Bhejna uses API keys to authenticate requests. All API keys are tied to a specific WhatsApp Business Account (WABA) 
						and Phone Number ID provisioned in your dashboard.
					</p>
					<div class="bg-slate-900/50 border-l-4 border-cyan-500 p-6 rounded-r-xl my-6">
						<p class="m-0 text-sm italic text-slate-300">
							<strong>Security Tip:</strong> Production keys start with the prefix <code>nxt_live_</code>. 
							Never share your keys in client-side code or public repositories.
						</p>
					</div>
					<p>Include your key in the <code>Authorization</code> header as a Bearer token:</p>
					<pre><code>Authorization: Bearer nxt_live_xxxxxxxxxxxxxxxx</code></pre>
				</section>

				<hr class="border-slate-800 my-16" />

				<section id="send-message" class="scroll-mt-24 mb-16">
					<h2>Send Message</h2>
					<p>
						The primary endpoint for dispatching messages. This endpoint is <strong>asynchronous</strong>; 
						a successful response (<code>202 Accepted</code>) means the message is validated and 
						securely stored in our persistent queue for delivery.
					</p>
					<div class="flex items-center space-x-3 mb-6">
						<span class="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">POST</span>
						<code class="text-slate-200">/v1/messages</code>
					</div>

					<h3>Request Headers</h3>
					<table class="w-full text-left border-collapse">
						<thead>
							<tr class="border-b border-slate-800">
								<th class="py-3 text-slate-300">Header</th>
								<th class="py-3 text-slate-300 text-center">Required</th>
								<th class="py-3 text-slate-300">Description</th>
							</tr>
						</thead>
						<tbody>
							<tr class="border-b border-slate-900">
								<td class="py-3"><code>Authorization</code></td>
								<td class="py-3 text-center text-cyan-500">Yes</td>
								<td class="py-3 text-slate-400">Bearer token found in dashboard.</td>
							</tr>
							<tr class="border-b border-slate-900">
								<td class="py-3"><code>Idempotency-Key</code></td>
								<td class="py-3 text-center text-slate-600">No</td>
								<td class="py-3 text-slate-400">UUID to prevent duplicate message processing.</td>
							</tr>
						</tbody>
					</table>
				</section>

				<section id="request-body" class="scroll-mt-24 mb-16">
					<h3>Request Body</h3>
					<p>Bhejna uses a simplified root structure while allowing you to pass native WhatsApp Cloud API payloads.</p>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
						<div class="bg-slate-900/30 p-6 rounded-2xl border border-slate-800">
							<h4 class="text-white mt-0">Standard Schema</h4>
							<ul class="text-sm space-y-2 text-slate-400">
								<li><strong class="text-slate-200">recipient</strong>: E.164 phone number.</li>
								<li><strong class="text-slate-200">message_type</strong>: <code>template</code> or <code>text</code>.</li>
								<li><strong class="text-slate-200">payload</strong>: Inner content object.</li>
							</ul>
						</div>
						<div class="bg-slate-900/30 p-6 rounded-2xl border border-slate-800">
							<h4 class="text-white mt-0">Meta Compatibility</h4>
							<p class="text-xs text-slate-400 leading-relaxed">
								The <code>payload</code> field maps directly to Meta's message object. 
								Bhejna handles <code>messaging_product</code> and <code>to</code> fields automatically.
							</p>
						</div>
					</div>

					<h4>Example: Template Message</h4>
					<pre><code>{'{'}
  "recipient": "15551234567",
  "message_type": "template",
  "payload": {'{'}
    "name": "hello_world",
    "language": {'{'} "code": "en_US" {'}'},
    "components": [
      {'{'}
        "type": "body",
        "parameters": [
          {'{'} "type": "text", "text": "Bhejna" {'}'}
        ]
      {'}'}
    ]
  {'}'}
{'}'}</code></pre>
				</section>

				<section id="response-codes" class="scroll-mt-24 mb-16">
					<h2>Response Codes</h2>
					<p>Bhejna uses standard HTTP response codes to indicate the success or failure of an API request.</p>
					
					<div class="space-y-4">
						<div class="flex items-start p-4 bg-slate-900/50 rounded-xl border border-slate-800">
							<div class="w-24 shrink-0 font-bold text-green-400">202</div>
							<div>
								<div class="text-white font-semibold">Accepted</div>
								<div class="text-sm text-slate-400">Message is valid and queued. Returns a <code>job_id</code>.</div>
							</div>
						</div>
						<div class="flex items-start p-4 bg-slate-900/50 rounded-xl border border-slate-800">
							<div class="w-24 shrink-0 font-bold text-orange-400">400</div>
							<div>
								<div class="text-white font-semibold">Bad Request</div>
								<div class="text-sm text-slate-400">Malformed JSON or missing recipient/type.</div>
							</div>
						</div>
						<div class="flex items-start p-4 bg-slate-900/50 rounded-xl border border-slate-800">
							<div class="w-24 shrink-0 font-bold text-red-400">429</div>
							<div>
								<div class="text-white font-semibold">Too Many Requests</div>
								<div class="text-sm text-slate-400">You've exceeded the rate limits for your account.</div>
							</div>
						</div>
					</div>
				</section>

				<section id="integration" class="scroll-mt-24 mb-16">
					<h2>Integration Snippet</h2>
					<p>Copy this snippet to quickly test your connection to Bhejna infrastructure.</p>
					<pre><code>curl -X POST https://api.bhejna.codenxtlab.tech/v1/messages \
  -H "Authorization: Bearer nxt_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{'{'}
    "recipient": "15551234567",
    "message_type": "template",
    "payload": {'{'}
      "name": "sample_template",
      "language": {'{'} "code": "en_US" {'}'}
    {'}'}
  {'}'}'</code></pre>
				</section>

				<section id="webhooks" class="scroll-mt-24 mb-24">
					<h2>Webhooks</h2>
					<p>
						Enable Webhooks in the dashboard to receive real-time updates when messages are delivered, read, or fail. 
						All requests are signed for security.
					</p>
					<div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
						<h5 class="mt-0 text-white">Signature Verification</h5>
						<p class="text-sm text-slate-400">
							Compute an HMAC SHA-256 hash of the raw body using your secret and compare it to <code>X-Bhejna-Signature</code>.
						</p>
						<pre class="mb-0"><code>const hash = crypto.createHmac('sha256', secret)
  .update(rawBody)
  .digest('hex');</code></pre>
					</div>
				</section>
			</div>

			<footer class="mt-24 pb-12 border-t border-slate-800 pt-8 flex justify-between items-center text-slate-500 text-sm">
				<p>© 2026 CodeNxtLab. All rights reserved.</p>
				<div class="flex space-x-6">
					<a href="#" class="hover:text-white transition-colors">Privacy</a>
					<a href="#" class="hover:text-white transition-colors">Terms</a>
					<a href="#" class="hover:text-white transition-colors">Status</a>
				</div>
			</footer>
		</main>
	</div>
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
	
	/* Custom scrollbar for premium feel */
	::-webkit-scrollbar {
		width: 10px;
	}
	::-webkit-scrollbar-track {
		background: #020617;
	}
	::-webkit-scrollbar-thumb {
		background: #1e293b;
		border-radius: 5px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: #334155;
	}
</style>
