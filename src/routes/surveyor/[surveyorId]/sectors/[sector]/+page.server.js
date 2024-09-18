import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

export const load = async ({ params }) => {
	const uri = env.MONGO_URI; // MongoDB connection string from environment variables
	const client = new MongoClient(uri);

	// Define database and collection names
	const surveyDatabase = 'survey';
	const voterDatabase = 'voterinfo';
	const surveyCollectionName = 'survey';
	const voterCollectionName = 'voterinfo';

	try {
		// Connect to MongoDB
		await client.connect();

		// Get the databases and collections
		const surveyDb = client.db(surveyDatabase);
		const voterDb = client.db(voterDatabase);

		const surveyCollection = surveyDb.collection(surveyCollectionName);
		const voterCollection = voterDb.collection(voterCollectionName);

		// Fetch surveyor data
		const surveyorId = new ObjectId(params.surveyorId); // Convert to ObjectId
		const surveyor = await surveyCollection.findOne({ _id: surveyorId });

		// Fetch voter data
		const sector = decodeURIComponent(params.sector);
		const voters = await voterCollection
			.find({ sectorName: sector })
			.sort({ buildingNo: 1 })
			.toArray();

		// Convert ObjectId to string for serialization
		const serializedSurveyor = surveyor ? { ...surveyor, _id: surveyor._id.toString() } : null;
		const serializedVoters = voters.map((voter) => ({ ...voter, _id: voter._id.toString() }));

		// Return data as props
		return {
			surveyor: serializedSurveyor,
			voters: serializedVoters
		};
	} catch (error) {
		console.error('Error fetching data:', error);
		return {
			surveyor: null,
			voters: []
		};
	} finally {
		// Close MongoDB connection
		await client.close();
	}
};
