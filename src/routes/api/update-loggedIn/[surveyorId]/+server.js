import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

export async function POST({ params }) {
	const uri = env.MONGO_URI; // MongoDB connection string from environment variables
	const client = new MongoClient(uri);

	try {
		// Connect to the MongoDB cluster
		await client.connect();

		// Get the database and collection
		const database = client.db('survey');
		const collection = database.collection('survey');

		// Perform the updateOne operation to set 'loggedIn' to false
		const updateResult = await collection.updateOne(
			{ _id: new ObjectId(params.surveyorId) }, // Convert params.surveyorId to ObjectId
			{ $set: { loggedIn: false } }
		);

		// Check if the update was successful
		if (updateResult.matchedCount === 0) {
			throw new Error('No matching surveyor found');
		}

		// Return a success response
		return new Response(
			JSON.stringify({
				message: 'Update successful',
				matchedCount: updateResult.matchedCount,
				modifiedCount: updateResult.modifiedCount
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error updating data:', error);
		return new Response('Error updating data', { status: 500 });
	} finally {
		// Close the MongoDB connection
		await client.close();
	}
}
