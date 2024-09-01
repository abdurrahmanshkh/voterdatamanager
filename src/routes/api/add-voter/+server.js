export async function POST({ request }) {
	const apiKey = 'otfYgrBDP88yH06F6Uo7oNB7bOmj4Txs6rF2pfdui8ofPCW1IIF88Jtb0pAbMYrG';
	const endpoint =
		'https://ap-south-1.aws.data.mongodb-api.com/app/data-mxiiynz/endpoint/data/v1/action/insertOne';

	const formData = await request.json();

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
				document: formData
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
