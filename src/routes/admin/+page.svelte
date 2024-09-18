<script>
	import { Button, Input, Label, Card, P, Alert } from 'flowbite-svelte';
	import { Table, TableBody, TableBodyCell, Modal } from 'flowbite-svelte';
	import { TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { ExclamationCircleOutline } from 'flowbite-svelte-icons';

	onMount(() => {
		if (localStorage.getItem('isAuthenticated') !== '776112529259') {
			goto('/');
		}
	});

	let alert = '';
	let name = '';
	let phoneNo = '';
	let popupModal = false;

	// Function to handle form submission
	async function handleSubmit(event) {
		event.preventDefault();

		const formData = {
			name: name,
			phoneNo: phoneNo,
			formsFilled: 0,
			formsFilledToday: 0,
			formsUpdated: 0,
			formsUpdatedToday: 0,
			formsDeleted: 0,
			formsDeletedToday: 0,
			loggedIn: false
		};

		try {
			const response = await fetch('/api/add-surveyor', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				const result = await response.json();
				alert = 'Surveyor information added successfully!';
				//Refresh page to show new surveyor
				location.reload();
			} else {
				alert = 'Failed to add surveyor information';
			}
		} catch (error) {
			alert = 'An error occurred';
		}
	}

	export let data; // The fetched data is passed as props to the page component
	let { surveyors } = data; // Destructure the surveyors from the data prop

	// Function to delete a surveyor
	async function deleteSurveyor(id) {
		try {
			const response = await fetch(`/api/delete-surveyor/${id}`, {
				method: 'POST'
			});

			if (response.ok) {
				const result = await response.json();
				alert = 'Surveyor deleted successfully!';
				//Refresh page to show new surveyor
				location.reload();
			} else {
				alert = 'Failed to delete surveyor';
			}
		} catch (error) {
			alert = 'An error occurred';
		}
	}

	// Function to create the SMS link
	function sendSMS(name, phoneNo, link) {
		let message = `Dear ${name},\n\nYou have been successfully onboarded as a surveyor for the voter survey in your designated area.\n\nYour details are as follows:\n\n- Name: ${name}\n\n- Phone No: ${phoneNo}\n\n- Access Link: ${link}\n\nPlease use the access link to log in and start your survey. If you have any questions, feel free to contact us.\n\nThank you for your valuable contribution!`;

		// Encode the message to be used in the SMS link
		let smsLink = `sms:+91${phoneNo}?&body=${encodeURIComponent(message)}`;
		// Redirect to the SMS app
		window.location.href = smsLink;
	}

	// Function to create the WhatsApp link
	function sendWhatsAppMessage(name, phoneNo, link) {
		let message = `Dear ${name},\n\nYou have been successfully onboarded as a surveyor for the voter survey in your designated area.\n\nYour details are as follows:\n\n- Name: ${name}\n\n- Phone No: ${phoneNo}\n\n- Access Link: ${link}\n\nPlease use the access link to log in and start your survey. If you have any questions, feel free to contact us.\n\nThank you for your valuable contribution!`;

		// Encode the message to be used in the WhatsApp link
		let whatsappLink = `https://wa.me/+91${phoneNo}?text=${encodeURIComponent(message)}`;
		// Open WhatsApp with the pre-filled message
		window.location.href = whatsappLink;
	}

	//Function to reset link
	async function resetLink(id) {
		const surveyResponse = await fetch(`/api/admin-update-loggedIn/${id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		alert = 'Link reset successful!';
		//Refresh page to show new surveyor
		location.reload();
	}
</script>

<main>
	<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
		{#if alert}
			<Alert color="green" class="text-bold mt-4 text-green-950">{alert}</Alert>
		{/if}
		<P class="mb-4 text-xl font-bold">Add Surveyor</P>
		<form on:submit|preventDefault={handleSubmit}>
			<div class="grid gap-4 md:grid-cols-3">
				<Label>
					Name:
					<Input class="mt-2" type="text" id="name" bind:value={name} required />
				</Label>
				<Label>
					Phone No:
					<Input class="mt-2" type="text" id="phoneNo" bind:value={phoneNo} required />
				</Label>
				<Button class="md:mt-7" type="submit" color="dark">Add Surveyor</Button>
			</div>
		</form>
	</Card>
	<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
		<div class="grid md:grid-cols-3">
			<P class="mb-4 text-xl font-bold md:col-span-2">Current Surveyors</P>
		</div>
		<Table shadow class="w-full table-auto text-left">
			<TableHead class="border-b border-blue-900 bg-blue-100">
				<TableHeadCell>Name</TableHeadCell>
				<TableHeadCell>Phone No</TableHeadCell>
				<TableHeadCell>Forms Filled</TableHeadCell>
				<TableHeadCell>Forms Updated</TableHeadCell>
				<TableHeadCell>Forms Deleted</TableHeadCell>
				<TableHeadCell>Send Details</TableHeadCell>
				<TableHeadCell>Actions</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each surveyors as surveyor}
					<TableBodyRow class="border-blue-900 bg-blue-100 hover:bg-blue-200">
						<TableBodyCell>{surveyor.name}</TableBodyCell>
						<TableBodyCell>{surveyor.phoneNo}</TableBodyCell>
						<TableBodyCell>{surveyor.formsFilled}</TableBodyCell>
						<TableBodyCell>{surveyor.formsUpdated}</TableBodyCell>
						<TableBodyCell>{surveyor.formsDeleted}</TableBodyCell>
						<TableBodyCell class="">
							<Button
								color="blue"
								on:click={() =>
									sendSMS(
										surveyor.name,
										surveyor.phoneNo,
										`https://sajidpatel.onrender.com/surveyor/${surveyor._id}`
									)}
								class="mr-1 w-28"
								>SMS
							</Button>
							<Button
								color="green"
								on:click={() =>
									sendWhatsAppMessage(
										surveyor.name,
										surveyor.phoneNo,
										`https://sajidpatel.onrender.com/surveyor/${surveyor._id}`
									)}
								class="w-28"
								>WhatsApp
							</Button>
						</TableBodyCell>
						<TableBodyCell>
							{#if surveyor.loggedIn}
								<Button on:click={() => resetLink(surveyor._id)} color="dark" class="mr-1 w-28">
									Reset Link
								</Button>
							{/if}
							<Button color="red" on:click={() => (popupModal = true)} class="w-28">Delete</Button>
						</TableBodyCell>
						<Modal bind:open={popupModal} autoclose>
							<div class="text-center">
								<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-900" />
								<h3 class="mb-5 text-lg font-normal text-gray-900">
									Are you sure you want to delete this surveyor?
								</h3>
								<Button on:click={() => deleteSurveyor(surveyor._id)} color="red" class="me-2"
									>Yes, I'm sure</Button
								>
								<Button color="alternative">No, cancel</Button>
							</div>
						</Modal>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</Card>
</main>
