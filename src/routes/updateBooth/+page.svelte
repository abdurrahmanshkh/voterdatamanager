<script>
	// Update Booth Page
	import { Input, Label, Button, Card, P, Alert } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if (localStorage.getItem('isAuthenticated') !== '776112529259') {
			goto('/');
		}
	});

	// Form fields
	let yadiNo = '';
	let newYadiNo = '';
	let pollingStation = '';
	let alert = '';
	let formData = {};

	// Function to handle form submission
	async function handleSubmit(event) {
		event.preventDefault();

		if (newYadiNo === '') {
			formData = {
				pollingStation
			};
		} else if (pollingStation === '') {
			formData = {
				yadiNo: newYadiNo
			};
		} else {
			formData = {
				yadiNo: newYadiNo,
				pollingStation
			};
		}

		try {
			const response = await fetch(`/api/update-booth/${yadiNo}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				const result = await response.json();
				alert = 'Voter information updated successfully!';
				yadiNo = '';
				newYadiNo = '';
				pollingStation = '';
			} else {
				alert = 'Failed to update voter information';
			}
		} catch (error) {
			alert = 'An error occurred';
		}
	}
</script>

<main class="bg-gray-300 py-[30%] text-gray-800 md:py-[6%]">
	<!-- Render the table -->
	<Card class="max-w-full border-2 border-gray-300 bg-gray-100 md:mx-auto md:max-w-[70%]">
		{#if alert}
			<Alert color="green" class="mb-4 font-semibold">{alert}</Alert>
		{/if}
		<P class="mb-4 text-xl font-bold">Update Yadi Number / Polling Station</P>
		<form on:submit|preventDefault={handleSubmit}>
			<div class="grid gap-4 md:grid-cols-2">
				<Label>
					Current Yadi No:
					<Input type="text" bind:value={yadiNo} class="mt-2" />
				</Label>
				<Label>
					New Yadi No:
					<Input type="text" bind:value={newYadiNo} class="mt-2" />
				</Label>
				<Label class="md:col-span-2">
					Polling Station:
					<Input type="text" bind:value={pollingStation} class="mt-2" />
				</Label>
			</div>
			<Button color="dark" class="mt-6 md:w-64" type="submit">Update Information</Button>
		</form>
	</Card>
</main>
