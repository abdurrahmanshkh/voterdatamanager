<script>
	//Login Page
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
	let phoneNumber = '+919653332540';
	var error = '';
	var alert = '';
	let password = '';
	let sendingCode = false;
	let alertColor = 'green';
	let otpSent = false;

	async function sendOtp() {
		const response = await fetch('/api/send-otp', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ phoneNumber }) // Example phone number
		});

		const data = await response.json();
		if (data.success) {
			alert = 'OTP sent successfully';
			otpSent = true;
		} else {
			alert = 'Failed to send OTP.';
			alertColor = 'red';
		}
	}

	async function verifyOtp() {
		const response = await fetch('/api/verify-otp', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ phoneNumber, code: password }) // Send phone number and entered OTP
		});

		const data = await response.json();
		if (data.success) {
			localStorage.setItem('isAuthenticated', JSON.stringify(true));
			// OTP is correct, redirect to a new page
			goto('/sectors'); // Redirect to a success page or dashboard
		} else {
			// OTP verification failed, handle error (e.g., show a message)
			alert = data.message;
		}
	}

	async function sendVerificationEmail() {
		sendingCode = true;
		try {
			const response = await fetch(`/api/send-email`, {
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
					<Alert color={alertColor} class="font-bold text-green-900">{alert}</Alert>
				{/if}
				{#if error}
					<Alert class="font-bold text-red-800">{error}</Alert>
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
				<div class="grid gap-2 text-center md:grid-cols-2">
					{#if !otpSent}
						<Button on:click={sendOtp} class="mt-1">Send OTP</Button>
					{:else}
						<Button on:click={verifyOtp} class="mt-1">Verify OTP</Button>
					{/if}
					{#if alert === 'Verification email sent successfully!'}
						<Button on:click={handleSubmit} class="mt-1">Login to Portal</Button>
					{:else if sendingCode}
						<Button disabled class="mt-1">
							<Spinner class="me-3" size="4" color="white" />
							Sending Verification Code
						</Button>
					{:else}
						<Button on:click={sendVerificationEmail} class="mt-1">Send Verification Code</Button>
					{/if}
				</div>
			</form>
		</Card>
	</div>
</main>
