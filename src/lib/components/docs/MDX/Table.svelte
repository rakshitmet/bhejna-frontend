<script lang="ts">
	let { children } = $props();
</script>

<div class="my-8 w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/20">
	<table class="w-full text-left text-sm border-collapse">
		{@render children()}
	</table>
</div>

<style>
	:global(table thead) {
		background-color: rgb(15 23 42 / 0.5);
		border-bottom-width: 1px;
		border-color: rgb(30 41 59);
	}
	:global(table th) {
		padding: 0.75rem 1.5rem;
		font-weight: 700;
		color: white;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.75rem;
	}
	:global(table td) {
		padding: 1rem 1.5rem;
		border-bottom-width: 1px;
		border-color: rgb(30 41 59 / 0.5);
		color: rgb(148 163 184);
	}
	:global(table tr:last-child td) {
		border-bottom-width: 0px;
	}
</style>
