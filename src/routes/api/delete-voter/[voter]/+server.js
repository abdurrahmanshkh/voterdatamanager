import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

export async function POST({ params }) {
	const uri = env.MONGO_URI; // MongoDB connection string from environment variables
	const client = new MongoClient(uri);

	try {
		// Connect to the MongoDB cluster
		await client.connect();

		// Get the database and collection
		const database = client.db(env.dbname);
		const collection = database.collection(env.dbname);

		// Perform the deleteOne operation
		const deleteResult = await collection.deleteOne({
			_id: new ObjectId(params.voter) // Convert string ID to ObjectId
		});

		// Check if a document was deleted
		if (deleteResult.deletedCount === 0) {
			throw new Error('No document found to delete');
		}

		// Return a success response
		return new Response(
			JSON.stringify({
				message: 'Document deleted successfully',
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
