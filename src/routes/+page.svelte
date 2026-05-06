<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';

	onMount(async () => {
		const { data: { session } } = await supabase.auth.getSession();
		if (session) {
			goto('/dashboard');
		} else {
			goto('/login');
		}
	});
</script>

<div class="min-h-screen bg-slate-950 flex items-center justify-center">
	<div class="animate-pulse text-cyan-500 font-bold text-xl">Loading Bhejna...</div>
</div>
