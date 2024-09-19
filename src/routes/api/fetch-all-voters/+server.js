import { MongoClient } from 'mongodb';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const GET = async () => {
	const uri = env.MONGO_URI;
	const client = new MongoClient(uri);

	try {
		// Connect to MongoDB and fetch voters data
		await client.connect();
		const database = client.db(env.dbname);
		const collection = database.collection(env.dbname);
		const voters = await collection.find({}).toArray();

		// Send raw voters data without serializing ObjectId
		return json({ voters });
	} catch (error) {
		console.error('Error fetching voters:', error);
		return json({ voters: [], error: 'Failed to fetch data' }, { status: 500 });
	} finally {
		await client.close();
	}
};
