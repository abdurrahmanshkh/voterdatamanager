import { env } from '$env/dynamic/private';

export async function POST({ params }) {
	const apiKey = env.API_KEY;
	const endpoint = env.endpoint + 'updateOne';

	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'api-key': apiKey
			},
			body: JSON.stringify({
				dataSource: 'cluster0',
				database: 'survey',
				collection: 'survey',
				filter: { _id: { $oid: params.surveyorId } },
				update: {
					$set: { loggedIn: false }
				}
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
