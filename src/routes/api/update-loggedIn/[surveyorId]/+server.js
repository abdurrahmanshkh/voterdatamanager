import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

// Initialize MongoDB client
const client = new MongoClient(env.MONGO_URI);

export async function POST({ params }) {
	const { surveyorId } = params; // Extract surveyorId from params

	try {
		// Connect to MongoDB
		await client.connect();
		const db = client.db('survey'); // Replace with your database name
		const collection = db.collection('survey'); // Replace with your collection name

		// Update the document
		const result = await collection.updateOne(
			{ _id: new ObjectId(surveyorId) },
			{ $set: { loggedIn: true } } // Set the `loggedIn` field to `true`
		);

		if (result.modifiedCount === 1) {
			return new Response(JSON.stringify({ message: 'Document updated successfully' }), {
				status: 200
			});
		} else {
			return new Response(JSON.stringify({ message: 'Document not found or no changes made' }), {
				status: 404
			});
		}
	} catch (error) {
		console.error('Error updating data:', error);
		return new Response('Error updating data', { status: 500 });
	} finally {
		// Close the MongoDB client
		await client.close();
	}
}
