import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

// Initialize MongoDB client
const client = new MongoClient(env.MONGO_URI);

export const load = async ({ params }) => {
	const surveyorId = params.surveyorId;
	const voterId = params.voter;
	let surveyor = null;
	let voter = null;
	let sharedResidents = [];

	const serializeDocument = (doc) => {
		if (doc) {
			return {
				...doc,
				_id: doc._id.toString() // Convert ObjectId to string
			};
		}
		return null;
	};

	try {
		// Connect to the MongoDB client
		await client.connect();
		const surveyDb = client.db('survey'); // Replace 'survey' with your database name
		const voterDb = client.db(env.dbname); // Replace env.dbname with your database name

		// Fetch the surveyor data
		const surveyorCollection = surveyDb.collection('survey'); // Replace 'survey' with your collection name
		const surveyorData = await surveyorCollection.findOne({ _id: new ObjectId(surveyorId) });

		// Fetch the voter data
		const voterCollection = voterDb.collection(env.dbname); // Replace env.dbname with your collection name
		const voterData = await voterCollection.findOne({ _id: new ObjectId(voterId) });

		if (voterData) {
			voter = serializeDocument(voterData);
		}

		// Fetch other residents sharing the same flatNo
		if (voter) {
			const sharedData = await voterCollection
				.find({
					flatNo: voter.flatNo || null,
					buildingName: voter.buildingName || null,
					sectorName: voter.sectorName || null,
					wing: voter.wing || ''
				})
				.toArray();

			sharedResidents = sharedData.map(serializeDocument);
		}

		// Return the original voter and others sharing the flatNo
		return {
			surveyor: serializeDocument(surveyorData) || null,
			voter: voter || null,
			sharedResidents: sharedResidents || []
		};
	} catch (error) {
		console.error('Error fetching data:', error);
		return {
			surveyor: null,
			voter: null,
			sharedResidents: []
		};
	} finally {
		// Ensure the client is closed when the operation is finished
		await client.close();
	}
};
