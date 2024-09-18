<script>
	//Sectors List Page
	import { Alert, Button, Card, Input, P, Label } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Table, TableBody, TableBodyCell } from 'flowbite-svelte';
	import { TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';

	onMount(() => {
		if (localStorage.getItem('authenticated') !== '179438144299') {
			goto(`/surveyor/${surveyor._id}`);
		}
	});

	// Form fields
	let name = '';
	let phoneNo = '';
	let yadiNo = '';
	let srNo = '';
	let rscNo = '';
	let buildingName = '';
	let wing = '';
	let sectorName = '';
	let buildingNo = '';
	let pollingStation = '';
	let caste = '';
	let note = '';
	let alert = '';
	let searchTerm = ''; // Search term for filtering voters

	export let data; // The fetched data is passed as props to the page component
	let { surveyor } = data; // Destructure the voters from the data prop
	let { voters } = data; // Destructure the voters from the data prop

	let uniqueSectors = [...new Set(voters.map((voter) => voter.sectorName))]; // Get unique building names

	// Function to handle form submission
	async function handleSubmit(event) {
		event.preventDefault();

		const formData = {
			flatNo: 'newsector',
			name,
			phoneNo,
			yadiNo,
			srNo,
			rscNo,
			buildingName,
			wing,
			sectorName,
			buildingNo,
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

			if (response.ok) {
				const result = await response.json();
				alert = 'Sector added successfully!';
				// Update the UI to reflect the new sector
				uniqueSectors = [...new Set([...uniqueSectors, sectorName])];
			} else {
				alert = 'Failed to add sector';
			}
		} catch (error) {
			alert = 'An error occurred';
		}
	}

	$: filteredVoters = voters.filter((voter) => {
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

	// Create a set of unique combinations of building name, sector name, and buildingNo
	let uniqueBuildings = Array.from(
		new Map(
			voters.map((voter) => [
				voter.buildingName + '-' + voter.sectorName + '-' + voter.buildingNo,
				{
					buildingName: voter.buildingName,
					sectorName: voter.sectorName,
					buildingNo: voter.buildingNo
				}
			])
		).values()
	);

	// Input value for filtering
	let filterText = '';

	// Filter function to match building name, sector name, or building no
	$: filteredBuildings = uniqueBuildings.filter(
		(building) =>
			building.buildingName.toLowerCase().includes(filterText.toLowerCase()) ||
			building.sectorName.toLowerCase().includes(filterText.toLowerCase()) ||
			building.buildingNo.toLowerCase().includes(filterText.toLowerCase())
	);
</script>

<main class="bg-gray-300">
	<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
		<div class="grid md:grid-cols-3">
			<P class="text-xl font-bold md:col-span-2 md:mt-2">Search for Voter</P>
			<Input
				placeholder="Search by Voter Information"
				bind:value={searchTerm}
				class="mt-2 md:mt-0"
			/>
		</div>
		{#if searchTerm}
			<div class="mt-4">
				<Table shadow class="w-full table-auto text-left">
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
			</div>
		{/if}
	</Card>

	<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
		<div class="grid md:grid-cols-3">
			<P class="text-xl font-bold md:col-span-2 md:mt-2">Select a Sector / Building</P>
			<Input
				placeholder="Search by Building / Sector"
				bind:value={filterText}
				class="mt-2 md:mt-0"
			/>
		</div>
		{#if filterText}
			<div class="mt-4">
				<Table shadow class="w-full table-auto text-left">
					<TableHead class="border-b border-blue-900 bg-blue-100">
						<TableHeadCell>Building No</TableHeadCell>
						<TableHeadCell>Building Name</TableHeadCell>
						<TableHeadCell>Sector Name</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each filteredBuildings as building}
							<TableBodyRow
								class="border-blue-900 bg-blue-100 hover:bg-blue-200"
								on:click={() => goto(`/surveyor/${surveyor._id}/sectors/${building.sectorName}`)}
							>
								<TableBodyCell>{building.buildingNo}</TableBodyCell>
								<TableBodyCell>{building.buildingName}</TableBodyCell>
								<TableBodyCell>{building.sectorName}</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
			</div>
		{/if}
		<div class="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
			{#each uniqueSectors as sector}
				<Button color="blue" on:click={() => goto(`/surveyor/${surveyor._id}/sectors/${sector}`)}>
					{sector}
				</Button>
			{/each}
		</div>
	</Card>

	<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
		{#if alert}
			<Alert color="green" class="mb-4 font-bold">{alert}</Alert>
		{/if}
		<form on:submit|preventDefault={handleSubmit}>
			<P class="mb-4 text-xl font-bold">Add New Sector</P>
			<div class="grid w-full gap-4 md:grid-cols-3">
				<Label>
					New Sector Name:
					<Input
						type="text"
						class="mt-2"
						bind:value={sectorName}
						placeholder="Sector Name"
						required
					/>
				</Label>
				<Label>
					New Building Name:
					<Input
						type="text"
						class="mt-2"
						bind:value={buildingName}
						placeholder="Building Name"
						required
					/>
				</Label>
				<Button class="md:mt-7" type="submit" color="dark">Add Sector</Button>
			</div>
		</form>
	</Card>
</main>
