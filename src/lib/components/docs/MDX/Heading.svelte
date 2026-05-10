<script lang="ts">
	let { level, children, id } = $props();
	
	const Tag = $derived(`h${level}` as const);
</script>

<svelte:element this={Tag} {id} class="group relative">
	<a 
		href="#{id}" 
		class="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-cyan-400 no-underline"
		aria-hidden="true"
	>
		#
	</a>
	{@render children()}
</svelte:element>
