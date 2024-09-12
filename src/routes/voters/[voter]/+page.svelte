<script>
	//Voter update form page
	import { Input, Label, Button, Card, P, Alert, Modal } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
	let popupModal = false;
	import { PDFDocument, rgb } from 'pdf-lib';

	onMount(() => {
		if (!localStorage.getItem('isAuthenticated')) {
			goto('/');
		}
	});

	export let data; // The fetched data is passed as props to the page component
	let { voter } = data; // Destructure the voters from the data prop

	// Form fields
	let flatNo = voter.flatNo;
	let name = voter.name;
	let phoneNo = voter.phoneNo;
	let yadiNo = voter.yadiNo;
	let srNo = voter.srNo;
	let rscNo = voter.rscNo;
	let buildingName = voter.buildingName;
	let wing = voter.wing;
	let sectorName = voter.sectorName;
	let pollingStation = voter.pollingStation;
	let caste = voter.caste;
	let alert = '';

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
			const response = await fetch(`/api/update-voter/${voter._id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				const result = await response.json();
				alert = 'Voter information updated successfully!';
				setTimeout(() => {
					goto(`/sectors/${voter.sectorName}`);
				}, 2000);
			} else {
				alert = 'Failed to update voter information';
			}
		} catch (error) {
			alert = 'An error occurred';
		}
	}

	// Function to delete voter data
	async function handleDelete() {
		try {
			const response = await fetch(`/api/delete-voter/${voter._id}`, {
				method: 'POST'
			});

			if (response.ok) {
				const result = await response.json();
				alert = 'Voter information deleted successfully!';
				setTimeout(() => {
					goto(`/sectors/${voter.sectorName}`);
				}, 2000);
			} else {
				alert = 'Failed to delete voter information';
			}
		} catch (error) {
			alert = 'An error occurred';
		}
	}

	async function downloadSingleVoterSlip() {
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

		// Add a new page for a single slip
		const page = pdfDoc.addPage([pageWidth, pageHeight]);
		drawTitle(page); // Add the title at the top

		// Draw the slip in the center of the page
		const x = margin; // Start from the left with margin
		const y = pageHeight - titleHeight - slipHeight; // Adjust Y position after the title

		// Assume we're drawing the first voter from filteredVoters (you can modify this to use any voter)
		drawSlip(page, x, y, voter.name, voter.yadiNo, voter.srNo);

		// Save and download the PDF
		const pdfBytes = await pdfDoc.save();
		const blob = new Blob([pdfBytes], { type: 'application/pdf' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'voter_slip.pdf';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<main class="bg-primary-300">
	<!-- Render the table -->
	<Card class="mx-auto max-w-full border-2 border-primary-300 bg-primary-100">
		{#if alert}
			<Alert color="green" class="mb-4 font-semibold">{alert}</Alert>
		{/if}
		<P class="mb-4 text-xl font-bold">Update Resident Information</P>
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
				<Label>
					Building Name:
					<Input type="text" bind:value={buildingName} class="mt-2" required />
				</Label>
				<Label>
					Wing:
					<Input type="text" bind:value={wing} class="mt-2" />
				</Label>
				<Label>
					Sector:
					<Input type="text" bind:value={sectorName} class="mt-2" required />
				</Label>
				<Label class="md:col-span-2">
					Polling Station:
					<Input type="text" bind:value={pollingStation} class="mt-2" />
				</Label>
				<Label>
					Caste:
					<Input type="text" bind:value={caste} class="mt-2" />
				</Label>
			</div>
			<div class="grid gap-4 md:grid-cols-3">
				<Button class="mt-6" type="submit">Update Information</Button>
				<Button color="dark" class="md:mt-6" on:click={downloadSingleVoterSlip}>
					Download Voter Slip
				</Button>
				<Button color="red" class="md:mt-6" on:click={() => (popupModal = true)}
					>Delete Voter</Button
				>
			</div>
			<Modal bind:open={popupModal} autoclose>
				<div class="text-center">
					<ExclamationCircleOutline
						class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200"
					/>
					<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
						Are you sure you want to delete this voter?
					</h3>
					<Button on:click={handleDelete} color="red" class="me-2">Yes, I'm sure</Button>
					<Button color="alternative">No, cancel</Button>
				</div>
			</Modal>
		</form>
	</Card>
</main>
