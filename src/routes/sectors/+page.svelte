<script>
	import { Button, Card, P } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!localStorage.getItem('isAuthenticated')) {
			goto('/');
		}
	});

	export let data; // The fetched data is passed as props to the page component
	let { voters } = data; // Destructure the voters from the data prop
	let uniqueSectors = [...new Set(voters.map((voter) => voter.sectorName))]; // Get unique building names
</script>

<div>
	<Card class="mx-auto max-w-full border-2 bg-gray-100">
		<P class="mb-4 text-xl font-bold">Select a Sector</P>
		<div class="grid gap-2 md:grid-cols-3">
			{#each uniqueSectors as sector}
				<Button size="lg" on:click={() => goto(`sectors/${sector}`)}>
					{sector}
				</Button>
			{/each}
		</div>
	</Card>
</div>
