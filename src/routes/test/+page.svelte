<script>
  export let data; // The fetched data is passed as props to the page component
  let { voters } = data; // Destructure the voters from the data prop

  let uniqueBuildings = [...new Set(voters.map((voter) => voter.buildingName))]; // Get unique building names
  let selectedBuilding = ''; // Store the selected building name

  // Function to handle button click
  function filterByBuilding(buildingName) {
    selectedBuilding = buildingName; // Set the selected building name
  }

  // Filtered voters based on the selected building
  $: filteredVoters = selectedBuilding
    ? voters.filter((voter) => voter.buildingName === selectedBuilding)
    : voters;
</script>

<!-- Building Filter Buttons -->
<div class="building-buttons">
  {#each uniqueBuildings as building}
    <button on:click={() => filterByBuilding(building)}>
      {building}
    </button>
  {/each}
  <button on:click={() => filterByBuilding('')}>Show All</button>
</div>

<!-- Render the table -->
{#if filteredVoters.length > 0}
  <table>
    <thead>
      <tr>
        <th>Flat No</th>
        <th>EPIC No</th>
        <th>Name</th>
        <th>Age</th>
        <th>Relative Name</th>
        <th>Phone No</th>
        <th>Building Name</th>
      </tr>
    </thead>
    <tbody>
      {#each filteredVoters as voter}
        <tr>
          <td>{voter.flatNo}</td>
          <td>{voter.epicNo}</td>
          <td>{voter.name}</td>
          <td>{voter.age}</td>
          <td>{voter.relativeName}</td>
          <td>{voter.phoneNo}</td>
          <td>{voter.buildingName}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <p>No data available.</p>
{/if}

<style>
  .building-buttons {
    margin-bottom: 20px;
  }

  .building-buttons button {
    margin: 5px;
    padding: 8px 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .building-buttons button:hover {
    background-color: #0056b3;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 8px;
    text-align: left;
    border: 1px solid #ddd;
  }

  th {
    background-color: #f4f4f4;
  }
</style>
