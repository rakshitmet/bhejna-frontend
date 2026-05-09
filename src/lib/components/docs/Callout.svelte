<script lang="ts">
	import { Info, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-svelte';

	let { 
		type = 'info', 
		title, 
		children 
	}: { 
		type?: 'info' | 'warning' | 'error' | 'success', 
		title?: string, 
		children: any 
	} = $props();

	const configs = {
		info: {
			icon: Info,
			bg: 'bg-cyan-500/5',
			border: 'border-cyan-500/20',
			text: 'text-cyan-400',
			iconColor: 'text-cyan-500'
		},
		warning: {
			icon: AlertTriangle,
			bg: 'bg-amber-500/5',
			border: 'border-amber-500/20',
			text: 'text-amber-400',
			iconColor: 'text-amber-500'
		},
		error: {
			icon: AlertCircle,
			bg: 'bg-red-500/5',
			border: 'border-red-500/20',
			text: 'text-red-400',
			iconColor: 'text-red-500'
		},
		success: {
			icon: CheckCircle,
			bg: 'bg-green-500/5',
			border: 'border-green-500/20',
			text: 'text-green-400',
			iconColor: 'text-green-500'
		}
	};

	const config = $derived(configs[type]);
</script>

<div class="my-8 flex gap-4 p-5 rounded-xl border {config.border} {config.bg}">
	<div class="shrink-0 mt-0.5">
		<config.icon size={20} class={config.iconColor} />
	</div>
	<div class="flex-1">
		{#if title}
			<h5 class="mt-0 mb-1 font-bold text-slate-200">{title}</h5>
		{/if}
		<div class="text-sm leading-relaxed text-slate-400 prose-p:my-0">
			{@render children()}
		</div>
	</div>
</div>
