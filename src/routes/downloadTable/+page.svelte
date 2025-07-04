<script>
	import { goto } from '$app/navigation';
	import { Card, Button, Input, Label, Hr, Alert, Spinner } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		if (localStorage.getItem('isAuthenticated') !== '123456') {
			goto('/');
		}
	});

	export let data; // The fetched data is passed as props to the page component
	let { voters } = data; // Destructure the voters from the data prop

	let username = 'Admin';
	let verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
	let phoneNumber = '+919653332540';
	var error = '';
	var alert = '';
	let password = '';
	let sendingCode = false;
	let alertColor = 'green';
	let sendingOtp = false;

	function downloadCSV() {
		// Create CSV header
		const header = [
			'Flat No',
			'Name',
			'Phone No',
			'Yadi No',
			'Sr No',
			'RSC No',
			'Building Name',
			'Wing'
		];

		// Convert data to CSV format
		const csvRows = [];
		csvRows.push(header.join(',')); // Add header row

		// Add data rows
		voters.forEach((voter) => {
			const row = [
				voter.flatNo,
				voter.name,
				voter.phoneNo,
				voter.yadiNo,
				voter.srNo,
				voter.rscNo,
				voter.buildingName,
				voter.wing
			];
			csvRows.push(row.join(','));
		});

		// Create a blob with CSV data and create a download link
		const csvContent = csvRows.join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'voters.csv';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function sendOtp() {
		sendingOtp = true;
		const response = await fetch('/api/send-otp', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ phoneNumber }) // Example phone number
		});

		const data = await response.json();
		if (data.success) {
			alert = 'OTP sent successfully';
			sendingOtp = false;
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
			downloadCSV();
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
			downloadCSV();
			goto('/sectors');
		} else {
			error = 'Incorrect Verification Code';
		}
	}
</script>

<main class="bg-gray-300 py-[18%] text-gray-800 md:px-64 md:py-[5%]">
	<h1 class="pb-10 text-center text-2xl font-semibold md:pb-8 md:text-3xl">Download Data as CSV</h1>
	<Card class="max-w-full bg-gray-100 p-8" padding="none">
		<form class="flex flex-col space-y-6" action="/">
			{#if alert}
				<Alert color={alertColor} class="font-bold text-green-900">{alert}</Alert>
			{/if}
			{#if error}
				<Alert class="font-bold text-red-800">{error}</Alert>
			{/if}
			<h3 class="text-center text-xl font-bold text-gray-900">Login to Download Data</h3>
			<Hr classHr="h-1 rounded bg-gray-200" class="m-0 p-0" />
			<Label class="space-y-2">
				<span>Full Name</span>
				<Input type="text" name="name" placeholder="John" bind:value={username} disabled />
			</Label>
			<Label class="space-y-2">
				<span>Enter Verification Code</span>
				<Input type="password" name="password" placeholder="•••••" bind:value={password} required />
			</Label>
			<div class="grid gap-2 text-center md:grid-cols-2">
				{#if alert === 'OTP sent successfully'}
					<Button on:click={verifyOtp} class="mt-1" color="blue">Download Data</Button>
				{:else if sendingOtp}
					<Button disabled class="mt-1" color="blue">
						<Spinner class="me-3" size="4" color="white" />
						Sending OTP on SMS
					</Button>
				{:else}
					<Button on:click={sendOtp} class="mt-1" color="blue">Send OTP on SMS</Button>
				{/if}
				{#if alert === 'Verification email sent successfully!'}
					<Button on:click={handleSubmit} class="mt-1" color="dark">Download Data</Button>
				{:else if sendingCode}
					<Button disabled class="mt-1" color="dark">
						<Spinner class="me-3" size="4" color="white" />
						Sending OTP on Email
					</Button>
				{:else}
					<Button on:click={sendVerificationEmail} class="mt-1" color="dark"
						>Send OTP on Email</Button
					>
				{/if}
			</div>
		</form>
	</Card>
</main>
