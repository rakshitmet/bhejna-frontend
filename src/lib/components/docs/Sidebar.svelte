<script lang="ts">
	import { page } from '$app/stores';
	import { ChevronDown, ChevronRight, BookOpen, Key, Zap, Globe, AlertCircle, Cpu, Terminal } from 'lucide-svelte';

	const navigation = [
		{
			title: 'Introduction',
			icon: BookOpen,
			items: [
				{ label: 'Overview', href: '/docs' },
				{ label: 'Quickstart', href: '/docs/quickstart' }
			]
		},
		{
			title: 'Infrastructure',
			icon: Cpu,
			items: [
				{ label: 'Architecture', href: '/docs/architecture' },
				{ label: 'Security', href: '/docs/security' },
				{ label: 'Rate Limits', href: '/docs/rate-limits' }
			]
		},
		{
			title: 'Authentication',
			icon: Key,
			items: [
				{ label: 'API Keys', href: '/docs/authentication' },
				{ label: 'Internal Auth', href: '/docs/internal-auth' }
			]
		},
		{
			title: 'API Reference',
			icon: Terminal,
			items: [
				{ label: 'Send Message', href: '/docs/api-reference/send-message' },
				{ label: 'Management API', href: '/docs/api-reference/management' },
				{ label: 'Status Codes', href: '/docs/api-reference/status-codes' }
			]
		},
		{
			title: 'Integrations',
			icon: Globe,
			items: [
				{ label: 'Webhooks', href: '/docs/webhooks' },
				{ label: 'Delivery Lifecycle', href: '/docs/lifecycle' },
				{ label: 'Error Reference', href: '/docs/errors' }
			]
		},
		{
			title: 'Resources',
			icon: Zap,
			items: [
				{ label: 'SDKs & Tools', href: '/docs/sdks' },
				{ label: 'Guides', href: '/docs/guides' },
				{ label: 'Postman Collection', href: 'https://postman.com' }
			]
		}
	];

	function isActive(href: string) {
		if (href === '/docs') return $page.url.pathname === '/docs';
		return $page.url.pathname.startsWith(href);
	}
</script>

<nav class="space-y-8">
	{#each navigation as group}
		<div>
			<div class="flex items-center gap-2 mb-3 px-2">
				<group.icon size={16} class="text-slate-500" />
				<h5 class="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">{group.title}</h5>
			</div>
			<div class="space-y-1">
				{#each group.items as item}
					<a
						href={item.href}
						class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all 
							{isActive(item.href) 
								? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500 pl-4' 
								: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}"
					>
						{item.label}
					</a>
				{/each}
			</div>
		</div>
	{/each}
</nav>
