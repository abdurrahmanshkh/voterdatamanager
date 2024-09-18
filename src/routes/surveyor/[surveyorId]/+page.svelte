<script>
	//Sectors List Page
	import { Button, Hr, Label, Card, Input } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	export let data; // The fetched data is passed as props to the page component
	let { surveyor } = data; // Destructure the sectors from the data prop

	onMount(() => {
		if (localStorage.getItem('authenticated') === '179438144299') {
			goto(`/surveyor/${surveyor._id}/sectors`);
		}
	});

	async function login() {
		const surveyResponse = await fetch(`/api/update-loggedIn/${surveyor._id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		localStorage.setItem('authenticated', JSON.stringify(179438144299));
		goto(`/surveyor/${surveyor._id}/sectors`);
	}
</script>

<main class="bg-gray-300 py-[18%] text-gray-800 md:px-64 md:py-[5%]">
	<h1 class="pb-10 text-center text-2xl font-semibold md:pb-8 md:text-3xl">
		Welcome to Voter's Data Survey Portal
	</h1>
	{#if surveyor.loggedIn !== true}
		<Card class="max-w-full bg-gray-100 p-8" padding="none">
			<form class="flex flex-col space-y-6" action="/">
				<h3 class="text-center text-xl font-bold text-gray-900">Login to Access Data</h3>
				<Hr classHr="h-1 rounded bg-gray-200" class="m-0 p-0" />
				<Label class="space-y-2">
					<span>Full Name</span>
					<Input type="text" bind:value={surveyor.name} disabled />
				</Label>
				<Label class="space-y-2">
					<span>Phone number</span>
					<Input type="text" bind:value={surveyor.phoneNo} disabled />
				</Label>
				<div class="text-center">
					<Button class="w-64" type="button" color="dark" on:click={login}>Login</Button>
				</div>
			</form>
		</Card>
	{:else}
		<Card class="max-w-full bg-red-100 py-24" padding="none">
			<h3 class="p-10 text-center text-xl font-bold text-red-900">
				Link not valid. Enter valid link or contact administrator.
			</h3>
		</Card>
	{/if}
</main>
