import { env } from '$env/dynamic/private';

export const load = async ({ params }) => {
	const apiKey = env.API_KEY;
	const endpoint =
		'https://ap-south-1.aws.data.mongodb-api.com/app/data-mxiiynz/endpoint/data/v1/action/findOne';

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
				filter: { _id: { $oid: params.voter } }
			})
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		// Return the fetched data as props to the page
		return {
			voter: data.document || null
		};
	} catch (error) {
		console.error('Error fetching data:', error);
		return {
			voter: []
		};
	}
};
