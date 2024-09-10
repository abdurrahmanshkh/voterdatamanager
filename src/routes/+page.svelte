<script>
	import { goto } from '$app/navigation';
	import { Card, Button, Input, Label, Hr, Alert, Spinner } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		if (localStorage.getItem('isAuthenticated') == 'true') {
			goto('/sectors');
		}
	});

	let username = 'Sajid Patel';
	let verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
	var error = '';
	var alert = '';
	let password = '';
	let sendingCode = false;
	let alertColor = 'green';

	async function sendVerificationEmail() {
		sendingCode = true;
		try {
			const response = await fetch(`/api/send-otp`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					verificationCode
				})
			});

			const result = await response.json();

			if (result.success) {
				alert = 'Verification email sent successfully!';
				sendingCode = false;
			} else {
				alert = 'Failed to send verification email.';
				alertColor = 'red';
			}
		} catch (error) {
			console.error('Error sending verification email:', error);
		}
	}

	function handleSubmit() {
		if (password == verificationCode) {
			localStorage.setItem('isAuthenticated', JSON.stringify(true));
			goto('/sectors');
		} else {
			error = 'Incorrect Verification Code';
		}
	}
</script>

<div class="py-10 md:px-72">
	<h1 class="pb-10 text-center text-3xl font-semibold text-gray-900 dark:text-white">
		Welcome to Voter's Data Portal
	</h1>
	<Card class="max-w-full">
		<form class="flex flex-col space-y-6" action="/">
			{#if alert}
				<Alert color={alertColor} class="text-green-900">{alert}</Alert>
			{/if}
			{#if error}
				<Alert class="text-red-800">{error}</Alert>
			{/if}
			<h3 class="text-xl font-medium text-gray-900 dark:text-white">Login to Access Data</h3>
			<Hr classHr="my-8" />
			<Label class="space-y-2">
				<span>Full Name</span>
				<Input type="text" name="name" placeholder="John" bind:value={username} disabled />
			</Label>
			<Label class="space-y-2">
				<span>Enter Verification Code</span>
				<Input type="password" name="password" placeholder="•••••" bind:value={password} required />
			</Label>
			<div class="grid grid-cols-2 gap-3">
				{#if alert === 'Verification email sent successfully!'}
					<Label>
						<Button on:click={handleSubmit} class="w-full">Login to Portal</Button>
					</Label>
				{:else if sendingCode}
					<Button disabled class="w-full">
						<Spinner class="me-3" size="4" color="white" />
						Sending Verification Code
					</Button>
				{:else}
					<Label>
						<Button on:click={sendVerificationEmail} class="w-full">Send Verification Code</Button>
					</Label>
				{/if}
			</div>
		</form>
	</Card>
</div>
