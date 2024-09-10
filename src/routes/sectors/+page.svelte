<script>
	import { Button, Card, P } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!localStorage.getItem('isAuthenticated')) {
			goto('/');
		}
	});

	let uniqueSectors = [
		'Owa Gaon 1',
		'Owa Gaon 2',
		'Sector 23',
		'Sector 27',
		'Sector 30',
		'Sector 34 A',
		'Sector 34 B',
		'Sector 34 C',
		'Sector 35 D',
		'Sector 35 E',
		'Sector 35 F',
		'Sector 35 G',
		'Sector 35 H',
		'Sector 35 1',
		'Sector 36',
		'Sector 39',
		'Farshi Pada',
		'Khutukbandhan',
		'Pethpada',
		'Owa Camp'
	]; // Get unique building names
</script>

<div>
	<Card class="mx-auto max-w-full border-2 bg-gray-100">
		<P class="mb-4 text-xl font-bold">Select a Sector</P>
		<div class="grid gap-3 md:grid-cols-3 grid-cols-2">
			{#each uniqueSectors as sector}
				<Button size="xl" on:click={() => goto(`sectors/${sector}`)} class="md:max-h-full max-h-10">
					{sector}
				</Button>
			{/each}
		</div>
	</Card>
</div>
