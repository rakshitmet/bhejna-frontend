<script lang="ts">
	import { page } from '$app/stores';
	import Sidebar from './Sidebar.svelte';
	import Search from './Search.svelte';
	import { Menu, X, ChevronRight, Globe, Search as SearchIcon, Hash } from 'lucide-svelte';
	import { onMount, tick } from 'svelte';
	import { extractToc, type TocItem } from '$lib/utils/toc';

	let { children } = $props();
	let isSidebarOpen = $state(false);
	let isSearchOpen = $state(false);
	let toc = $state<TocItem[]>([]);
	let contentElement = $state<HTMLElement>();

	const toggleSidebar = () => (isSidebarOpen = !isSidebarOpen);
	const toggleSearch = () => (isSearchOpen = !isSearchOpen);

	// Update TOC when children change or on mount
	$effect(() => {
		const _ = $page.url.pathname;
		tick().then(() => {
			if (contentElement) {
				toc = extractToc(contentElement);
			}
		});
		isSidebarOpen = false;
	});

	onMount(() => {
		if (contentElement) {
			toc = extractToc(contentElement);
		}
	});
</script>

<div class="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30">
	<!-- Top Navigation -->
	<nav class="sticky top-0 z-50 border-b border-slate-800/60 bg-[#020617]/80 backdrop-blur-md">
		<div class="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<button 
					onclick={toggleSidebar}
					class="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
					aria-label="Toggle navigation"
				>
					{#if isSidebarOpen}
						<X size={20} />
					{:else}
						<Menu size={20} />
					{/if}
				</button>
				<a href="/" class="flex items-center gap-2 group">
					<img src="/favicon.svg" alt="Bhejna" class="w-8 h-8 group-hover:scale-110 transition-transform" />
					<span class="text-xl font-bold tracking-tight text-white">Bhejna</span>
				</a>
				<span class="hidden sm:block mx-2 text-slate-800">/</span>
				<span class="hidden sm:block text-sm font-medium text-slate-500">Docs</span>
			</div>

			<div class="flex items-center gap-6">
				<button 
					onclick={toggleSearch}
					class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-500 hover:text-slate-300 transition-all text-sm w-64"
				>
					<SearchIcon size={14} />
					<span>Search documentation...</span>
					<kbd class="ml-auto text-[10px] font-sans opacity-50 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">⌘K</kbd>
				</button>
				
				<div class="h-4 w-[1px] bg-slate-800 hidden md:block"></div>
				
				<a href="/dashboard" class="text-sm font-medium text-slate-400 hover:text-white transition-colors">Dashboard</a>
				<a href="https://github.com/codenxtlab/bhejna" target="_blank" class="text-slate-400 hover:text-white transition-colors" aria-label="GitHub Repository">
					<Globe size={20} />
				</a>
			</div>
		</div>
	</nav>

	<Search bind:isOpen={isSearchOpen} />

	<div class="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex gap-8">
		<!-- Mobile Sidebar Overlay -->
		{#if isSidebarOpen}
			<div 
				onclick={toggleSidebar}
				class="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
				onkeydown={(e) => e.key === 'Escape' && toggleSidebar()}
				role="button"
				tabindex="0"
			></div>
		{/if}

		<!-- Sidebar -->
		<aside 
			class="fixed inset-y-0 left-0 z-50 w-72 bg-[#020617] border-r border-slate-800/60 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-0 lg:bg-transparent lg:border-none {isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
		>
			<div class="h-full overflow-y-auto lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16 pt-8 pb-12 px-4 lg:px-0">
				<Sidebar />
			</div>
		</aside>

		<!-- Content -->
		<main class="flex-1 min-w-0 py-12 lg:py-16">
			<nav class="flex items-center gap-2 text-xs font-medium text-slate-500 mb-8" aria-label="Breadcrumbs">
				<a href="/docs" class="hover:text-cyan-400 transition-colors">Docs</a>
				<ChevronRight size={12} />
				<span class="text-slate-300 capitalize">{$page.url.pathname.split('/').pop()?.replace(/-/g, ' ')}</span>
			</nav>

			<div bind:this={contentElement} class="prose prose-invert prose-slate max-w-none 
				prose-headings:scroll-mt-24
				prose-h1:text-4xl prose-h1:font-black prose-h1:tracking-tight prose-h1:mb-8 prose-h1:text-white
				prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-white
				prose-p:leading-relaxed prose-p:text-slate-400 prose-p:text-base
				prose-a:text-cyan-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
				prose-strong:text-white prose-strong:font-bold
				prose-code:text-cyan-300 prose-code:bg-cyan-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
				prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0
				prose-hr:border-slate-800/60
			">
				{@render children()}
			</div>

			<footer class="mt-20 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
				<p>© 2026 CodeNxtLab. All rights reserved.</p>
				<div class="flex gap-6">
					<a href="/docs/security" class="hover:text-white transition-colors">Privacy</a>
					<a href="/docs/rate-limits" class="hover:text-white transition-colors">Terms</a>
					<a href="https://github.com/codenxtlab/bhejna/edit/main/docs" target="_blank" class="hover:text-white transition-colors flex items-center gap-1.5">
						<Globe size={14} />
						Edit on GitHub
					</a>
				</div>
			</footer>
		</main>

		<!-- Right Sidebar (TOC) -->
		<aside class="hidden xl:block w-64 shrink-0 sticky top-16 self-start h-[calc(100vh-4rem)] pt-16 overflow-y-auto">
			<div class="border-l border-slate-800/60 pl-6">
				<h4 class="text-xs font-bold text-white uppercase tracking-widest mb-6">On this page</h4>
				<nav class="flex flex-col gap-3">
					{#each toc as item}
						<a 
							href="#{item.id}" 
							class="text-sm transition-all hover:text-cyan-400 
								{item.level === 1 ? 'font-bold text-white' : ''}
								{item.level === 2 ? 'text-slate-400' : ''}
								{item.level === 3 ? 'text-slate-500 pl-4' : ''}"
						>
							{item.text}
						</a>
					{:else}
						<span class="text-xs text-slate-600 italic">No headings found</span>
					{/each}
				</nav>
			</div>
		</aside>
	</div>
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
		scroll-padding-top: 5rem;
	}
	
	::-webkit-scrollbar {
		width: 6px;
		height: 6px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: #1e293b;
		border-radius: 10px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: #334155;
	}
</style>
