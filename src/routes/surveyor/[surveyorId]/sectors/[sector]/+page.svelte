<script>
	//Building List Page
	import { Input, Label, Button, Card, P, Alert } from 'flowbite-svelte';
	import { Table, TableBody, TableBodyCell } from 'flowbite-svelte';
	import { TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if (localStorage.getItem('authenticated') !== '179438144299') {
			goto(`/surveyor/${surveyor._id}`);
		}
	});

	export let data; // The fetched data is passed as props to the page component
	let { surveyor } = data; // Destructure the voters from the data prop
	let { voters } = data; // Destructure the voters from the data prop

	let uniqueBuildings = [...new Set(voters.map((voter) => voter.buildingName))]; // Get unique building names
	let selectedBuilding = ''; // Store the selected building name

	// Form fields
	let flatNo = '';
	let name = '';
	let phoneNo = '';
	let yadiNo = '';
	let srNo = '';
	let rscNo = '';
	let buildingName = '';
	let wing = '';
	let sectorName = voters[0].sectorName;
	let buildingNo = '';
	let selectedBuildingNo = '';
	let pollingStation = '';
	let caste = '';
	let note = '';

	let alert = '';
	let searchTerm = '';

	// Reactive variable for filtered voters
	$: filteredBuildings = selectedBuilding
		? voters.filter((voter) => voter.buildingName === selectedBuilding)
		: voters;

	$: if (selectedBuilding) {
		selectedBuildingNo = filteredBuildings[0].buildingNo;
	} else {
		selectedBuildingNo = '';
	}

	let searchBuilding = ''; // This will be your search input
	let searchedBuildings = [];

	// Reactive statement to update filteredBuildings based on searchBuilding
	$: searchedBuildings = uniqueBuildings.filter((building) =>
		building.toLowerCase().includes(searchBuilding.toLowerCase())
	);

	// Function to handle button click
	function filterByBuilding(buildingName) {
		selectedBuilding = buildingName; // Set the selected building name
	}

	// Function to handle form submission
	async function handleSubmit(event) {
		event.preventDefault();

		const formData = {
			flatNo,
			name,
			phoneNo,
			yadiNo,
			srNo,
			rscNo,
			buildingName: selectedBuilding || buildingName,
			wing,
			sectorName,
			buildingNo: selectedBuildingNo || buildingNo,
			pollingStation,
			caste,
			note
		};

		try {
			const response = await fetch('/api/add-voter', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			const surveyResponse = await fetch(`/api/update-formsFilled/${surveyor._id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				const result = await response.json();
				alert = 'Voter information added successfully!';
				//Refresh page to show new voter
				location.reload();
			} else {
				alert = 'Failed to add voter information';
			}
		} catch (error) {
			alert = 'An error occurred';
		}
	}

	$: filteredVoters = filteredBuildings.filter((voter) => {
		// Check if any of the search parameters match the searchTerm
		return (
			voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			voter.flatNo.toLowerCase().includes(searchTerm) ||
			voter.phoneNo.toLowerCase().includes(searchTerm) ||
			voter.yadiNo.toLowerCase().includes(searchTerm) ||
			voter.srNo.toLowerCase().includes(searchTerm) ||
			voter.rscNo.toLowerCase().includes(searchTerm) ||
			voter.wing.toLowerCase().includes(searchTerm.toLowerCase())
		);
	});
</script>

<main class="bg-gray-300">
	<!-- Building Filter Buttons -->
	<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
		<div class="grid md:grid-cols-3">
			<P class="text-xl font-bold md:col-span-2 md:mt-2">Select a Building</P>
			<Input
				placeholder="Search by Building Name"
				bind:value={searchBuilding}
				class="mb-4 mt-2 md:mt-0"
			/>
		</div>
		<div class="grid gap-1 md:grid-cols-6">
			{#each searchedBuildings as building}
				<Button color="blue" on:click={() => filterByBuilding(building)}>
					{building}
				</Button>
			{/each}
			<Button color="blue" on:click={() => filterByBuilding('')}>Show All</Button>
		</div>
	</Card>

	<!-- Render the table -->
	<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
		<div class="grid md:grid-cols-3">
			<P class="text-xl font-bold md:col-span-2 md:mt-2"
				>Residents of {selectedBuilding || 'All Buildings'}</P
			>
			<Input
				placeholder="Search by Voter Information"
				bind:value={searchTerm}
				class="mt-2 md:mt-0"
			/>
		</div>
		{#if searchTerm}
			<Table shadow class="mt-4 w-full table-auto text-left">
				<TableHead class="border-b border-blue-900 bg-blue-100">
					<TableHeadCell>Flat No</TableHeadCell>
					<TableHeadCell>Name</TableHeadCell>
					<TableHeadCell>Phone No</TableHeadCell>
					<TableHeadCell>Yadi No</TableHeadCell>
					<TableHeadCell>Sr No</TableHeadCell>
					<TableHeadCell>RSC No</TableHeadCell>
					<TableHeadCell>Building Name</TableHeadCell>
					<TableHeadCell>Wing</TableHeadCell>
				</TableHead>
				<TableBody>
					{#each filteredVoters as voter}
						<TableBodyRow
							class="border-blue-900 bg-blue-100 hover:bg-blue-200"
							on:click={() => goto(`/surveyor/${surveyor._id}/voters/${voter._id}`)}
						>
							<TableBodyCell>{voter.flatNo}</TableBodyCell>
							<TableBodyCell>{voter.name}</TableBodyCell>
							<TableBodyCell>{voter.phoneNo}</TableBodyCell>
							<TableBodyCell>{voter.yadiNo}</TableBodyCell>
							<TableBodyCell>{voter.srNo}</TableBodyCell>
							<TableBodyCell>{voter.rscNo}</TableBodyCell>
							<TableBodyCell>{voter.buildingName}</TableBodyCell>
							<TableBodyCell>{voter.wing}</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		{/if}
	</Card>

	<!-- Conditional Form Display -->
	<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
		{#if alert}
			<Alert color="green" class="mb-4 font-bold">{alert}</Alert>
		{/if}
		<P class="mb-4 text-xl font-bold">Add Resident to {selectedBuilding || 'New Building'}</P>
		<form on:submit|preventDefault={handleSubmit}>
			<div class="grid gap-4 md:grid-cols-3">
				<Label>
					Flat No:
					<Input type="text" bind:value={flatNo} class="mt-2" />
				</Label>
				<Label>
					Name:
					<Input type="text" bind:value={name} class="mt-2" required />
				</Label>
				<Label>
					Phone No:
					<Input type="text" bind:value={phoneNo} class="mt-2" />
				</Label>
				<Label>
					Yadi No:
					<Input type="text" bind:value={yadiNo} class="mt-2" />
				</Label>
				<Label>
					Sr No:
					<Input type="text" bind:value={srNo} class="mt-2" />
				</Label>
				<Label>
					RSC No:
					<Input type="text" bind:value={rscNo} class="mt-2" />
				</Label>
				{#if selectedBuilding}
					<Label>
						Building Name:
						<Input type="text" bind:value={selectedBuilding} class="mt-2" required disabled />
					</Label>
				{:else}
					<Label>
						Building Name:
						<Input type="text" bind:value={buildingName} class="mt-2" required />
					</Label>
				{/if}
				<Label>
					Wing:
					<Input type="text" bind:value={wing} class="mt-2" />
				</Label>
				<Label>
					Sector:
					<Input type="text" bind:value={sectorName} class="mt-2" required disabled />
				</Label>
				{#if selectedBuilding}
					<Label>
						Building No:
						<Input type="text" bind:value={selectedBuildingNo} class="mt-2" required disabled />
					</Label>
				{:else}
					<Label>
						Building No:
						<Input type="text" bind:value={buildingNo} class="mt-2" required />
					</Label>
				{/if}
				<Label class="md:col-span-2">
					Polling Station:
					<Input type="text" bind:value={pollingStation} class="mt-2" />
				</Label>
				<Label>
					Caste:
					<Input type="text" bind:value={caste} class="mt-2" />
				</Label>
				<Label class="md:col-span-2">
					Note:
					<Input type="text" bind:value={note} class="mt-2" />
				</Label>
			</div>
			<div class="grid md:grid-cols-4">
				<Button class="mt-6" type="submit" color="dark">Add New Voter</Button>
			</div>
		</form>
	</Card>
</main>
