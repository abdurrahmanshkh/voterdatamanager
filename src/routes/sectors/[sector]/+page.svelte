<script>
	import { Input, Label, Button, Card, P, Alert } from 'flowbite-svelte';
	import { Table, TableBody, TableBodyCell } from 'flowbite-svelte';
	import { TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!localStorage.getItem('isAuthenticated')) {
			goto('/');
		}
	});

	export let data; // The fetched data is passed as props to the page component
	let { voters } = data; // Destructure the voters from the data prop
	let uniqueBuildings = [...new Set(voters.map((voter) => voter.buildingName))]; // Get unique building names
	let selectedBuilding = ''; // Store the selected building name

	// Form fields
	let flatNo = '';
	let epicNo = '';
	let name = '';
	let age = '';
	let relativeName = '';
	let phoneNo = '';
	let alert = '';
	let searchTerm = '';

	// Reactive variable for filtered voters
	$: filteredBuildings = selectedBuilding
		? voters.filter((voter) => voter.buildingName === selectedBuilding)
		: voters;

	// Function to handle button click
	function filterByBuilding(buildingName) {
		selectedBuilding = buildingName; // Set the selected building name
	}

	// Function to handle form submission
	async function handleSubmit(event) {
		event.preventDefault();

		const formData = {
			flatNo,
			epicNo,
			name,
			age,
			relativeName,
			phoneNo,
			buildingName: selectedBuilding
		};

		try {
			const response = await fetch('/api/add-voter', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				const result = await response.json();
				alert = 'Voter information added successfully!';
				// Clear form fields
				flatNo = '';
				epicNo = '';
				name = '';
				age = '';
				relativeName = '';
				phoneNo = '';
			} else {
				alert = 'Failed to add voter information';
			}
		} catch (error) {
			alert = 'An error occurred';
		}
	}

	$: filteredVoters = filteredBuildings.filter(
		(voter) => voter.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
	);
</script>

<main>
	<!-- Building Filter Buttons -->
	<Card class="mx-auto max-w-full border-2 bg-gray-100">
		<P class="mb-4 text-xl font-bold">Select a Building</P>
		<div class="grid gap-1 md:grid-cols-6">
			{#each uniqueBuildings as building}
				<Button on:click={() => filterByBuilding(building)}>
					{building}
				</Button>
			{/each}
			<Button on:click={() => filterByBuilding('')}>Show All</Button>
		</div>
	</Card>

	<!-- Render the table -->
	<Card class="mx-auto max-w-full border-2 bg-gray-100">
		<div class="grid md:grid-cols-3">
			<P class="text-xl font-bold md:col-span-2 md:mt-2"
				>Residents of {selectedBuilding || 'All Buildings'}</P
			>
			<Input placeholder="Search by Voter Name" bind:value={searchTerm} class="mb-4" />
		</div>
		<Table shadow class="w-full table-auto text-left">
			<TableHead>
				<TableHeadCell>Flat No</TableHeadCell>
				<TableHeadCell>EPIC No</TableHeadCell>
				<TableHeadCell>Name</TableHeadCell>
				<TableHeadCell>Age</TableHeadCell>
				<TableHeadCell>Relative Name</TableHeadCell>
				<TableHeadCell>Phone No</TableHeadCell>
				<TableHeadCell>Building Name</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each filteredVoters as voter}
					<TableBodyRow>
						<TableBodyCell>{voter.flatNo}</TableBodyCell>
						<TableBodyCell>{voter.epicNo}</TableBodyCell>
						<TableBodyCell>{voter.name}</TableBodyCell>
						<TableBodyCell>{voter.age}</TableBodyCell>
						<TableBodyCell>{voter.relativeName}</TableBodyCell>
						<TableBodyCell>{voter.phoneNo}</TableBodyCell>
						<TableBodyCell>{voter.buildingName}</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</Card>

	<!-- Conditional Form Display -->
	{#if selectedBuilding}
		<Card class="mx-auto max-w-full border-2 bg-gray-100">
			{#if alert}
				<Alert color="green" class="font-medium">{alert}</Alert>
			{/if}
			<P class="mb-4 text-xl font-bold">Add Resident to {selectedBuilding}</P>
			<form on:submit|preventDefault={handleSubmit}>
				<div class="grid gap-4 md:grid-cols-3">
					<Label>
						Flat No:
						<Input type="text" bind:value={flatNo} class="mt-2" required />
					</Label>
					<Label>
						EPIC No:
						<Input type="text" bind:value={epicNo} class="mt-2" required />
					</Label>
					<Label>
						Name:
						<Input type="text" bind:value={name} class="mt-2" required />
					</Label>
					<Label>
						Age:
						<Input type="text" bind:value={age} class="mt-2" required />
					</Label>
					<Label>
						Relative Name:
						<Input type="text" bind:value={relativeName} class="mt-2" required />
					</Label>
					<Label>
						Phone No:
						<Input type="text" bind:value={phoneNo} class="mt-2" required />
					</Label>
				</div>
				<Button class="mt-6" type="submit">Add Voter</Button>
			</form>
		</Card>
	{/if}
</main>
