import { env } from '$env/dynamic/private';

export const load = async ({ params }) => {
	const apiKey = env.API_KEY;
	const findOneEndpoint = env.endpoint + 'findOne';
	const findManyEndpoint = env.endpoint + 'find';

	try {
		// Step 1: Get the voter using the _id from params
		const voterResponse = await fetch(findOneEndpoint, {
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

		if (!voterResponse.ok) {
			throw new Error(`HTTP error! status: ${voterResponse.status}`);
		}

		const voterData = await voterResponse.json();
		const voter = voterData.document;

		// Step 2: Get all persons sharing the same flatNo
		const sharedResponse = await fetch(findManyEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'api-key': apiKey
			},
			body: JSON.stringify({
				dataSource: 'cluster0',
				database: 'voterinfo',
				collection: 'voterinfo',
				filter: {
					flatNo: voter.flatNo || null,
					buildingName: voter.buildingName || null,
					sectorName: voter.sectorName || null,
					wing: voter.wing || ''
				}
			})
		});

		if (!sharedResponse.ok) {
			throw new Error(`HTTP error! status: ${sharedResponse.status}`);
		}

		const sharedData = await sharedResponse.json();

		// Step 3: Return the original voter and others sharing the flatNo
		return {
			voter: voter || null,
			sharedResidents: sharedData.documents || []
		};
	} catch (error) {
		console.error('Error fetching data:', error);
		return {
			voter: null,
			sharedResidents: []
		};
	}
};
