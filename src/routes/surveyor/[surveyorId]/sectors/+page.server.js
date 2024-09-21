import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

// Initialize MongoDB client
const client = new MongoClient(env.MONGO_URI);

export const load = async ({ params }) => {
	const surveyorId = params.surveyorId;
	let surveyor = null;

	try {
		// Connect to the MongoDB client
		await client.connect();
		const database = client.db('survey'); // Replace 'survey' with your database name
		const collection = database.collection('survey'); // Replace 'survey' with your collection name

		// Query the MongoDB collection
		const surveyorData = await collection.findOne({ _id: new ObjectId(surveyorId) });

		// Serialize the document if necessary
		if (surveyorData) {
			surveyorData._id = surveyorData._id.toString(); // Convert ObjectId to string
		}

		return {
			surveyor: surveyorData || null
		};
	} catch (error) {
		console.error('Error fetching data:', error);
		return {
			surveyor: null
		};
	} finally {
		// Ensure the client is closed when the operation is finished
		await client.close();
	}
};
