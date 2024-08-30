<script>
    import { onMount } from 'svelte';

    async function addVoter() {
        const voterData = {
            "Flat No": 101,
            "Epic No": "EP123456789",
            Name: "John Doe",
            Age: 34,
            "Relative Name": "Jane Doe",
            "Phone No": "9876543210",
            Building: "Lilavati CHS",
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
            } else {
                console.error(`Error adding voter: ${result.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    onMount(() => {
        addVoter();
    });
</script>

<main>
    <h1>Add Voter</h1>
</main>
