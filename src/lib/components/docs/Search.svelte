<script lang="ts">
	import { Search as SearchIcon, X, CornerDownLeft, FileText, Hash } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let { isOpen = $bindable(false) } = $props();
	let searchQuery = $state('');
	let selectedIndex = $state(0);

	const results = $derived(
		searchQuery.length < 2 
			? [] 
			: [
				{ title: 'Overview', href: '/docs', category: 'Introduction' },
				{ title: 'Quickstart', href: '/docs/quickstart', category: 'Introduction' },
				{ title: 'API Keys', href: '/docs/authentication', category: 'Authentication' },
				{ title: 'Send Message', href: '/docs/api-reference/send-message', category: 'API Reference' },
				{ title: 'Webhooks', href: '/docs/webhooks', category: 'Integrations' },
				{ title: 'Error Reference', href: '/docs/errors', category: 'Integrations' }
			].filter(item => 
				item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
				item.category.toLowerCase().includes(searchQuery.toLowerCase())
			)
	);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			isOpen = !isOpen;
		}
		if (!isOpen) return;

		if (e.key === 'Escape') isOpen = false;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = (selectedIndex + 1) % results.length;
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = (selectedIndex - 1 + results.length) % results.length;
		}
		if (e.key === 'Enter' && results[selectedIndex]) {
			e.preventDefault();
			window.location.href = results[selectedIndex].href;
			isOpen = false;
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	$effect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			const input = document.getElementById('search-input');
			input?.focus();
		} else {
			document.body.style.overflow = 'unset';
			searchQuery = '';
		}
	});
</script>

{#if isOpen}
	<div 
		transition:fade={{ duration: 150 }}
		class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-4 sm:p-6 md:p-20 flex justify-center items-start"
		onclick={() => (isOpen = false)}
		onkeydown={(e) => e.key === 'Escape' && (isOpen = false)}
		role="button"
		tabindex="0"
	>
		<div 
			transition:fly={{ y: -20, duration: 200 }}
			class="w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="none"
		>
			<div class="flex items-center gap-4 px-6 py-4 border-b border-slate-800">
				<SearchIcon size={20} class="text-slate-500" />
				<input 
					id="search-input"
					bind:value={searchQuery}
					placeholder="Search documentation..."
					class="flex-1 bg-transparent border-none text-white focus:outline-none text-lg"
					autocomplete="off"
				/>
				<button 
					onclick={() => (isOpen = false)}
					class="p-1 text-slate-500 hover:text-white transition-colors"
				>
					<X size={18} />
				</button>
			</div>

			<div class="max-h-[60vh] overflow-y-auto p-2">
				{#if results.length > 0}
					{#each results as result, i}
						<a 
							href={result.href}
							class="flex items-center justify-between p-4 rounded-xl transition-all group
								{selectedIndex === i ? 'bg-cyan-500/10 border border-cyan-500/20' : 'border border-transparent hover:bg-slate-800/40'}"
							onmouseenter={() => (selectedIndex = i)}
							onclick={() => (isOpen = false)}
						>
							<div class="flex items-center gap-4">
								<div class="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:text-cyan-400 transition-colors">
									<FileText size={18} />
								</div>
								<div>
									<div class="text-sm font-bold text-white mb-1">{result.title}</div>
									<div class="text-xs text-slate-500 flex items-center gap-1">
										<Hash size={10} />
										{result.category}
									</div>
								</div>
							</div>
							<CornerDownLeft size={16} class="text-slate-700 {selectedIndex === i ? 'text-cyan-500' : ''}" />
						</a>
					{/each}
				{:else if searchQuery.length >= 2}
					<div class="p-12 text-center text-slate-500">
						No results found for "<span class="text-white">{searchQuery}</span>"
					</div>
				{:else}
					<div class="p-12 text-center text-slate-500">
						Type at least 2 characters to search...
					</div>
				{/if}
			</div>

			<div class="px-6 py-3 bg-slate-900/50 border-t border-slate-800 flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
				<div class="flex items-center gap-1.5">
					<kbd class="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">↵</kbd>
					<span>Select</span>
				</div>
				<div class="flex items-center gap-1.5">
					<kbd class="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">↑↓</kbd>
					<span>Navigate</span>
				</div>
				<div class="flex items-center gap-1.5">
					<kbd class="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">ESC</kbd>
					<span>Close</span>
				</div>
			</div>
		</div>
	</div>
{/if}
