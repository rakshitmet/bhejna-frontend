<script lang="ts">
	import { Copy, Check } from 'lucide-svelte';
	
	let { children } = $props();
	let copied = $state(false);
	let preElement: HTMLPreElement | undefined = $state();

	async function copyCode() {
		if (!preElement) return;
		const code = preElement.innerText;
		await navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="group relative my-8 rounded-xl border border-white/[0.05] bg-[#111827]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
	<button
		onclick={copyCode}
		class="absolute right-4 top-4 p-2 text-slate-500 hover:text-white transition-opacity opacity-0 group-hover:opacity-100 rounded-lg bg-white/[0.05] backdrop-blur-sm z-10"
		title="Copy code"
	>
		{#if copied}
			<Check size={14} class="text-[#2563EB]" />
		{:else}
			<Copy size={14} />
		{/if}
	</button>
	
	<pre bind:this={preElement} class="m-0 p-6 bg-[#0B1120] overflow-x-auto font-mono text-sm text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-white/[0.05] scrollbar-track-transparent">
		{@render children()}
	</pre>
</div>
