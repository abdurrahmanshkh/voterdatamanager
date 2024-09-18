import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

export async function POST({ params }) {
	const uri = env.MONGO_URI; // MongoDB connection string from environment variables
	const client = new MongoClient(uri);

	try {
		// Connect to the MongoDB cluster
		await client.connect();

		// Get the database and collection
		const database = client.db('voterinfo');
		const collection = database.collection('voterinfo');

		// Perform the deleteMany operation
		const deleteResult = await collection.deleteMany({
			buildingName: params.building // Filter for documents to delete
		});

		// Return a success response with the result
		return new Response(
			JSON.stringify({
				message: 'Documents deleted successfully',
				deletedCount: deleteResult.deletedCount
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error deleting data:', error);
		return new Response('Error deleting data', { status: 500 });
	} finally {
		// Close the MongoDB connection
		await client.close();
	}
}
