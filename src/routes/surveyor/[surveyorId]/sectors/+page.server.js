import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

export const load = async ({ params }) => {
	const uri = env.MONGO_URI; // MongoDB connection string from environment variables
	const client = new MongoClient(uri);
	const databaseNameSurvey = 'survey';
	const collectionNameSurvey = 'survey';
	const databaseNameVoter = env.dbname;
	const collectionNameVoter = env.dbname;

	try {
		// Connect to the MongoDB cluster
		await client.connect();

		// Get the databases and collections
		const databaseSurvey = client.db(databaseNameSurvey);
		const collectionSurvey = databaseSurvey.collection(collectionNameSurvey);
		const databaseVoter = client.db(databaseNameVoter);
		const collectionVoter = databaseVoter.collection(collectionNameVoter);

		// Fetch surveyor data by _id
		const surveyor = await collectionSurvey.findOne({ _id: new ObjectId(params.surveyorId) });

		// Fetch all voter data
		const voters = await collectionVoter.find({}).toArray();

		// Convert _id fields to strings
		const serializeDocument = (doc) => {
			if (doc) {
				return {
					...doc,
					_id: doc._id.toString() // Convert ObjectId to string
				};
			}
			return null;
		};

		const serializedSurveyor = serializeDocument(surveyor);
		const serializedVoters = voters.map(serializeDocument);

		// Return the fetched data as props to the page
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
		// Close the MongoDB connection
		await client.close();
	}
};
