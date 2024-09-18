import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

export async function POST({ request }) {
	const uri = env.MONGO_URI; // MongoDB connection string from environment variables
	const client = new MongoClient(uri);

	try {
		// Connect to the MongoDB cluster
		await client.connect();

		// Get the database and collection
		const database = client.db('voterinfo');
		const collection = database.collection('voterinfo');

		// Get the data from the request
		const formData = await request.json();

		// Perform the insertOne operation
		const insertResult = await collection.insertOne(formData);

		// Return a success response with the result
		return new Response(
			JSON.stringify({
				message: 'Document inserted successfully',
				insertedId: insertResult.insertedId
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error inserting data:', error);
		return new Response('Error inserting data', { status: 500 });
	} finally {
		// Close the MongoDB connection
		await client.close();
	}
}
