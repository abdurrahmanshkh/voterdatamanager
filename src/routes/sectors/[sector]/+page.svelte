<script>
	//Building List Page
	import { Input, Label, Button, Card, P, Alert } from 'flowbite-svelte';
	import { Table, TableBody, TableBodyCell, Modal } from 'flowbite-svelte';
	import { TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
	import { PDFDocument, rgb } from 'pdf-lib';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
	let popupModal = false;

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
	let name = '';
	let phoneNo = '';
	let yadiNo = '';
	let srNo = '';
	let rscNo = '';
	let buildingName = '';
	let wing = '';
	let sectorName = voters[0].sectorName;
	let buildingNo = '';
	let pollingStation = '';
	let caste = '';
	let newBuildingName = '';
	let newSectorName = '';
	let note = '';
	let newBuildingNo = '';

	let alert = '';
	let searchTerm = '';

	// Reactive variable for filtered voters
	$: filteredBuildings = selectedBuilding
		? voters.filter((voter) => voter.buildingName === selectedBuilding)
		: voters;

	$: if (selectedBuilding) {
		buildingNo = filteredBuildings[0].buildingNo;
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
		filteredVoters.forEach((voter) => {
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

	async function downloadVoterSlips() {
		const pdfDoc = await PDFDocument.create();
		const pageWidth = 595.276; // A4 width in points
		const pageHeight = 841.89; // A4 height in points
		const slipWidth = pageWidth / 2; // Two columns
		const slipHeight = pageHeight / 6 - 10; // Six rows

		const margin = 10; // Adjusted margin
		const slipMargin = 10; // Adjusted slip padding
		const textSize = 12; // Adjusted text size
		const titleHeight = 40; // Space for the title on top

		// Draws a slip
		function drawSlip(page, x, y, name, yadiNo, srNo, pollingStation) {
			page.drawRectangle({
				x,
				y,
				width: slipWidth - 2 * slipMargin,
				height: slipHeight - 2 * slipMargin,
				color: rgb(1, 1, 1),
				borderColor: rgb(0, 0, 0),
				borderWidth: 1
			});
			page.drawText(`Name: ${name}`, {
				x: x + slipMargin,
				y: y + slipHeight - slipMargin - textSize - 19,
				size: textSize
			});
			page.drawText(`List No / Part No: ${yadiNo}`, {
				x: x + slipMargin,
				y: y + slipHeight - slipMargin - 2 * textSize - 26,
				size: textSize
			});
			page.drawText(`Sr No: ${srNo}`, {
				x: x + slipMargin,
				y: y + slipHeight - slipMargin - 3 * textSize - 33,
				size: textSize
			});
			page.drawText(`Polling Station Address:`, {
				x: x + slipMargin,
				y: y + slipHeight - slipMargin - 4 * textSize - 40,
				size: textSize
			});
			page.drawText(`${pollingStation}`, {
				x: x + slipMargin,
				y: y + slipHeight - slipMargin - 5 * textSize - 47,
				size: textSize
			});
		}

		// Draws the title at the top of each page
		function drawTitle(page) {
			page.drawText(`Sajid Patel - Voter's Data - ${selectedBuilding} ${sectorName}`, {
				x: margin,
				y: pageHeight - margin - titleHeight / 2,
				size: 16,
				color: rgb(0, 0, 0)
			});
		}

		for (let i = 0; i < filteredVoters.length; i++) {
			const voter = filteredVoters[i];

			// Add a new page if necessary (for every 12 voters)
			if (i % 12 === 0) {
				pdfDoc.addPage([pageWidth, pageHeight]);
				const page = pdfDoc.getPage(pdfDoc.getPageCount() - 1);
				drawTitle(page); // Add the title on each page
			}

			const page = pdfDoc.getPage(Math.floor(i / 12));

			// Calculate the position for the slip on the page (6 rows, 2 columns)
			const row = (i % 12) % 6;
			const col = Math.floor((i % 12) / 6);
			const x = col * slipWidth + margin;
			const y = pageHeight - titleHeight - (row + 1) * slipHeight + 10;

			drawSlip(page, x, y, voter.name, voter.yadiNo, voter.srNo, voter.pollingStation);
		}

		// Save and download the PDF
		const pdfBytes = await pdfDoc.save();
		const blob = new Blob([pdfBytes], { type: 'application/pdf' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'voter_slips.pdf';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	// Function to delete voter data
	async function handleDelete() {
		try {
			const response = await fetch(`/api/delete-building/${selectedBuilding}`, {
				method: 'POST'
			});

			if (response.ok) {
				const result = await response.json();
				alert = 'Building information deleted successfully!';
				// Refresh page
				location.reload();
			} else {
				alert = 'Failed to delete building information';
			}
		} catch (error) {
			alert = 'An error occurred';
		}
	}

	//Function to update building name
	async function updateBuildingName() {
		try {
			const response = await fetch(`/api/update-buildingName/${sectorName}:${selectedBuilding}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ buildingName: newBuildingName })
			});

			if (response.ok) {
				const result = await response.json();
				alert = 'Building information updated successfully!';
				// Refresh page
				location.reload();
			} else {
				alert = 'Failed to update building information';
			}
		} catch (error) {
			alert = 'An error occurred';
		}
	}

	//Function to update building no
	async function updateBuildingNo() {
		try {
			const response = await fetch(`/api/update-buildingNo/${sectorName}:${selectedBuilding}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ buildingNo: newBuildingNo })
			});

			if (response.ok) {
				const result = await response.json();
				alert = 'Building information updated successfully!';
				// Refresh page
				location.reload();
			} else {
				alert = 'Failed to update building information';
			}
		} catch (error) {
			alert = 'An error occurred';
		}
	}

	//Function to update sector name
	async function updateSectorName() {
		try {
			const response = await fetch(`/api/update-sectorName/${sectorName}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ sectorName: newSectorName })
			});

			if (response.ok) {
				const result = await response.json();
				alert = 'Sector information updated successfully!';
				// Go to sectors page
				goto('/sectors');
			} else {
				alert = 'Failed to update sector information';
			}
		} catch (error) {
			alert = 'An error occurred';
		}
	}
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
			<Button on:click={downloadVoterSlips} color="green">Download Slips</Button>
			<Button on:click={downloadCSV} color="dark">Download Table</Button>
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
				class="mb-4 mt-2 md:mt-0"
			/>
		</div>
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
						on:click={() => goto(`/voters/${voter._id}`)}
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
						<Input type="text" bind:value={buildingNo} class="mt-2" required disabled />
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
				<div></div>
				<div></div>
				{#if selectedBuilding}
					<Button color="red" class="mt-6" on:click={() => (popupModal = true)}
						>Delete Building Data</Button
					>
				{/if}
			</div>
		</form>
	</Card>
	{#if selectedBuilding}
		<!-- Update building name card -->
		<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
			<P class="mb-4 text-xl font-bold">Update Building Name</P>
			<div class="grid gap-4 md:grid-cols-3">
				<Label>
					Current Building Name:
					<Input type="text" bind:value={selectedBuilding} class="mt-2" required disabled />
				</Label>
				<Label>
					New Building Name:
					<Input type="text" bind:value={newBuildingName} class="mt-2" required />
				</Label>
				<Button on:click={updateBuildingName} class="md:mt-7" type="submit" color="dark">
					Update Building Name
				</Button>
			</div>
		</Card>
		<!-- Update building no card -->
		<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
			<P class="mb-4 text-xl font-bold">Update Building No</P>
			<div class="grid gap-4 md:grid-cols-3">
				<Label>
					Current Building No:
					<Input type="text" bind:value={buildingNo} class="mt-2" required disabled />
				</Label>
				<Label>
					New Building No:
					<Input type="text" bind:value={newBuildingNo} class="mt-2" required />
				</Label>
				<Button on:click={updateBuildingNo} class="md:mt-7" type="submit" color="dark">
					Update Building No
				</Button>
			</div>
		</Card>
	{:else}
		<!-- Update sector name card -->
		<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
			<P class="mb-4 text-xl font-bold">Update Sector Name</P>
			<div class="grid gap-4 md:grid-cols-3">
				<Label>
					Current Sector Name:
					<Input type="text" bind:value={sectorName} class="mt-2" required disabled />
				</Label>
				<Label>
					New Sector Name:
					<Input type="text" bind:value={newSectorName} class="mt-2" required />
				</Label>
				<Button on:click={updateSectorName} class="md:mt-7" type="submit" color="dark">
					Update Sector Name
				</Button>
			</div>
		</Card>
	{/if}
	<Modal bind:open={popupModal} autoclose>
		<div class="text-center">
			<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
			<h3 class="mb-5 text-lg font-normal text-gray-300 dark:text-gray-400">
				Are you sure you want to delete this building?
			</h3>
			<Button on:click={handleDelete} color="red" class="me-2">Yes, I'm sure</Button>
			<Button color="alternative">No, cancel</Button>
		</div>
	</Modal>
</main>
