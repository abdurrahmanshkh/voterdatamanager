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

<main class="bg-primary-300">
	<div class="bg-primary-100 py-12 md:px-72 md:py-8">
		<h1 class="pb-12 text-center text-2xl font-semibold text-orange-900 md:pb-8 md:text-3xl">
			Welcome to Voter's Data Portal
		</h1>
		<Card class="max-w-full bg-orange-100 p-8" padding="none">
			<form class="flex flex-col space-y-6" action="/">
				{#if alert}
					<Alert color={alertColor} class="text-green-900">{alert}</Alert>
				{/if}
				{#if error}
					<Alert class="text-red-800">{error}</Alert>
				{/if}
				<h3 class="text-center text-xl font-bold text-yellow-900">Login to Access Data</h3>
				<Hr classHr="h-1 rounded bg-orange-200" class="m-0 p-0" />
				<Label class="space-y-2">
					<span>Full Name</span>
					<Input type="text" name="name" placeholder="John" bind:value={username} disabled />
				</Label>
				<Label class="space-y-2">
					<span>Enter Verification Code</span>
					<Input
						type="password"
						name="password"
						placeholder="•••••"
						bind:value={password}
						required
					/>
				</Label>
				<div class="text-center">
					{#if alert === 'Verification email sent successfully!'}
						<Label>
							<Button on:click={handleSubmit} class="mt-1 w-64">Login to Portal</Button>
						</Label>
					{:else if sendingCode}
						<Button disabled class="mt-1 w-64">
							<Spinner class="me-3" size="4" color="white" />
							Sending Verification Code
						</Button>
					{:else}
						<Label>
							<Button on:click={sendVerificationEmail} class="mt-1 w-64">
								Send Verification Code
							</Button>
						</Label>
					{/if}
				</div>
			</form>
		</Card>
	</div>
</main>
