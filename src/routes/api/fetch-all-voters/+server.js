import { MongoClient } from 'mongodb';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const GET = async () => {
	const uri = env.MONGO_URI;
	const client = new MongoClient(uri);

	try {
		// Connect to MongoDB and fetch voters data
		await client.connect();
		const database = client.db('voterinfo');
		const collection = database.collection('voterinfo');
		const voters = await collection.find({}, { projection: { caste: 0, note: 0 } }).toArray();

		// Send raw voters data without serializing ObjectId
		return json({ voters });
	} catch (error) {
		console.error('Error fetching voters:', error);
		return json({ voters: [], error: 'Failed to fetch data' }, { status: 500 });
	} finally {
		await client.close();
	}
};
