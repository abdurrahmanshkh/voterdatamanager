<script>
    import { onMount } from 'svelte';

    let voters = [];
    let uniqueBuildings = [];
    let selectedBuilding = '';
    let loading = true;
    let error = null;

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
        fetchVoters(buildingName);
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
    {/if}
</main>

