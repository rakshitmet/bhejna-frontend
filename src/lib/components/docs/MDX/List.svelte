<script lang="ts">
	let { children, ordered = false } = $props();
</script>

{#if ordered}
	<ol class="my-6 ml-6 list-decimal space-y-2 text-slate-400">
		{@render children()}
	</ol>
{:else}
	<ul class="my-6 ml-6 list-disc space-y-2 text-slate-400">
		{@render children()}
	</ul>
{/if}
