<script lang="ts">
	import { Copy, Check, Terminal, Globe, Cpu } from 'lucide-svelte';
	import { onMount } from 'svelte';

	interface CodeExample {
		lang: string;
		label: string;
		code: string;
	}

	let { examples = [] }: { examples: CodeExample[] } = $props();
	let activeIndex = $state(0);
	let copied = $state(false);

	const activeExample = $derived(examples[activeIndex]);

	async function copyToClipboard() {
		if (!activeExample) return;
		await navigator.clipboard.writeText(activeExample.code);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	const langIcons: Record<string, any> = {
		curl: Terminal,
		bash: Terminal,
		javascript: Globe,
		typescript: Globe,
		python: Cpu,
		go: Cpu
	};
</script>

<div class="my-8 rounded-xl border border-slate-800 bg-[#0f172a] overflow-hidden shadow-2xl group/code">
	<!-- Header / Tabs -->
	<div class="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800">
		<div class="flex items-center gap-1 overflow-x-auto no-scrollbar">
			{#each examples as example, i}
				<button
					onclick={() => (activeIndex = i)}
					class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 whitespace-nowrap
						{activeIndex === i 
							? 'bg-slate-800 text-white shadow-sm' 
							: 'text-slate-500 hover:text-slate-300'}"
				>
					{#if langIcons[example.lang.toLowerCase()]}
						{@const Icon = langIcons[example.lang.toLowerCase()]}
						<Icon size={12} />
					{/if}
					{example.label}
				</button>
			{/each}
		</div>

		<button
			onclick={copyToClipboard}
			class="p-2 text-slate-500 hover:text-white transition-colors rounded-lg bg-slate-800/0 hover:bg-slate-800"
			title="Copy to clipboard"
		>
			{#if copied}
				<Check size={14} class="text-green-500" />
			{:else}
				<Copy size={14} />
			{/if}
		</button>
	</div>

	<!-- Code Area -->
	<div class="relative p-6 overflow-x-auto font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
		<pre class="m-0"><code class="text-slate-300">{activeExample?.code}</code></pre>
	</div>
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
