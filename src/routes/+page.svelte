<script>
	//Login Page
	import { goto } from '$app/navigation';
	import { Card, Button, Input, Label, Hr, Alert, Spinner } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		if (localStorage.getItem('isAuthenticated') === '123456') {
			goto('/sectors');
		}
	});

	let username = 'Admin';
	let password = 'admin';

	function handleLogin() {
		localStorage.setItem('isAuthenticated', JSON.stringify(123456));
		goto('/sectors');
	}
</script>

<main class="bg-gray-300 py-[18%] text-gray-800 md:px-64 md:py-[5%]">
	<h1 class="pb-10 text-center text-2xl font-semibold md:pb-8 md:text-3xl">
		Welcome to Voter's Data Portal
	</h1>
	<Card class="max-w-full bg-gray-100 p-8" padding="none">
		<form class="flex flex-col space-y-6" on:submit|preventDefault={handleLogin}>
			<h3 class="text-center text-xl font-bold text-gray-900">Login to Access Data</h3>
			<Hr classHr="h-1 rounded bg-gray-200" class="m-0 p-0" />
			<Label class="space-y-2">
				<span>Full Name</span>
				<Input type="text" name="name" placeholder="John" bind:value={username} disabled />
			</Label>
			<Label class="space-y-2">
				<span>Enter Verification Code</span>
				<Input type="password" name="password" placeholder="•••••" bind:value={password} disabled />
			</Label>
			<div class="text-center">
				<Button type="submit" class="mt-1 w-64" color="dark">Login</Button>
			</div>
		</form>
	</Card>
</main>
