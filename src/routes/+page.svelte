<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';

	onMount(async () => {
		const { data: { user } } = await supabase.auth.getUser();
		if (user) {
			goto('/dashboard');
		} else {
			goto('/login');
		}
	});
</script>

<div class="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
	<img src="/favicon.svg" alt="Bhejna Logo" class="w-16 h-16 mb-6 animate-pulse" />
	<div class="animate-pulse text-cyan-500 font-bold text-xl">Loading Bhejna...</div>
</div>
