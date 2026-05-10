<script lang="ts">
	import { Terminal, Shield, ArrowRight, CornerDownRight, Zap, Code2, Webhook, Box } from 'lucide-svelte';
	// import { operations, webhooks, type OperationId, type WebhookKey } from '$lib/generated/openapi'; // REMOVED
	import CodeGroup from './CodeGroup.svelte';
	import SchemaTable from './SchemaTable.svelte';

	let { opData, minimal = false }: { opData: any, minimal?: boolean } = $props();

	// Parse opData if it's passed as a JSON string (from rehype)
	const op = $derived.by(() => {
		if (typeof opData === 'string') {
			try {
				return JSON.parse(opData);
			} catch (e) {
				return null;
			}
		}
		return opData;
	});

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
		const samples = op?.['x-codeSamples']?.map((sample: any) => ({
			lang: sample.lang,
			label: sample.label,
			code: sample.source,
			highlightedCode: sample.highlightedSource
		})) || [];

		// Generate default curl if no samples exist and it's not a webhook
		if (samples.length === 0 && !isWebhook && op?.path) {
			let curl = `curl -X ${op.method} "https://api.bhejna.com${op.path}" \\\n`;
			curl += `  -H "Authorization: Bearer YOUR_API_KEY" \\\n`;
			curl += `  -H "Content-Type: application/json"`;
			
			if (requestExample) {
				curl += ` \\\n  -d '${JSON.stringify(requestExample, null, 2)}'`;
			}
			
			samples.push({
				lang: 'bash',
				label: 'cURL',
				code: curl
			});
		}

		return samples;
	});

	// Extract Request Body schema if it exists
	const requestSchema = $derived(
		op?.requestBody?.content?.['application/json']?.schema
	);

	// Extract Success Response (200, 201, 202, or 204)
	const successResponse = $derived(
		op?.responses?.['200'] || op?.responses?.['201'] || op?.responses?.['202'] || op?.responses?.['204']
	);

	const responseSchema = $derived(
		successResponse?.content?.['application/json']?.schema
	);

	// Examples
	const requestExample = $derived(
		op?.requestBody?.content?.['application/json']?.example || 
		op?.requestBody?.content?.['application/json']?.examples?.default?.value
	);

	const responseExample = $derived(
		successResponse?.content?.['application/json']?.example || 
		successResponse?.content?.['application/json']?.examples?.default?.value
	);
</script>

{#if op}
	{#if minimal}
		<div class="my-8">
			<CodeGroup examples={codeSamples} />
		</div>
	{:else}
		<div class="my-12 rounded-3xl border border-slate-800/60 bg-[#0f172a]/20 overflow-hidden shadow-2xl shadow-cyan-500/5">
			<!-- Header/Endpoint Strip -->
			<div class="px-8 py-6 bg-slate-900/40 border-b border-slate-800/60">
				<div class="flex flex-wrap items-center gap-4 mb-4">
					{#if isWebhook}
						<span class="px-3 py-1 text-[10px] font-black rounded-lg border {methodColors.WEBHOOK} tracking-widest flex items-center gap-1.5">
							<Webhook size={12} />
							WEBHOOK
						</span>
					{:else}
						<span class="px-3 py-1 text-[10px] font-black rounded-lg border {methodColors[op.method]} tracking-widest">{op.method}</span>
						<code class="text-sm font-mono text-cyan-400/90 font-bold">{op.path}</code>
					{/if}
				</div>
				<h3 class="text-2xl font-black text-white m-0 tracking-tight">{op.summary || operationId}</h3>
				<p class="text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">{op.description || ''}</p>
			</div>

			<div class="p-8">
				<!-- Parameters Section -->
				{#if op.parameters && op.parameters.length > 0}
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
										<span class="text-[9px] text-slate-500 font-mono uppercase tracking-tighter bg-slate-800/50 px-2 py-0.5 rounded">In: {param.in}</span>
									</div>
									<div class="flex items-center gap-2 mb-2">
										<span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{param.schema?.type || 'string'}</span>
										{#if param.required}
											<span class="text-[9px] font-black text-red-500 uppercase">Required</span>
										{/if}
									</div>
									<p class="text-xs text-slate-400 m-0 leading-relaxed">{param.description}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Request Body Section -->
				{#if requestSchema}
					<div class="mb-12">
						<SchemaTable schema={requestSchema} title={isWebhook ? "Event Payload" : "Request Body (JSON)"} />
						
						{#if requestExample}
							<div class="mt-6">
								<h6 class="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Payload Example</h6>
								<div class="rounded-xl overflow-hidden border border-slate-800">
									<CodeGroup examples={[{ 
										lang: 'json', 
										label: 'Example', 
										code: JSON.stringify(requestExample, null, 2),
										highlightedCode: op.highlightedRequestExample
									}]} />
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Code Samples -->
				{#if codeSamples.length > 0}
					<div class="mb-12">
						<h5 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
							<Zap size={14} class="text-yellow-500" />
							Implementation Examples
						</h5>
						<CodeGroup examples={codeSamples} />
					</div>
				{/if}

				<!-- Response Section -->
				{#if successResponse}
					<div class="mt-12 pt-8 border-t border-slate-800/60">
						<div class="flex items-center justify-between mb-6">
							<h5 class="text-xs font-bold text-slate-500 uppercase tracking-widest m-0 flex items-center gap-2">
								<CornerDownRight size={14} class="text-green-500" />
								Success Response
							</h5>
							<span class="text-[10px] font-bold text-green-400 bg-green-400/5 px-2 py-0.5 rounded border border-green-400/10">
								HTTP {op.responses?.['201'] ? '201' : (op.responses?.['202'] ? '202' : (op.responses?.['204'] ? '204' : '200'))}
							</span>
						</div>
						
						{#if responseSchema}
							<SchemaTable schema={responseSchema} title="Response Schema" />
						{/if}

						{#if responseExample}
							<div class="mt-6">
								<h6 class="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Response Example</h6>
								<div class="rounded-xl overflow-hidden border border-slate-800">
									<CodeGroup examples={[{ 
										lang: 'json', 
										label: 'Example', 
										code: JSON.stringify(responseExample, null, 2),
										highlightedCode: op.highlightedResponseExample
									}]} />
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}
{:else}
	<div class="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
		Error: Operation or Webhook data not found in canonical API registry.
	</div>
{/if}

