import { env } from '$env/dynamic/private';

export async function POST({ params, request }) {
	const apiKey = env.API_KEY;
	const endpoint =
		'https://ap-south-1.aws.data.mongodb-api.com/app/data-mxiiynz/endpoint/data/v1/action/updateOne';

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
				database: env.dbname,
				collection: env.dbname,
				filter: { _id: { $oid: params.voter } },
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
