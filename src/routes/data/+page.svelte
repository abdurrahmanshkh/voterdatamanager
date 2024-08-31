<script>
    import { onMount } from 'svelte';

    let voters = [];
    let loading = true;
    let error = null;

    onMount(async () => {
        try {
            const response = await fetch('/api/get-voters');
            if (!response.ok) {
                throw new Error('Failed to fetch voters');
            }
            voters = await response.json();
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    });
</script>

<main>
    {#if loading}
        <p>Loading...</p>
    {/if}

    {#if error}
        <p class="text-red-500">{error}</p>
    {/if}

    {#if !loading && !error}
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
</style>
