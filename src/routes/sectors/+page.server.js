import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

export const load = async () => {
	// Define MongoDB connection details
	const uri = env.MONGO_URI; // The connection string for your MongoDB instance
	const client = new MongoClient(uri);

	try {
		// Connect to the MongoDB cluster
		await client.connect();

		// Get the database and collection
		const database = client.db('voterinfo');
		const collection = database.collection('voterinfo');

		// Query the database (retrieve all documents in this case)
		const voters = await collection.find({}).toArray();

		// Convert MongoDB ObjectId to string for serialization
		const serializedVoters = voters.map((voter) => ({
			...voter,
			_id: voter._id.toString()
		}));

		// Return the serialized data
		return {
			voters: serializedVoters
		};
	} catch (error) {
		console.error('Error fetching data:', error);
		return {
			voters: []
		};
	} finally {
		// Close the MongoDB connection
		await client.close();
	}
};
