<script>
	//Sectors List Page
	import { Alert, Button, ButtonGroup, Card, Input, InputAddon, Label, P } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { PDFDocument, rgb } from 'pdf-lib';

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

	export let data; // The fetched data is passed as props to the page component
	let { voters } = data; // Destructure the voters from the data prop

	let uniqueSectors = [...new Set(voters.map((voter) => voter.sectorName))]; // Get unique building names

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
		function drawSlip(page, x, y, name, yadiNo, srNo) {
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

			drawSlip(page, x, y, voter.name, voter.yadiNo, voter.srNo);
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
			flatNo,
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
</script>

<main class="bg-primary-300">
	<Card class="mx-auto max-w-full border-2 border-primary-300 bg-primary-100">
		<P class="mb-4 text-xl font-bold">Select a Sector</P>
		<div class="grid grid-cols-2 gap-2 md:grid-cols-5">
			{#each uniqueSectors as sector}
				<Button on:click={() => goto(`sectors/${sector}`)}>
					{sector}
				</Button>
			{/each}
		</div>
	</Card>
	<Card
		class="mx-auto grid max-w-full gap-2 border-2 border-primary-300 bg-primary-100 md:grid-cols-4"
	>
		<Button on:click={downloadCSV} color="blue">Download Table</Button>
		<Button on:click={downloadVoterSlips} color="red">Download Slips</Button>
		<Button on:click={() => goto('/updateBooth')} color="dark">Update Polling Booth</Button>
		<Button
			href="https://docs.google.com/spreadsheets/d/1AHBuP9vZTG7B3wKJv_m_3UDqvLrGhMLH122X8P4k9_Y/edit?usp=sharing"
			target="_blank"
			rel="noopener noreferrer"
		>
			Open CSV Format
		</Button>
	</Card>

	<Card class="mx-auto max-w-full border-2 border-primary-300 bg-primary-100">
		{#if alert}
			<Alert color="green" class="mb-4 font-bold">{alert}</Alert>
		{/if}
		<form on:submit|preventDefault={handleSubmit}>
			<P class="mb-4 text-xl font-bold">Add New Sector</P>
			<ButtonGroup class="w-full">
				<Input id="input-addon" type="text" bind:value={sectorName} required />
				<Button type="submit" color="primary" class="min-w-fit max-w-fit">Add Sector</Button>
			</ButtonGroup>
		</form>
	</Card>
</main>
