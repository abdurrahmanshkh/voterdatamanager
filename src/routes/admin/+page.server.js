import { env } from '$env/dynamic/private';

export const load = async () => {
	const apiKey = env.API_KEY;
	const endpoint = env.endpoint + 'find';

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
				filter: {}
			})
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		// Return the fetched data as props to the page
		return {
			surveyors: data.documents || []
		};
	} catch (error) {
		console.error('Error fetching data:', error);
		return {
			surveyors: []
		};
	}
};
