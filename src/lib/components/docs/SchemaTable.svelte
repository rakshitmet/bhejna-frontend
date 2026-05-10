<script lang="ts">
	import { CornerDownRight, Hash, Type, Braces } from 'lucide-svelte';
	// Recursive import
	import SchemaTableSelf from './SchemaTable.svelte';

	interface SchemaProperty {
		type?: string;
		description?: string;
		enum?: any[];
		items?: any;
		properties?: Record<string, any>;
		required?: string[];
		format?: string;
		pattern?: string;
		example?: any;
	}

	let { 
		schema: schemaProp,
		schemaData, 
		title = 'Schema Properties',
		level = 0 
	}: { 
		schema?: SchemaProperty;
		schemaData?: any;
		title?: string;
		level?: number;
	} = $props();

	// Resolve schema from either prop
	const schema = $derived.by(() => {
		if (schemaData) {
			return typeof schemaData === 'string' ? JSON.parse(schemaData) : schemaData;
		}
		return schemaProp;
	});

	const getRequired = (propName: string) => {
		return schema?.required?.includes(propName) || false;
	};

	const getTypeLabel = (prop: any) => {
		if (prop.type === 'array' && prop.items?.type) {
			return `array<${prop.items.type}>`;
		}
		if (prop.oneOf) return 'oneOf';
		if (prop.allOf) return 'allOf';
		return prop.type || 'object';
	};
</script>

<div class="mt-4 {level === 0 ? 'mb-8' : ''}">
	{#if level === 0 && schema}
		<h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
			<Braces size={14} />
			{title}
		</h5>
	{/if}

	<div class="space-y-3">
		{#if schema?.properties}
			{#each Object.entries(schema.properties) as [name, prop]}
				<div class="group relative flex flex-col p-4 rounded-xl border border-slate-800/60 bg-slate-900/10 hover:bg-slate-900/30 transition-colors">
					<div class="flex items-center justify-between mb-2">
						<div class="flex items-center gap-2">
							<code class="text-cyan-400 font-bold text-sm tracking-tight">{name}</code>
							<span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 uppercase font-bold font-mono">
								{getTypeLabel(prop)}
								{#if prop.format}
									<span class="ml-1 opacity-50">({prop.format})</span>
								{/if}
							</span>
						</div>
						<div class="flex items-center gap-2">
							{#if getRequired(name)}
								<span class="text-[10px] font-black text-red-500/80 uppercase tracking-tighter bg-red-500/5 px-1.5 py-0.5 rounded border border-red-500/10">Required</span>
							{:else}
								<span class="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Optional</span>
							{/if}
						</div>
					</div>

					{#if prop.description}
						<p class="text-sm text-slate-400 m-0 leading-relaxed">{prop.description}</p>
					{/if}

					{#if prop.enum}
						<div class="mt-3 flex flex-wrap gap-1.5">
							{#each prop.enum as val}
								<code class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/5 text-cyan-400/70 border border-cyan-500/10">"{val}"</code>
							{/each}
						</div>
					{/if}

					{#if prop.pattern}
						<div class="mt-2 flex items-center gap-2 text-[10px] text-slate-600 font-mono">
							<Hash size={10} />
							<span>Regex: <code>{prop.pattern}</code></span>
						</div>
					{/if}

					<!-- Nested Objects (Recursive) -->
					{#if prop.properties}
						<div class="mt-4 pl-4 border-l border-slate-800">
							<SchemaTableSelf schema={prop} level={level + 1} />
						</div>
					{/if}
				</div>
			{/each}
		{:else if schema?.oneOf || schema?.allOf}
			<div class="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/5">
				<p class="text-xs text-slate-500 italic">This property uses a complex type ({schema.oneOf ? 'oneOf' : 'allOf'}). See schema details for more information.</p>
			</div>
		{/if}
	</div>
</div>
