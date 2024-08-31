<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { Input, Label, Checkbox, Button, A } from 'flowbite-svelte';


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
    let buildingId = '';

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
            buildingName: selectedBuilding,
            buildingId
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
                console.log(`New voter added with the following id: ${result.insertedId}`);
                // Clear form fields
                flatNo = '';
                epicNo = '';
                name = '';
                age = '';
                relativeName = '';
                phoneNo = '';
                buildingId = '';
                fetchVoters(selectedBuilding); // Refresh the voter list
            } else {
                console.error(`Error adding voter: ${result.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    onMount(() => fetchVoters()); // Fetch all voters initially
</script>

<main>
    {#if loading}
        <p>Loading...</p>
    {/if}

    {#if error}
        <p class="text-red-500">{error}</p>
    {/if}

    {#if !loading && !error}
        <section>
            <h2 class="text-xl font-bold mb-4">Select a Building</h2>
            <div class="mb-8">
                {#each uniqueBuildings as building}
                    <button 
                        class="bg-blue-500 text-white px-4 py-2 rounded mr-2 mb-2"
                        on:click={() => handleBuildingClick(building)}
                    >
                        {building}
                    </button>
                {/each}
                <button 
                    class="bg-gray-500 text-white px-4 py-2 rounded mb-2"
                    on:click={() => fetchVoters()}
                >
                    Show All
                </button>
            </div>

            <h2 class="text-xl font-bold mb-4">Residents of {selectedBuilding || 'All Buildings'}</h2>
            <table class="table-auto w-full text-left">
                <thead>
                    <tr>
                        <th class="px-4 py-2">Flat No</th>
                        <th class="px-4 py-2">Epic No</th>
                        <th class="px-4 py-2">Name</th>
                        <th class="px-4 py-2">Age</th>
                        <th class="px-4 py-2">Relative Name</th>
                        <th class="px-4 py-2">Phone No</th>
                        <th class="px-4 py-2">Building Name</th>
                        <th class="px-4 py-2">Building ID</th>
                    </tr>
                </thead>
                <tbody>
                    {#each voters as voter}
                        <tr>
                            <td class="border px-4 py-2">{voter.flatNo}</td>
                            <td class="border px-4 py-2">{voter.epicNo}</td>
                            <td class="border px-4 py-2">{voter.name}</td>
                            <td class="border px-4 py-2">{voter.age}</td>
                            <td class="border px-4 py-2">{voter.relativeName}</td>
                            <td class="border px-4 py-2">{voter.phoneNo}</td>
                            <td class="border px-4 py-2">{voter.buildingName}</td>
                            <td class="border px-4 py-2">{voter.buildingId}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </section>

        {#if selectedBuilding}
            <section>
                <h2 class="text-xl font-bold mt-8 mb-4">Add Resident to {selectedBuilding}</h2>
                <form on:submit|preventDefault={addVoter} class="space-y-4">
                    <div class="grid gap-6 mb-6 md:grid-cols-2">
                    <div>
                        <Label for="flatNo" class="block mb-2">Flat No</Label>
                        <Input type="number" id="flatNo" bind:value={flatNo} class="border px-3 py-2 w-full" required />
                    </div>
                    <div>
                        <Label for="epicNo" class="block mb-2">Epic No</Label>
                        <Input type="text" id="epicNo" bind:value={epicNo} class="border px-3 py-2 w-full" required />
                    </div>
                    <div>
                        <Label for="name" class="block mb-2">Name</Label>
                        <Input type="text" id="name" bind:value={name} class="border px-3 py-2 w-full" required />
                    </div>
                    <div>
                        <Label for="age" class="block mb-2">Age</Label>
                        <Input type="number" id="age" bind:value={age} class="border px-3 py-2 w-full" required />
                    </div>
                    <div>
                        <Label for="relativeName" class="block mb-2">Relative Name</Label>
                        <Input type="text" id="relativeName" bind:value={relativeName} class="border px-3 py-2 w-full" required />
                    </div>
                    <div>
                        <Label for="phoneNo" class="block mb-2">Phone No</Label>
                        <Input type="tel" id="phoneNo" bind:value={phoneNo} class="border px-3 py-2 w-full" required />
                    </div>
                    <div>
                        <Label for="buildingId" class="block mb-2">Building ID</Label>
                        <Input type="text" id="buildingId" bind:value={buildingId} class="border px-3 py-2 w-full" required />
                    </div>
                    </div>
                    <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded">Add Resident</button>
                </form>
            </section>
        {/if}
    {/if}
</main>

<style>
    table {
        border-collapse: collapse;
        width: 100%;
    }

    th, td {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    tr:hover {
        background-color: #f5f5f5;
    }

    button {
        cursor: pointer;
    }
</style>
