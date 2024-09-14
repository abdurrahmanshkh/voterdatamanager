<script>
	//Sectors List Page
	import { Alert, Button, ButtonGroup, Card, Input, P } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { PDFDocument, rgb } from 'pdf-lib';
	import { Table, TableBody, TableBodyCell } from 'flowbite-svelte';
	import { TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';

	onMount(() => {
		if (!localStorage.getItem('isAuthenticated')) {
			goto('/');
		}
	});

	// Form fields
	let flatNo = '';
	let name = '';
	let phoneNo = '';
	let yadiNo = '';
	let srNo = '';
	let rscNo = '';
	let buildingName = '';
	let wing = '';
	let sectorName = '';
	let pollingStation = '';
	let caste = '';
	let alert = '';
	let searchTerm = ''; // Search term for filtering voters

	export let data; // The fetched data is passed as props to the page component
	let { voters } = data; // Destructure the voters from the data prop

	let uniqueSectors = [...new Set(voters.map((voter) => voter.sectorName))]; // Get unique building names

	async function downloadVoterSlips() {
		const pdfDoc = await PDFDocument.create();
		const pageWidth = 595.276; // A4 width in points
		const pageHeight = 841.89; // A4 height in points
		const slipWidth = pageWidth / 2; // Two columns
		const slipHeight = pageHeight / 6 - 10; // Six rows

		const margin = 10; // Adjusted margin
		const slipMargin = 10; // Adjusted slip padding
		const textSize = 14; // Adjusted text size
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
				y: y + slipHeight - slipMargin - textSize - 16,
				size: textSize
			});
			page.drawText(`List No / Part No: ${yadiNo}`, {
				x: x + slipMargin,
				y: y + slipHeight - slipMargin - 2 * textSize - 22,
				size: textSize
			});
			page.drawText(`Sr No: ${srNo}`, {
				x: x + slipMargin,
				y: y + slipHeight - slipMargin - 3 * textSize - 28,
				size: textSize
			});
			page.drawText(`Polling Station Address:`, {
				x: x + slipMargin,
				y: y + slipHeight - slipMargin - 4 * textSize - 34,
				size: textSize
			});
			page.drawText(`${pollingStation}`, {
				x: x + slipMargin,
				y: y + slipHeight - slipMargin - 5 * textSize - 40,
				size: textSize
			});
		}

		// Draws the title at the top of each page
		function drawTitle(page) {
			page.drawText(`Sajid Patel - Voter's Data`, {
				x: margin,
				y: pageHeight - margin - titleHeight / 2,
				size: 16,
				color: rgb(0, 0, 0)
			});
		}

		for (let i = 0; i < voters.length; i++) {
			const voter = voters[i];

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
			pollingStation,
			caste
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

	// Create a set of unique combinations of building and sector
	let uniqueBuildings = Array.from(
		new Map(
			voters.map((voter) => [
				voter.buildingName + '-' + voter.sectorName,
				{ buildingName: voter.buildingName, sectorName: voter.sectorName }
			])
		).values()
	);

	// Input value for filtering
	let filterText = '';

	// Filter function to match building name or sector name
	$: filteredBuildings = uniqueBuildings.filter(
		(building) =>
			building.buildingName.toLowerCase().includes(filterText.toLowerCase()) ||
			building.sectorName.toLowerCase().includes(filterText.toLowerCase())
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
			</div>
		{/if}
	</Card>

	<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
		<div class="grid md:grid-cols-3">
			<P class="text-xl font-bold md:col-span-2 md:mt-2">Select a Sector</P>
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
						<TableHeadCell>Building Name</TableHeadCell>
						<TableHeadCell>Sector Name</TableHeadCell>
					</TableHead>
					<TableBody>
						{#each filteredBuildings as building}
							<TableBodyRow
								class="border-blue-900 bg-blue-100 hover:bg-blue-200"
								on:click={() => goto(`/sectors/${building.sectorName}`)}
							>
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
				<Button color="blue" on:click={() => goto(`sectors/${sector}`)}>
					{sector}
				</Button>
			{/each}
		</div>
	</Card>

	<div class="grid md:grid-cols-2">
		<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
			<P class="col-span-2 mb-4 text-xl font-bold">Download Data</P>
			<div class="grid gap-2 md:grid-cols-2">
				<Button on:click={downloadVoterSlips} color="green">Download Slips</Button>
				<Button on:click={() => goto('/downloadTable')} color="dark">Download Table</Button>
			</div>
		</Card>
		<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
			<P class="col-span-2 mb-4 text-xl font-bold">Update Data</P>
			<div class="grid gap-2 md:grid-cols-2">
				<Button
					color="dark"
					class="bg-gray-600"
					href="https://docs.google.com/spreadsheets/d/1AHBuP9vZTG7B3wKJv_m_3UDqvLrGhMLH122X8P4k9_Y/edit?usp=sharing"
					target="_blank"
					rel="noopener noreferrer"
				>
					Open CSV Format
				</Button>
				<Button on:click={() => goto('/updateBooth')} color="dark">Update Polling Booth</Button>
			</div>
		</Card>
	</div>

	<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
		{#if alert}
			<Alert color="green" class="mb-4 font-bold">{alert}</Alert>
		{/if}
		<form on:submit|preventDefault={handleSubmit}>
			<P class="mb-4 text-xl font-bold">Add New Sector</P>
			<div class="grid w-full gap-4 md:grid-cols-3">
				<Input type="text" bind:value={buildingName} placeholder="Building Name" required />
				<Input type="text" bind:value={sectorName} placeholder="Sector Name" required />
				<Button type="submit" color="dark">Add Sector</Button>
			</div>
		</form>
	</Card>
</main>
