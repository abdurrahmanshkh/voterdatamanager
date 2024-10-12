<script>
	//Sectors List Page
	import { Alert, Button, Label, Card, Input, P, Modal } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { PDFDocument, rgb } from 'pdf-lib';
	import { Table, TableBody, TableBodyCell, Spinner } from 'flowbite-svelte';
	import { TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
	import { Accordion, AccordionItem } from 'flowbite-svelte';
	import { ExclamationCircleOutline } from 'flowbite-svelte-icons';

	export let data; // The fetched data is passed as props to the page component
	let { surveyor } = data; // Destructure the sectors from the data prop

	let voters = [];
	let sharedResidents = [];
	let newPhoneNumber = '';

	// Popup Modals
	let deleteVoterModal = false;
	let buildingAccordion = true;

	// On mount, check authentication and fetch voter data
	onMount(() => {
		if (localStorage.getItem('authenticated') !== '179438144299' || !surveyor) {
			goto(`/surveyor`);
		} else {
			// Fetch voter data from the API endpoint
			async function fetchVoters() {
				try {
					const response = await fetch('/api/fetch-all-voters');
					const data = await response.json();

					if (response.ok) {
						voters = data.voters;
					} else {
						error = data.error || 'An error occurred';
					}
				} catch (err) {
					console.error('Fetch error:', err);
					error = 'Failed to load data';
				}
			}
			// Call the function to fetch data when the page loads
			fetchVoters();
		}
	});

	let selectedSector = '';
	let selectedBuilding = '';
	let selectedBuildingNo = '';

	let voterSearchTerm = '';
	let locationSearchTerm = '';

	const sectorList = [
		'SECTOR 23',
		'SECTOR 27',
		'SECTOR 30 1',
		'SECTOR 30 2',
		'OWA 1',
		'OWA 2',
		'SECTOR 35 D',
		'SECTOR 35 E',
		'SECTOR 35 F',
		'SECTOR 35 G',
		'SECTOR 35 H',
		'SECTOR 35 I',
		'KHUTUKBANDHAN',
		'FARSHI PADA',
		'SECTOR 34 A',
		'SECTOR 34 B',
		'SECTOR 34 C',
		'SECTOR 20',
		'PETH GAON',
		'OWA CAMP',
		'SECTOR 36',
		'SECTOR 39',
		'SECTOR 40'
	];

	// Get unique sectors based on location search input
	$: filteredSectors = [
		...new Set(
			voters
				.filter(
					(voter) =>
						voter.sectorName.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
						voter.buildingName.toLowerCase().includes(locationSearchTerm.toLowerCase())
				)
				.map((voter) => voter.sectorName)
		)
	];

	// Get unique buildings based on selected sector and location search input
	$: filteredBuildings = [
		...new Set(
			voters
				.filter(
					(voter) =>
						(!selectedSector || voter.sectorName === selectedSector) &&
						voter.buildingName.toLowerCase().includes(locationSearchTerm.toLowerCase())
				)
				.sort((a, b) => a.buildingNo - b.buildingNo) // Sort by buildingNo
				.map((voter) => voter.buildingName)
		)
	];

	let searchedVoters = [];

	//Search voters array
	function searchForVoter() {
		if (voterSearchTerm.length > 4) {
			searchedVoters = voters.filter((voter) => {
				const nameMatch = voter.name.toLowerCase().includes(voterSearchTerm.toLowerCase());
				const phoneNoMatch = voter.phoneNo.includes(voterSearchTerm);
				const rscNoMatch = voter.rscNo.toLowerCase().includes(voterSearchTerm.toLowerCase());
				return nameMatch || phoneNoMatch || rscNoMatch;
			});
		} else {
			searchedVoters = [];
		}
	}

	// Create an object that stores unique yadiNo and their corresponding pollingStation
	$: yadiPollingStations = voters.reduce((acc, voter) => {
		const { yadiNo, pollingStation } = voter;

		// If yadiNo exists and pollingStation is not empty, process it
		if (yadiNo && pollingStation) {
			// If the yadiNo is not already in the accumulator, add it
			if (!acc[yadiNo]) {
				acc[yadiNo] = pollingStation;
			}
		}

		return acc;
	}, {});

	// Convert the object into an array if you want a more iterable format
	$: yadiPollingArray = Object.entries(yadiPollingStations).map(([yadiNo, pollingStation]) => ({
		yadiNo,
		pollingStation
	}));

	// Watch for changes in yadiNo and update pollingStation if found in yadiPollingArray
	$: if (yadiNo) {
		const matchedEntry = yadiPollingArray.find((entry) => entry.yadiNo === yadiNo);
		if (matchedEntry) {
			pollingStation = matchedEntry.pollingStation;
		} else {
			pollingStation = ''; // Clear pollingStation if no match is found
		}
	}

	function selectSector(sector) {
		buildingAccordion = true;
		showForm = false;
		sectorName = '';
		selectedSector = sector;
		selectedBuilding = ''; // Reset building selection when a new sector is selected
		locationSearchTerm = ''; // Clear location search term
		resetForm();
	}

	function selectBuilding(building) {
		buildingAccordion = false;
		showForm = false;
		buildingName = '';
		buildingNo = '';
		selectedBuilding = building;
		locationSearchTerm = ''; // Clear location search term
		resetForm();
	}

	function resetSector() {
		selectedSector = '';
		selectedBuilding = '';
		voterSearchTerm = '';
		locationSearchTerm = '';
		searchedVoters = [];
		sharedResidents = [];
		showForm = false;
		resetForm();
	}

	let flatNo = '';
	let name = '';
	let phoneNo = '';
	let yadiNo = '';
	let srNo = '';
	let rscNo = '';
	let buildingName = '';
	let wing = '';
	let sectorName = '';
	let buildingNo = ''; // Assuming buildingNo is unique per building
	let pollingStation = '';
	let caste = '';
	let note = '';
	let alert = '';

	//Auto capitalise form fields
	$: if (!showForm) {
		flatNo = flatNo.toUpperCase();
		name = name.toUpperCase();
		rscNo = rscNo.toUpperCase();
		buildingName = buildingName.toUpperCase();
		wing = wing.toUpperCase();
		sectorName = sectorName.toUpperCase();
		pollingStation = pollingStation.toUpperCase();
		caste = caste.toUpperCase();
		note = note.toUpperCase();
	}

	// Function to reset form
	function resetForm() {
		flatNo = '';
		name = '';
		phoneNo = '';
		yadiNo = '';
		srNo = '';
		rscNo = '';
		buildingName = selectedBuilding || '';
		wing = '';
		sectorName = selectedSector || '';
		buildingNo = '';
		pollingStation = '';
		caste = '';
		note = '';
	}

	// Automatically bind and disable fields if a sector or building is selected
	$: if (selectedBuilding) {
		// Assuming each building has a unique buildingNo
		const selectedBuildingDetails = voters.find((voter) => voter.buildingName === selectedBuilding);
		selectedBuildingNo = selectedBuildingDetails?.buildingNo || '';
		selectedSector = selectedBuildingDetails?.sectorName || '';
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
			buildingName: buildingName || selectedBuilding,
			wing,
			sectorName: sectorName || selectedSector,
			buildingNo: buildingNo || selectedBuildingNo,
			pollingStation,
			caste,
			note
		};

		if (!showForm) {
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
					alert = `Voter - ${formData.name} added successfully!`;
					// Add new voter to voters array
					voters = [...voters, formData];
					// Reset form fields
					resetForm();
				} else {
					alert = 'Failed to add voter';
				}
			} catch (error) {
				alert = 'An error occurred';
			}
		} else {
			try {
				const response = await fetch(`/api/update-voter/${currentVoter._id}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(formData)
				});

				const surveyResponse = await fetch(`/api/update-formsUpdated/${surveyor._id}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (response.ok) {
					alert = 'Voter information updated successfully!';
					showForm = false; // Hide the form
					// Update current voter object
					currentVoter = { ...currentVoter, ...formData };
					// Update voters array
					voters = voters.map((voter) => (voter._id === currentVoter._id ? currentVoter : voter));
					// Reset form fields
					resetForm();
				} else {
					alert = 'Failed to update voter information';
				}
			} catch (error) {
				alert = 'An error occurred';
			}
		}
	}

	let showForm = false;
	let currentVoter = null;

	// Function to show the form with the current voter details
	function showVoterForm(voter) {
		currentVoter = voter;
		flatNo = voter.flatNo;
		name = voter.name;
		phoneNo = voter.phoneNo;
		yadiNo = voter.yadiNo;
		srNo = voter.srNo;
		rscNo = voter.rscNo;
		buildingName = voter.buildingName;
		wing = voter.wing;
		sectorName = voter.sectorName;
		buildingNo = voter.buildingNo;
		pollingStation = voter.pollingStation;
		caste = voter.caste;
		note = voter.note;
		showForm = true;
		alert = ''; // Clear any previous alerts

		// Populate sharedResidents with voters who share the same flatNo, buildingName, sectorName, and wing
		sharedResidents = voters.filter(
			(v) =>
				v.flatNo === flatNo &&
				v.buildingName === buildingName &&
				v.sectorName === sectorName &&
				v.wing === wing
		);
	}

	// Function to delete voter data
	async function handleDelete() {
		try {
			const response = await fetch(`/api/delete-voter/${currentVoter._id}`, {
				method: 'POST'
			});

			const surveyResponse = await fetch(`/api/update-formsDeleted/${surveyor._id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				alert = 'Voter information deleted successfully!';
				showForm = false; // Hide the form
				// Remove the deleted voter from the voters array
				voters = voters.filter((voter) => voter._id !== currentVoter._id);
				// Reset form fields
				resetForm();
			} else {
				alert = 'Failed to delete voter information';
			}
		} catch (error) {
			alert = 'An error occurred';
		}
	}

	async function downloadVoterSlips() {
		const pdfDoc = await PDFDocument.create();
		const pageWidth = 595.276; // A4 width in points
		const pageHeight = 841.89; // A4 height in points
		const slipWidth = pageWidth / 2; // Two columns
		const slipHeight = pageHeight / 6 - 10; // Six rows

		const margin = 10; // Adjusted margin
		const slipMargin = 10; // Adjusted slip padding
		const textSize = 10; // Adjusted text size
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
			page.drawText(`NAME: ${name}`, {
				x: x + slipMargin,
				y: y + slipHeight - slipMargin - textSize - 23,
				size: textSize
			});
			page.drawText(`LIST NO / PART NO: ${yadiNo}`, {
				x: x + slipMargin,
				y: y + slipHeight - slipMargin - 2 * textSize - 31,
				size: textSize
			});
			page.drawText(`SR NO: ${srNo}`, {
				x: x + slipMargin,
				y: y + slipHeight - slipMargin - 3 * textSize - 39,
				size: textSize
			});
			page.drawText(`POLLING STATION ADDRESS:`, {
				x: x + slipMargin,
				y: y + slipHeight - slipMargin - 4 * textSize - 47,
				size: textSize
			});
			page.drawText(`${pollingStation}`, {
				x: x + slipMargin,
				y: y + slipHeight - slipMargin - 5 * textSize - 55,
				size: textSize
			});
		}

		// Draws the title at the top of each page
		function drawTitle(page) {
			page.drawText(
				`SAJID PATEL - VOTER'S DATA - ${selectedBuilding || ''} ${selectedSector || ''}`,
				{
					x: margin,
					y: pageHeight - margin - titleHeight / 2,
					size: 16,
					color: rgb(0, 0, 0)
				}
			);
		}

		for (let i = 0; i < sharedResidents.length; i++) {
			const voter = sharedResidents[i];

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

	let message = '';

	// Define the phone number and the message
	$: if (sharedResidents.length > 1) {
		message = `Dear ${name},\nYour family members' voting details are as follows:\n\n${sharedResidents.map((resident) => `- Name: ${resident.name}\n- EPIC No: ${resident.rscNo}\n- List No / Part No: ${resident.yadiNo}\n- Sr No: ${resident.srNo}\n- Polling Station Address: ${resident.pollingStation}`).join('\n\n')}\n\nPlease keep this information handy for the upcoming vote. For any queries, feel free to contact us.`;
	} else {
		message = `Dear ${name},\nYour voting details are as follows:\n- EPIC No: ${rscNo}\n- List No / Part No: ${yadiNo}\n- Sr No: ${srNo}\n- Polling Station Address: ${pollingStation}\nPlease keep this information handy for your upcoming vote. For any queries, feel free to contact us.`;
	}

	// Function to create the SMS link
	function sendSMS() {
		// Encode the message to be used in the SMS link
		let smsLink = `sms:+91${newPhoneNumber || phoneNo}?&body=${encodeURIComponent(message)}`;
		// Redirect to the SMS app
		window.location.href = smsLink;
	}
	// Function to create the WhatsApp link
	function sendWhatsAppMessage() {
		// Encode the message to be used in the WhatsApp link
		let whatsappLink = `https://wa.me/+91${newPhoneNumber || phoneNo}?text=${encodeURIComponent(message)}`;
		// Open WhatsApp with the pre-filled message
		window.location.href = whatsappLink;
	}
</script>

<main class="bg-gray-300">
	<!-- Search Bar for Voters -->
	<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
		<div class="grid gap-3 md:grid-cols-3">
			<P class="text-xl font-bold md:mt-2">Search for Voter</P>
			<Input
				placeholder="Search by Voter Information"
				bind:value={voterSearchTerm}
				on:input={searchForVoter}
			/>
			<div class="grid grid-cols-2 gap-2">
				<Button on:click={searchForVoter} color="blue" class>Search</Button>
				<Button on:click={resetSector} color="dark">Reset</Button>
			</div>
		</div>
		{#if searchedVoters.length > 0}
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
						{#each searchedVoters as voter}
							<TableBodyRow
								class="border-blue-900 bg-blue-100 hover:bg-blue-200"
								on:click={() => showVoterForm(voter)}
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
				bind:value={locationSearchTerm}
				class="mt-2 md:mt-0"
			/>
		</div>
		<!-- Sector Buttons (filtered by location search input) -->
		{#if filteredSectors.length > 0}
			<div class="mt-4 grid grid-cols-2 gap-1 md:grid-cols-6">
				{#if locationSearchTerm}
					{#each filteredSectors as sector}
						<Button on:click={() => selectSector(sector)} class="bg-blue-900">
							{sector}
						</Button>
					{/each}
				{:else}
					{#each sectorList as sector}
						<Button on:click={() => selectSector(sector)} class="bg-blue-900">
							{sector}
						</Button>
					{/each}
				{/if}
			</div>
		{:else}
			<div class="mt-4 text-center"><Spinner color="blue" /></div>
		{/if}
	</Card>

	<!-- Building Buttons (filtered by location search input) -->
	{#if selectedSector || locationSearchTerm}
		<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100 md:p-1" padding="none">
			<Accordion>
				<AccordionItem bind:open={buildingAccordion}>
					<span slot="header">
						<P class="text-xl font-bold">Buildings in {selectedSector}</P>
					</span>
					<div class="grid grid-cols-2 gap-1 md:grid-cols-6">
						{#each filteredBuildings as building}
							<Button on:click={() => selectBuilding(building)} color="blue">
								{building}
							</Button>
						{/each}
					</div>
				</AccordionItem>
			</Accordion>
		</Card>
	{/if}

	<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
		{#if alert}
			<Alert color="green" class="mb-4 font-bold">{alert}</Alert>
		{/if}
		{#if showForm}
			<P class="mb-4 text-xl font-bold">Update Resident</P>
		{:else}
			<P class="mb-4 text-xl font-bold">Add Resident to {selectedBuilding || 'New Building'}</P>
		{/if}
		<form on:submit|preventDefault={handleSubmit}>
			<div class="grid gap-4 md:grid-cols-3">
				<div>
					<Label>
						Flat No
						<Input type="text" class="mt-2" bind:value={flatNo} />
					</Label>
				</div>

				<div>
					<Label>
						Name
						<Input type="text" class="mt-2" bind:value={name} required />
					</Label>
				</div>

				<div>
					<Label>
						Phone No
						<Input type="text" class="mt-2" bind:value={phoneNo} />
					</Label>
				</div>

				<div>
					<Label>
						Yadi No
						<Input type="text" class="mt-2" bind:value={yadiNo} />
					</Label>
				</div>

				<div>
					<Label>
						Sr No
						<Input type="text" class="mt-2" bind:value={srNo} />
					</Label>
				</div>

				<div>
					<Label>
						RSC No
						<Input type="text" class="mt-2" bind:value={rscNo} />
					</Label>
				</div>

				{#if showForm || !selectedBuilding}
					<div>
						<Label>
							Building Name
							<Input type="text" class="mt-2" bind:value={buildingName} required />
						</Label>
					</div>

					<div>
						<Label>
							Building No
							<Input type="text" class="mt-2" bind:value={buildingNo} />
						</Label>
					</div>
				{:else}
					<div>
						<Label>
							Building Name
							<Input type="text" class="mt-2" bind:value={selectedBuilding} required disabled />
						</Label>
					</div>

					<div>
						<Label>
							Building No
							<Input type="text" class="mt-2" bind:value={selectedBuildingNo} disabled />
						</Label>
					</div>
				{/if}

				<div>
					<Label>
						Wing
						<Input type="text" class="mt-2" bind:value={wing} />
					</Label>
				</div>

				{#if showForm || !selectedSector}
					<div>
						<Label>
							Sector Name
							<Input type="text" class="mt-2" bind:value={sectorName} required />
						</Label>
					</div>
				{:else}
					<div>
						<Label>
							Sector Name
							<Input type="text" class="mt-2" bind:value={selectedSector} required disabled />
						</Label>
					</div>
				{/if}

				<div class="md:col-span-2">
					<Label>
						Polling Station
						<Input type="text" class="mt-2" bind:value={pollingStation} />
					</Label>
				</div>

				<div>
					<Label>
						Caste
						<Input type="text" class="mt-2" bind:value={caste} />
					</Label>
				</div>

				<div class="md:col-span-2">
					<Label>
						Note
						<Input type="text" class="mt-2" bind:value={note} />
					</Label>
				</div>
			</div>
			<div class="mt-6 grid gap-4 md:grid-cols-3">
				{#if showForm}
					<Button type="submit" color="dark">Update Information</Button>
					<Button on:click={downloadVoterSlips} color="green">Download Slips</Button>
					<Button type="button" on:click={() => (deleteVoterModal = true)} color="red">
						Delete Voter
					</Button>
				{:else}
					<Button type="submit" color="dark">Add Voter</Button>
				{/if}
			</div>
		</form>
	</Card>

	{#if sharedResidents.length > 1}
		<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
			<P class="mb-4 text-xl font-bold">
				Residents of {currentVoter.wing}{currentVoter.flatNo}, {currentVoter.buildingName}
			</P>
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
					{#each sharedResidents as resident}
						<TableBodyRow
							class="border-blue-900 bg-blue-100 hover:bg-blue-200"
							on:click={() => (window.location.href = `/voters/${resident._id}`)}
						>
							<TableBodyCell>{resident.flatNo}</TableBodyCell>
							<TableBodyCell>{resident.name}</TableBodyCell>
							<TableBodyCell>{resident.phoneNo}</TableBodyCell>
							<TableBodyCell>{resident.yadiNo}</TableBodyCell>
							<TableBodyCell>{resident.srNo}</TableBodyCell>
							<TableBodyCell>{resident.rscNo}</TableBodyCell>
							<TableBodyCell>{resident.buildingName}</TableBodyCell>
							<TableBodyCell>{resident.wing}</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		</Card>
	{/if}

	{#if showForm}
		<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
			<P class="mb-4 text-xl font-bold">Send Voter Details</P>
			<div class="grid gap-4 md:grid-cols-3">
				<Input placeholder="Send on new number" type="text" bind:value={newPhoneNumber} />
				<Button color="blue" on:click={sendSMS}>Send via SMS</Button>
				<Button color="green" on:click={sendWhatsAppMessage}>Send via WhatsApp</Button>
			</div>
		</Card>
	{/if}
</main>

<!-- Delete voter modal -->
<Modal bind:open={deleteVoterModal} autoclose>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			Are you sure you want to delete this voter?
		</h3>
		<Button on:click={handleDelete} color="red" class="me-2">Yes, I'm sure</Button>
		<Button color="alternative">No, cancel</Button>
	</div>
</Modal>
