<script lang="ts">
	import { Terminal, Shield, ArrowRight, CornerDownRight } from 'lucide-svelte';

	interface Parameter {
		name: string;
		type: string;
		required: boolean;
		description: string;
	}

	let { 
		method = 'GET', 
		path = '/', 
		summary, 
		description,
		parameters = [],
		responseBody
	}: { 
		method?: string, 
		path?: string, 
		summary?: string, 
		description?: string,
		parameters?: Parameter[],
		responseBody?: string
	} = $props();

	const methodColors: Record<string, string> = {
		GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
		POST: 'bg-green-500/10 text-green-400 border-green-500/20',
		PUT: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
		DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
		PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
	};
</script>

<div class="my-12 rounded-2xl border border-slate-800 bg-[#0f172a]/30 overflow-hidden shadow-sm">
	<!-- Header -->
	<div class="px-6 py-4 bg-slate-900/50 border-b border-slate-800">
		<div class="flex flex-wrap items-center gap-4 mb-2">
			<span class="px-2.5 py-1 text-xs font-black rounded border {methodColors[method]}">{method}</span>
			<code class="text-sm font-mono text-slate-100">{path}</code>
		</div>
		{#if summary}
			<h4 class="text-lg font-bold text-white mt-2 mb-0">{summary}</h4>
		{/if}
	</div>

	<!-- Content -->
	<div class="p-6">
		{#if description}
			<p class="text-sm text-slate-400 leading-relaxed mb-8">{description}</p>
		{/if}

		{#if parameters.length > 0}
			<h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
				<Terminal size={14} />
				Parameters
			</h5>
			<div class="space-y-4 mb-8">
				{#each parameters as param}
					<div class="flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/20">
						<div class="shrink-0 flex flex-col items-center gap-1">
							<code class="text-cyan-400 font-bold">{param.name}</code>
							<span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 uppercase font-bold">{param.type}</span>
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2 mb-1">
								{#if param.required}
									<span class="text-[10px] font-black text-red-500 uppercase tracking-tighter">Required</span>
								{:else}
									<span class="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Optional</span>
								{/if}
							</div>
							<p class="text-sm text-slate-400 m-0">{param.description}</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		{#if responseBody}
			<h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
				<CornerDownRight size={14} />
				Response Body
			</h5>
			<div class="rounded-xl border border-slate-800 bg-[#020617] p-4 font-mono text-xs leading-relaxed overflow-x-auto">
				<pre class="m-0 text-slate-400">{responseBody}</pre>
			</div>
		{/if}
	</div>
</div>
