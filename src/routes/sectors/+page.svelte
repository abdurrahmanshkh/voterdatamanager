<script>
	//Sectors List Page
	import { Alert, Button, Label, Card, Input, P, Modal } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { onMount, beforeUpdate } from 'svelte';
	import { PDFDocument, rgb } from 'pdf-lib';
	import { Table, TableBody, TableBodyCell, Spinner } from 'flowbite-svelte';
	import { TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
	import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import { AccordionItem, Accordion } from 'flowbite-svelte';

	let scrollPosition = 0;

	// Save scroll position when the app goes into the background
	beforeUpdate(() => {
		scrollPosition = window.pageYOffset;
	});

	let voters = [];
	let sharedResidents = [];
	let newPhoneNumber = '';

	// Popup Modals
	let deleteVoterModal = false;
	let deleteBuildingModal = false;
	let buildingAccordion = true;
	let residentsAccordion = false;

	// On mount, check authentication and fetch voter data
	onMount(() => {
		window.scrollTo(0, scrollPosition);
		if (localStorage.getItem('isAuthenticated') !== '123456') {
			goto('/');
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

	// Filter voters based on selected sector, building, and voter search term
	$: filteredVoters = voters
		.filter((voter) => {
			const matchesSector = !selectedSector || voter.sectorName === selectedSector;
			const matchesBuilding = !selectedBuilding || voter.buildingName === selectedBuilding;
			return matchesSector && matchesBuilding;
		})
		.sort((a, b) => {
			// First compare the wing (alphabetically)
			if (a.wing.toLowerCase() < b.wing.toLowerCase()) return -1;
			if (a.wing.toLowerCase() > b.wing.toLowerCase()) return 1;

			// If wings are the same, then compare flatNo (numerically/lexicographically)

			// Helper function to extract numeric part of flatNo, if available
			function extractNumericValue(flatNo) {
				const match = flatNo.match(/\d+/); // Extract first numeric sequence
				return match ? parseInt(match[0], 10) : null; // Return number or null if not found
			}

			// Get numeric and alphanumeric parts for both flatNos
			const flatNoA_numeric = extractNumericValue(a.flatNo);
			const flatNoB_numeric = extractNumericValue(b.flatNo);

			// If both flatNos have numeric parts, compare them numerically
			if (flatNoA_numeric !== null && flatNoB_numeric !== null) {
				return flatNoA_numeric - flatNoB_numeric;
			}

			// If one has a numeric part and the other does not, prioritize the numeric one
			if (flatNoA_numeric !== null) return -1;
			if (flatNoB_numeric !== null) return 1;

			// If neither has a numeric part, fall back to lexicographical (alphabetical) comparison
			return a.flatNo.localeCompare(b.flatNo);
		});

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
	let newBuildingName = '';
	let newBuildingNo = '';
	let newSectorName = '';

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
		buildingAccordion = false;
		residentsAccordion = false;

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
	function downloadCSV() {
		if (selectedSector) {
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
		} else {
			goto('/downloadTable');
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
			page.drawText(`VOTER'S DATA - ${selectedBuilding || ''} ${selectedSector || ''}`, {
				x: margin,
				y: pageHeight - margin - titleHeight / 2,
				size: 16,
				color: rgb(0, 0, 0)
			});
		}

		if (sharedResidents.length > 0) {
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
		} else {
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
	async function deleteBuilding() {
		try {
			const response = await fetch(`/api/delete-building/${selectedBuilding}`, {
				method: 'POST'
			});

			if (response.ok) {
				const result = await response.json();
				alert = 'Building information deleted successfully!';
				// Remove the deleted building from the voters array
				voters = voters.filter((voter) => voter.buildingName !== selectedBuilding);
				selectedBuilding = ''; // Reset selected building
				// Reset form fields
				resetForm();
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
			const response = await fetch(
				`/api/update-buildingName/${selectedSector}:${selectedBuilding}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ buildingName: newBuildingName })
				}
			);

			if (response.ok) {
				const result = await response.json();
				alert = 'Building information updated successfully!';
				// Update the building name in the voters array
				voters = voters.map((voter) =>
					voter.buildingName === selectedBuilding
						? { ...voter, buildingName: newBuildingName }
						: voter
				);
				// Reset form fields
				resetForm();
				// Reset selected building
				selectedBuilding = '';
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
			const response = await fetch(`/api/update-buildingNo/${selectedSector}:${selectedBuilding}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ buildingNo: newBuildingNo })
			});

			if (response.ok) {
				const result = await response.json();
				alert = 'Building information updated successfully!';
				// Update the building no in the voters array
				voters = voters.map((voter) =>
					voter.buildingName === selectedBuilding ? { ...voter, buildingNo: newBuildingNo } : voter
				);
				// Reset form fields
				resetForm();
				// Reset selected building
				selectedBuilding = '';
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
			const response = await fetch(`/api/update-sectorName/${selectedSector}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ sectorName: newSectorName })
			});

			if (response.ok) {
				const result = await response.json();
				alert = 'Sector information updated successfully!';
				// Update the sector name in the voters array
				voters = voters.map((voter) =>
					voter.sectorName === selectedSector ? { ...voter, sectorName: newSectorName } : voter
				);
				// Reset form fields
				resetForm();
				// Reset selected sector
				selectedSector = '';
			} else {
				alert = 'Failed to update sector information';
			}
		} catch (error) {
			alert = 'An error occurred';
		}
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
				{#each filteredSectors as sector}
					<Button on:click={() => selectSector(sector)} class="bg-blue-900">
						{sector}
					</Button>
				{/each}
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

	{#if selectedSector}
		<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100 md:p-1" padding="none">
			<Accordion>
				<AccordionItem bind:open={residentsAccordion}>
					<span slot="header">
						<P class="text-xl font-bold">Residents of {selectedBuilding || selectedSector}</P>
					</span>
					<!-- Table displaying filtered voters -->
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
							{#each filteredVoters as uniqueVoter}
								<TableBodyRow
									class="border-blue-900 bg-blue-100 hover:bg-blue-200"
									on:click={() => showVoterForm(uniqueVoter)}
								>
									<TableBodyCell>{uniqueVoter.flatNo}</TableBodyCell>
									<TableBodyCell>{uniqueVoter.name}</TableBodyCell>
									<TableBodyCell>{uniqueVoter.phoneNo}</TableBodyCell>
									<TableBodyCell>{uniqueVoter.yadiNo}</TableBodyCell>
									<TableBodyCell>{uniqueVoter.srNo}</TableBodyCell>
									<TableBodyCell>{uniqueVoter.rscNo}</TableBodyCell>
									<TableBodyCell>{uniqueVoter.buildingName}</TableBodyCell>
									<TableBodyCell>{uniqueVoter.wing}</TableBodyCell>
								</TableBodyRow>
							{/each}
						</TableBody>
					</Table>
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
			<div class="mt-6 grid gap-1 md:grid-cols-4">
				{#if showForm}
					<Button type="submit" color="dark">Update Information</Button>
					<div></div>
					<div></div>
					<Button type="button" on:click={() => (deleteVoterModal = true)} color="red">
						Delete Voter
					</Button>
				{:else}
					<Button type="submit" color="dark">Add Voter</Button>
					<div></div>
					<div></div>
					{#if selectedBuilding}
						<Button type="button" on:click={() => (deleteBuildingModal = true)} color="red">
							Delete Building
						</Button>
					{/if}
				{/if}
			</div>
		</form>
	</Card>

	<div class="grid md:grid-cols-2">
		<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
			<P class="col-span-2 mb-4 text-xl font-bold">Download Data</P>
			<div class="grid gap-2 md:grid-cols-2">
				<Button on:click={downloadVoterSlips} color="green">Download Slips</Button>
				<Button on:click={downloadCSV} color="dark">Download Table</Button>
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
							on:click={() => showVoterForm(resident)}
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

	{#if selectedSector && !selectedBuilding}
		<!-- Update sector name card -->
		<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
			<P class="mb-4 text-xl font-bold">Update Sector Name</P>
			<form on:submit|preventDefault={updateSectorName}>
				<div class="grid gap-4 md:grid-cols-3">
					<Label>
						Current Sector Name:
						<Input type="text" bind:value={selectedSector} class="mt-2" required disabled />
					</Label>
					<Label>
						New Sector Name:
						<Input type="text" bind:value={newSectorName} class="mt-2" required />
					</Label>
					<Button class="md:mt-7" type="submit" color="dark">Update Sector Name</Button>
				</div>
			</form>
		</Card>
	{/if}

	{#if selectedBuilding}
		<!-- Update building name card -->
		<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
			<P class="mb-4 text-xl font-bold">Update Building Name</P>
			<form on:submit|preventDefault={updateBuildingName}>
				<div class="grid gap-4 md:grid-cols-3">
					<Label>
						Current Building Name:
						<Input type="text" bind:value={selectedBuilding} class="mt-2" required disabled />
					</Label>
					<Label>
						New Building Name:
						<Input type="text" bind:value={newBuildingName} class="mt-2" required />
					</Label>
					<Button class="md:mt-7" type="submit" color="dark">Update Building Name</Button>
				</div>
			</form>
		</Card>
		<!-- Update building no card -->
		<Card class="mx-auto max-w-full border-2 border-gray-300 bg-gray-100">
			<P class="mb-4 text-xl font-bold">Update Building No</P>
			<form on:submit|preventDefault={updateBuildingNo}>
				<div class="grid gap-4 md:grid-cols-3">
					<Label>
						Current Building No:
						<Input type="text" bind:value={selectedBuildingNo} class="mt-2" required disabled />
					</Label>
					<Label>
						New Building No:
						<Input type="text" bind:value={newBuildingNo} class="mt-2" required />
					</Label>
					<Button class="md:mt-7" type="submit" color="dark">Update Building No</Button>
				</div>
			</form>
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

<!-- Delete building modal -->
<Modal bind:open={deleteBuildingModal} autoclose>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			Are you sure you want to delete this building?
		</h3>
		<Button on:click={deleteBuilding} color="red" class="me-2">Yes, I'm sure</Button>
		<Button color="alternative">No, cancel</Button>
	</div>
</Modal>
