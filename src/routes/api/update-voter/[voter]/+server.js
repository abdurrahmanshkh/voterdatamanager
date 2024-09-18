import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

export async function POST({ params, request }) {
	const uri = env.MONGO_URI; // MongoDB connection string from environment variables
	const client = new MongoClient(uri);

	const formData = await request.json();

	try {
		// Connect to the MongoDB cluster
		await client.connect();

		// Get the database and collection
		const database = client.db('voterinfo');
		const collection = database.collection('voterinfo');

		// Perform the update operation
		const updateResult = await collection.updateOne(
			{ _id: new ObjectId(params.voter) }, // Convert params.voter to ObjectId
			{ $set: formData }
		);

		// Check if the update was successful
		if (updateResult.modifiedCount === 0) {
			throw new Error('No documents were updated');
		}

		// Return a success response
		return new Response(JSON.stringify({ message: 'Update successful' }), { status: 200 });
	} catch (error) {
		console.error('Error updating data:', error);
		return new Response('Error updating data', { status: 500 });
	} finally {
		// Close the MongoDB connection
		await client.close();
	}
}
