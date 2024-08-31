<script>
    import { Input, Label, Checkbox, Button, A } from 'flowbite-svelte';

    let flatNo = '';
    let epicNo = '';
    let name = '';
    let age = '';
    let relativeName = '';
    let phoneNo = '';
    let buildingName = '';
    let buildingId = '';

    async function addVoter() {
        const voterData = {
            flatNo,
            epicNo,
            name,
            age: parseInt(age),
            relativeName,
            phoneNo,
            buildingName,
            buildingId,
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

    function handleSubmit(event) {
        event.preventDefault();
        addVoter();
    }
</script>

<form on:submit={handleSubmit}>
  <div class="grid gap-6 mb-6 md:grid-cols-2">
    <div>
      <Label for="flatNo" class="mb-2">Flat No</Label>
      <Input type="text" id="flatNo" bind:value={flatNo} placeholder="101" required />
    </div>
    <div>
      <Label for="epicNo" class="mb-2">Epic No</Label>
      <Input type="text" id="epicNo" bind:value={epicNo} placeholder="EP123456789" required />
    </div>
    <div>
      <Label for="name" class="mb-2">Name</Label>
      <Input type="text" id="name" bind:value={name} placeholder="John Doe" required />
    </div>
    <div>
      <Label for="age" class="mb-2">Age</Label>
      <Input type="number" id="age" bind:value={age} placeholder="34" required />
    </div>
    <div>
      <Label for="relativeName" class="mb-2">Relative Name</Label>
      <Input type="text" id="relativeName" bind:value={relativeName} placeholder="Jane Doe" required />
    </div>
    <div>
      <Label for="phoneNo" class="mb-2">Phone Number</Label>
      <Input type="tel" id="phoneNo" bind:value={phoneNo} placeholder="9876543210" required />
    </div>
    <div>
      <Label for="buildingName" class="mb-2">Building Name</Label>
      <Input type="text" id="buildingName" bind:value={buildingName} placeholder="Sai Paradise" required />
    </div>
    <div>
      <Label for="buildingId" class="mb-2">Building ID</Label>
      <Input type="text" id="buildingId" bind:value={buildingId} placeholder="b00006" required />
    </div>
  </div>
  <Checkbox class="mb-6 space-x-1 rtl:space-x-reverse" required>
    I agree with the <A href="/" class="text-primary-700 dark:text-primary-600 hover:underline">terms and conditions</A>.
  </Checkbox>
  <Button type="submit">Submit</Button>
</form>
