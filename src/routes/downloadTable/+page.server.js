import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

export const load = async () => {
	const uri = env.MONGO_URI; // Connection string for your MongoDB instance
	const client = new MongoClient(uri);

	try {
		// Connect to the MongoDB cluster
		await client.connect();

		// Get the database and collection
		const database = client.db(env.dbname);
		const collection = database.collection(env.dbname);

		// Fetch all voters (without filter for now, adjust as needed)
		const voters = await collection.find({}).toArray();

		// Serialize ObjectId to string for SvelteKit compatibility
		const serializedVoters = voters.map((voter) => ({
			...voter,
			_id: voter._id.toString() // Convert ObjectId to string
		}));

		// Return the fetched data as props to the page
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
