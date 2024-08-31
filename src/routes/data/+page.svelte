<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { Input, Label, Button, Card, P } from 'flowbite-svelte';
    import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, TableSearch } from 'flowbite-svelte';
    import { Alert } from 'flowbite-svelte';

    let voters = [];
    let uniqueBuildings = [];
    let selectedBuilding = '';
    let loading = true;
    let error = null;

    // Form fields
    let flatNo = '';
    let epicNo = '';
    let name = '';
    let age = '';
    let relativeName = '';
    let phoneNo = '';
    let successAlert = '';
    let searchTerm = '';
    
    const selectedBuildingStore = writable(selectedBuilding);

    async function fetchVoters(buildingName = '') {
        try {
            const response = await fetch(`/api/get-voters?buildingName=${encodeURIComponent(buildingName)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            voters = data.voters;
            uniqueBuildings = data.uniqueBuildings;
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    function handleBuildingClick(buildingName) {
        selectedBuilding = buildingName;
        selectedBuildingStore.set(buildingName);
        fetchVoters(buildingName);
    }

    async function addVoter() {
        if (!selectedBuilding) {
            alert('Please select a building first.');
            return;
        }

        const voterData = {
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
                body: JSON.stringify(voterData)
            });

            const result = await response.json();
            if (response.ok) {
                successAlert= `New voter added with the following id: ${result.insertedId}`;
                // Clear form fields
                flatNo = '';
                epicNo = '';
                name = '';
                age = '';
                relativeName = '';
                phoneNo = '';
                fetchVoters(selectedBuilding); // Refresh the voter list
            } else {
                console.error(`Error adding voter: ${result.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    onMount(() => fetchVoters()); // Fetch all voters initially

    function deselectBuilding() {
        selectedBuilding = '';
        selectedBuildingStore.set('');
        fetchVoters();
    }

    $: filteredVoters = voters.filter((voter) => voter.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1);

</script>

<main>
    {#if loading}
        <p>Loading...</p>
    {/if}

    {#if error}
        <p class="text-red-500">{error}</p>
    {/if}

    {#if !loading && !error}
        <Card class="mx-auto max-w-full bg-gray-100 border-2">
            <P class="text-xl font-bold mb-4">Select a Building</P>
            <div class="grid gap-1 md:grid-cols-6">
                {#each uniqueBuildings as building}
                    <Button 
                        class="bg-gray-500 text-white px-4 py-2 rounded"
                        on:click={() => handleBuildingClick(building)}
                    >
                        {building}
                    </Button>
                {/each}
                <Button 
                    class="bg-gray-500 text-white px-4 py-2 rounded"
                    on:click={deselectBuilding}
                >
                    Show All
                </Button>
            </div>
        </Card>

        <Card class="mx-auto max-w-full bg-gray-100 border-2">
            <P class="text-xl font-bold mb-2">Residents of {selectedBuilding || 'All Buildings'}</P>
            <TableSearch placeholder="Search by Voter Name" hoverable={true} bind:inputValue={searchTerm}/>
            <Table shadow class="table-auto w-full text-left">
                <TableHead>
                        <TableHeadCell class="px-4 py-2">Flat No</TableHeadCell>
                        <TableHeadCell class="px-4 py-2">Epic No</TableHeadCell>
                        <TableHeadCell class="px-4 py-2">Name</TableHeadCell>
                        <TableHeadCell class="px-4 py-2">Age</TableHeadCell>
                        <TableHeadCell class="px-4 py-2">Relative Name</TableHeadCell>
                        <TableHeadCell class="px-4 py-2">Phone No</TableHeadCell>
                        <TableHeadCell class="px-4 py-2">Building Name</TableHeadCell>
                </TableHead>
                <TableBody>
                    {#each filteredVoters as voter}
                        <TableBodyRow>
                            <TableBodyCell class="border px-4 py-2">{voter.flatNo}</TableBodyCell>
                            <TableBodyCell class="border px-4 py-2">{voter.epicNo}</TableBodyCell>
                            <TableBodyCell class="border px-4 py-2">{voter.name}</TableBodyCell>
                            <TableBodyCell class="border px-4 py-2">{voter.age}</TableBodyCell>
                            <TableBodyCell class="border px-4 py-2">{voter.relativeName}</TableBodyCell>
                            <TableBodyCell class="border px-4 py-2">{voter.phoneNo}</TableBodyCell>
                            <TableBodyCell class="border px-4 py-2">{voter.buildingName}</TableBodyCell>
                        </TableBodyRow>
                    {/each}
                </TableBody>
            </Table>
        </Card>

        {#if selectedBuilding}
            <Card class="mx-auto max-w-full bg-gray-100 border-2">
                <P class="text-xl font-bold mb-4">Add Resident to {selectedBuilding}</P>
                {#if successAlert.length>0}
                    <Alert color="green" class="font-medium">{successAlert}</Alert>
                {/if}
                <form on:submit|preventDefault={addVoter} class="space-y-4">
                    <div class="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label for="flatNo" class="block mb-2">Flat No</Label>
                            <Input type="number" id="flatNo" bind:value={flatNo} class="border w-full" required />
                        </div>
                        <div>
                            <Label for="epicNo" class="block mb-2">Epic No</Label>
                            <Input type="text" id="epicNo" bind:value={epicNo} class="border w-full" required />
                        </div>
                        <div>
                            <Label for="name" class="block mb-2">Name</Label>
                            <Input type="text" id="name" bind:value={name} class="border w-full" required />
                        </div>
                        <div>
                            <Label for="age" class="block mb-2">Age</Label>
                            <Input type="number" id="age" bind:value={age} class="border w-full" required />
                        </div>
                        <div>
                            <Label for="relativeName" class="block mb-2">Relative Name</Label>
                            <Input type="text" id="relativeName" bind:value={relativeName} class="border w-full" required />
                        </div>
                        <div>
                            <Label for="phoneNo" class="block mb-2">Phone No</Label>
                            <Input type="tel" id="phoneNo" bind:value={phoneNo} class="border w-full" required />
                        </div>
                    </div>
                    <Button type="submit">Add Resident</Button>
                </form>
            </Card>
        {/if}
    {/if}
</main>
