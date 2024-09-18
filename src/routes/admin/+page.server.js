import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

export const load = async () => {
	const uri = env.MONGO_URI; // MongoDB connection string from environment variables
	const client = new MongoClient(uri);
	const databaseName = 'survey';
	const collectionName = 'survey';

	try {
		// Connect to the MongoDB cluster
		await client.connect();

		// Get the database and collection
		const database = client.db(databaseName);
		const collection = database.collection(collectionName);

		// Fetch all documents from the collection
		const surveyors = await collection.find({}).toArray();

		// Convert _id to string
		const serializedSurveyors = surveyors.map((doc) => ({
			...doc,
			_id: doc._id.toString() // Convert ObjectId to string
		}));

		// Return the fetched data as props to the page
		return {
			surveyors: serializedSurveyors
		};
	} catch (error) {
		console.error('Error fetching data:', error);
		return {
			surveyors: []
		};
	} finally {
		// Close the MongoDB connection
		await client.close();
	}
};
