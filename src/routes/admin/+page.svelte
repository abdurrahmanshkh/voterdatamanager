<script>
	import { Button, Input, Label, Card, P } from 'flowbite-svelte';
	import { Table, TableBody, TableBodyCell, Modal } from 'flowbite-svelte';
	import { TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
	import { goto } from '$app/navigation';

	let alert = '';
	let name = '';
	let phoneNo = '';

	// Function to handle form submission
	async function handleSubmit(event) {
		event.preventDefault();

		const formData = {
			name: name,
			phoneNo: phoneNo,
			formsFilled: 0,
			formsFilledToday: 0,
			formsUpdated: 0,
			formsUpdatedToday: 0
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
				alert = 'surveyor information added successfully!';
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
</script>

<main>
	<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
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
	{#if alert}
		<P class="mt-4 text-center text-red-500">{alert}</P>
	{/if}
	<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
		<div class="grid md:grid-cols-3">
			<P class="text-xl font-bold md:col-span-2 mb-4">Current Surveyors</P>
		</div>
		<Table shadow class="w-full table-auto text-left">
			<TableHead class="border-b border-blue-900 bg-blue-100">
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Phone No</TableHeadCell>
                <TableHeadCell>Forms Filled</TableHeadCell>
                <TableHeadCell>Forms Updated</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each surveyors as surveyor}
					<TableBodyRow
						class="border-blue-900 bg-blue-100 hover:bg-blue-200"
						on:click={() => goto(`/surveyors/${surveyor._id}`)}
					>
						<TableBodyCell>{surveyor.name}</TableBodyCell>
						<TableBodyCell>{surveyor.phoneNo}</TableBodyCell>
						<TableBodyCell>{surveyor.formsFilled}</TableBodyCell>
						<TableBodyCell>{surveyor.formsUpdated}</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</Card>
</main>
