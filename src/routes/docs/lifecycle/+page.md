---
layout: docs
---

# Delivery Lifecycle

Understanding the journey of a message from your server to the recipient's handset.

<div class="my-16 flex flex-col md:flex-row items-center justify-between gap-4 p-8 rounded-2xl bg-slate-900/30 border border-slate-800 overflow-x-auto no-scrollbar">
	<div class="flex flex-col items-center gap-4 group">
		<div class="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.2)]">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
		</div>
		<div class="text-center">
			<div class="text-xs font-bold text-white uppercase tracking-wider">Queued</div>
			<div class="text-[10px] text-slate-500">Bhejna Ingress</div>
		</div>
	</div>

	<div class="hidden md:block flex-1 h-[1px] bg-gradient-to-r from-cyan-500/50 to-blue-500/50"></div>
	<div class="md:hidden w-[1px] h-8 bg-gradient-to-b from-cyan-500/50 to-blue-500/50"></div>

	<div class="flex flex-col items-center gap-4 group">
		<div class="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/50 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.2)]">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
		</div>
		<div class="text-center">
			<div class="text-xs font-bold text-white uppercase tracking-wider">Sent</div>
			<div class="text-[10px] text-slate-500">Meta Delivery</div>
		</div>
	</div>

	<div class="hidden md:block flex-1 h-[1px] bg-gradient-to-r from-blue-500/50 to-indigo-500/50"></div>
	<div class="md:hidden w-[1px] h-8 bg-gradient-to-b from-blue-500/50 to-indigo-500/50"></div>

	<div class="flex flex-col items-center gap-4 group">
		<div class="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/50 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(99,102,241,0.2)]">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
		</div>
		<div class="text-center">
			<div class="text-xs font-bold text-white uppercase tracking-wider">Delivered</div>
			<div class="text-[10px] text-slate-500">Target Handset</div>
		</div>
	</div>

	<div class="hidden md:block flex-1 h-[1px] bg-gradient-to-r from-indigo-500/50 to-purple-500/50"></div>
	<div class="md:hidden w-[1px] h-8 bg-gradient-to-b from-indigo-500/50 to-purple-500/50"></div>

	<div class="flex flex-col items-center gap-4 group">
		<div class="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/50 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.2)]">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
		</div>
		<div class="text-center">
			<div class="text-xs font-bold text-white uppercase tracking-wider">Read</div>
			<div class="text-[10px] text-slate-500">User Interaction</div>
		</div>
	</div>
</div>

## Status Progression
1. **Queued**: Message accepted by Bhejna and persisted in our high-availability queue.
2. **Sent**: Message forwarded to Meta Cloud API and acknowledged by their servers.
3. **Delivered**: The recipient's handset has confirmed receiving the message.
4. **Read**: The user has opened the message (if read receipts are enabled).

## Failure States
- **Undeliverable**: Recipient number is invalid or not registered on WhatsApp.
- **Expired**: Message could not be delivered within the 24-hour TTL window.
- **Blocked**: The user has blocked your business account.

