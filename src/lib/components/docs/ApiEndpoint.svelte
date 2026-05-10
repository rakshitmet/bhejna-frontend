<script lang="ts">
	import { Terminal, CornerDownRight, Zap, Webhook } from 'lucide-svelte';
	import CodeGroup from './CodeGroup.svelte';
	import SchemaTable from './SchemaTable.svelte';
	// Import from the non-server registry file (populated by the OpenAPI compiler).
	// All docs pages have csr=false + prerender=true, so this only runs on the server.
	import { operations } from '$lib/generated/openapi';

	// Props: operationId is the primary resolution key.
	// opData (pre-serialized JSON string from rehype) is accepted as a fallback
	// but is no longer the primary path — the component resolves its own data.
	let {
		operationId = undefined,
		opData = undefined,
		minimal = false
	}: { operationId?: string; opData?: any; minimal?: boolean } = $props();

	// Resolve the operation record from the registry.
	// Priority: pre-resolved opData (from rehype injection) → registry lookup by operationId
	const op = $derived.by(() => {
		// Path 1: opData injected by rehype plugin (string or object)
		if (opData !== undefined && opData !== null) {
			if (typeof opData === 'string') {
				try {
					const parsed = JSON.parse(opData);
					return parsed;
				} catch (e) {
					console.error(`[ApiEndpoint] Failed to parse injected opData:`, e);
					// Fall through to registry lookup
				}
			} else {
				return opData;
			}
		}

		// Path 2 (primary): Look up directly from the compiled registry by operationId.
		if (operationId) {
			const found = (operations as Record<string, any>)[operationId];
			if (!found) {
				// Emit structured diagnostic for easier debugging
				const available = Object.keys(operations as Record<string, any>);
				console.error(
					`[ApiEndpoint] Registry lookup failed.\n` +
					`  operationId: "${operationId}"\n` +
					`  Available:   [${available.join(', ')}]\n` +
					`  Fix: ensure the operationId exists in openapi.yaml and re-run the compiler.`
				);
			}
			return found ?? null;
		}

		return null;
	});

	// Diagnostic data for the error UI
	const availableIds = $derived(Object.keys(operations as Record<string, any>));
	const isWebhook = $derived(!!op?.isWebhook);

	const methodColors: Record<string, string> = {
		GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
		POST: 'bg-green-500/10 text-green-400 border-green-500/20',
		PUT: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
		DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
		PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
		WEBHOOK: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
	};

	// Map OpenAPI x-codeSamples to CodeGroup format
	const codeSamples = $derived.by(() => {
		const samples =
			op?.['x-codeSamples']?.map((sample: any) => ({
				lang: sample.lang,
				label: sample.label,
				code: sample.source,
				highlightedCode: sample.highlightedSource
			})) ?? [];

		// Auto-generate a cURL sample if none are defined and it's a regular endpoint
		if (samples.length === 0 && !isWebhook && op?.path) {
			const body = requestExample ? ` \\\n  -d '${JSON.stringify(requestExample, null, 2)}'` : '';
			const curl =
				`curl -X ${op.method} "https://api.bhejna.com${op.path}" \\\n` +
				`  -H "Authorization: Bearer YOUR_API_KEY" \\\n` +
				`  -H "Content-Type: application/json"` +
				body;

			samples.push({ lang: 'bash', label: 'cURL', code: curl });
		}

		return samples;
	});

	const requestSchema = $derived(op?.requestBody?.content?.['application/json']?.schema);

	const successResponse = $derived(
		op?.responses?.['200'] ??
		op?.responses?.['201'] ??
		op?.responses?.['202'] ??
		op?.responses?.['204']
	);

	const responseSchema = $derived(successResponse?.content?.['application/json']?.schema);

	const requestExample = $derived(
		op?.requestBody?.content?.['application/json']?.example ??
		op?.requestBody?.content?.['application/json']?.examples?.default?.value
	);

	const responseExample = $derived(
		successResponse?.content?.['application/json']?.example ??
		successResponse?.content?.['application/json']?.examples?.default?.value
	);
</script>

{#if op}
	{#if minimal}
		<div class="my-8">
			<CodeGroup examples={codeSamples} />
		</div>
	{:else}
		<div
			class="my-12 rounded-3xl border border-slate-800/60 bg-[#0f172a]/20 overflow-hidden shadow-2xl shadow-cyan-500/5"
		>
			<!-- Header / Endpoint Strip -->
			<div class="px-8 py-6 bg-slate-900/40 border-b border-slate-800/60">
				<div class="flex flex-wrap items-center gap-4 mb-4">
					{#if isWebhook}
						<span
							class="px-3 py-1 text-[10px] font-black rounded-lg border {methodColors.WEBHOOK} tracking-widest flex items-center gap-1.5"
						>
							<Webhook size={12} />
							WEBHOOK
						</span>
					{:else}
						<span
							class="px-3 py-1 text-[10px] font-black rounded-lg border {methodColors[op.method] ?? ''} tracking-widest"
						>{op.method}</span>
						<code class="text-sm font-mono text-cyan-400/90 font-bold">{op.path}</code>
					{/if}
				</div>
				<h3 class="text-2xl font-black text-white m-0 tracking-tight">
					{op.summary ?? op.operationId ?? operationId}
				</h3>
				<p class="text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">{op.description ?? ''}</p>
			</div>

			<div class="p-8">
				<!-- Parameters -->
				{#if op.parameters?.length > 0}
					<div class="mb-12">
						<h5 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
							<Terminal size={14} class="text-cyan-500" />
							Parameters
						</h5>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each op.parameters as param}
								<div class="flex flex-col p-4 rounded-2xl border border-slate-800/40 bg-slate-900/10">
									<div class="flex items-center justify-between mb-2">
										<code class="text-cyan-400 font-bold">{param.name}</code>
										<span
											class="text-[9px] text-slate-500 font-mono uppercase tracking-tighter bg-slate-800/50 px-2 py-0.5 rounded"
										>In: {param.in}</span>
									</div>
									<div class="flex items-center gap-2 mb-2">
										<span
											class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono"
										>{param.schema?.type ?? 'any'}</span>
										{#if param.required}
											<span class="text-[9px] font-black text-red-500 uppercase">Required</span>
										{/if}
									</div>
									<p class="text-xs text-slate-400 m-0 leading-relaxed">{param.description ?? ''}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Request Body -->
				{#if requestSchema}
					<div class="mb-12">
						<SchemaTable
							schema={requestSchema}
							title={isWebhook ? 'Event Payload' : 'Request Body (JSON)'}
						/>
						{#if requestExample}
							<div class="mt-6">
								<h6 class="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">
									Payload Example
								</h6>
								<div class="rounded-xl overflow-hidden border border-slate-800">
									<CodeGroup
										examples={[{
											lang: 'json',
											label: 'Example',
											code: JSON.stringify(requestExample, null, 2),
											highlightedCode: op.highlightedRequestExample
										}]}
									/>
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Code Samples -->
				{#if codeSamples.length > 0}
					<div class="mb-12">
						<h5
							class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"
						>
							<Zap size={14} class="text-yellow-500" />
							Implementation Examples
						</h5>
						<CodeGroup examples={codeSamples} />
					</div>
				{/if}

				<!-- Success Response -->
				{#if successResponse}
					<div class="mt-12 pt-8 border-t border-slate-800/60">
						<div class="flex items-center justify-between mb-6">
							<h5
								class="text-xs font-bold text-slate-500 uppercase tracking-widest m-0 flex items-center gap-2"
							>
								<CornerDownRight size={14} class="text-green-500" />
								Success Response
							</h5>
							<span
								class="text-[10px] font-bold text-green-400 bg-green-400/5 px-2 py-0.5 rounded border border-green-400/10"
							>
								HTTP {op.responses?.['201']
									? '201'
									: op.responses?.['202']
									? '202'
									: op.responses?.['204']
									? '204'
									: '200'}
							</span>
						</div>

						{#if responseSchema}
							<SchemaTable schema={responseSchema} title="Response Schema" />
						{/if}

						{#if responseExample}
							<div class="mt-6">
								<h6
									class="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3"
								>
									Response Example
								</h6>
								<div class="rounded-xl overflow-hidden border border-slate-800">
									<CodeGroup
										examples={[{
											lang: 'json',
											label: 'Example',
											code: JSON.stringify(responseExample, null, 2),
											highlightedCode: op.highlightedResponseExample
										}]}
									/>
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}
{:else}
	<!-- Structured diagnostic error — shows exactly what failed and what's available -->
	<div class="my-8 p-6 rounded-xl border border-red-500/30 bg-red-950/20 font-mono text-xs space-y-4">
		<div class="text-red-400 font-bold text-sm flex items-center gap-2">
			<span>✗</span> ApiEndpoint: Registry Resolution Failed
		</div>

		{#if operationId}
			<div class="space-y-1">
				<div class="text-slate-500">Requested <code class="text-slate-400">operationId</code>:</div>
				<div class="text-red-300 bg-red-950/40 px-3 py-1.5 rounded border border-red-800/40">
					"{operationId}"
				</div>
			</div>
		{:else}
			<div class="text-yellow-400">
				⚠ No <code>operationId</code> or <code>opData</code> prop provided.
			</div>
		{/if}

		<div class="space-y-2">
			<div class="text-slate-500">
				Available operationIds in registry <span class="text-slate-600">({availableIds.length})</span>:
			</div>
			{#if availableIds.length > 0}
				<div class="bg-slate-900/60 rounded-lg p-3 border border-slate-800/60 space-y-1">
					{#each availableIds as id}
						<div class="text-slate-300">
							— {id}
							{#if (operations as any)[id]?.isWebhook}
								<span class="text-indigo-400 text-[9px] ml-2 uppercase tracking-wider">webhook</span>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-yellow-400 bg-yellow-950/20 px-3 py-2 rounded border border-yellow-600/20">
					⚠ Registry is empty! Run the compiler: <code class="text-yellow-300">npm run generate:api</code>
				</div>
			{/if}
		</div>

		<div class="text-slate-600 border-t border-slate-800/60 pt-3">
			If the operationId exists in <code class="text-slate-500">openapi.yaml</code> but is not
			listed above, re-run <code class="text-slate-500">npm run generate:api</code> to regenerate
			the registry.
		</div>
	</div>
{/if}
