<script lang="ts">
	let { children } = $props();
</script>

<blockquote class="border-l-4 border-cyan-500/50 bg-cyan-500/5 px-6 py-4 my-8 rounded-r-xl italic text-slate-300">
	{@render children()}
</blockquote>
