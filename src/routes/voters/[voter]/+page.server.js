import { env } from '$env/dynamic/private';

export const load = async ({ params }) => {
	const apiKey = env.API_KEY;
	const findOneEndpoint =
		'https://ap-south-1.aws.data.mongodb-api.com/app/data-mxiiynz/endpoint/data/v1/action/findOne';
	const findManyEndpoint =
		'https://ap-south-1.aws.data.mongodb-api.com/app/data-mxiiynz/endpoint/data/v1/action/find';

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
				database: env.dbname,
				collection: env.dbname,
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
				database: env.dbname,
				collection: env.dbname,
				filter: {
					flatNo: voter.flatNo || null,
					buildingName: voter.buildingName || null,
					sectorName: voter.sectorName || null,
					wing: voter.wing || null
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
