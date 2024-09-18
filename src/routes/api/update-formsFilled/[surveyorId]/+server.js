import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

// Initialize MongoDB client
const client = new MongoClient(env.MONGO_URI);

export async function POST({ params }) {
	const { surveyorId } = params; // Extract the surveyorId from params

	try {
		// Connect to MongoDB client
		await client.connect();
		const db = client.db('survey'); // Replace 'survey' with your database name
		const collection = db.collection('survey'); // Replace 'survey' with your collection name

		// Update the document in the collection
		const result = await collection.updateOne(
			{ _id: new ObjectId(surveyorId) },
			{ $inc: { formsFilled: 1 } } // Increment the `formsFilled` field by 1
		);

		// Return a successful response
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
		// Ensure the client is closed when the operation is finished
		await client.close();
	}
}
