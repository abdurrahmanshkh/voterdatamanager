import { env } from '$env/dynamic/private';

export async function POST({ params, request }) {
	const apiKey = env.API_KEY;
	const endpoint = env.endpoint + 'updateMany';

	const formData = await request.json();

	const updateString = params.building; // Example string
	const partsArray = updateString.split(':'); // Split the string at every colon

	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'api-key': apiKey
			},
			body: JSON.stringify({
				dataSource: 'cluster0',
				database: 'voterinfo',
				collection: 'voterinfo',
				filter: { sectorName: partsArray[0], buildingName: partsArray[1] },
				update: { $set: formData }
			})
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return new Response(JSON.stringify(data), { status: 200 });
	} catch (error) {
		console.error('Error inserting data:', error);
		return new Response('Error inserting data', { status: 500 });
	}
}
