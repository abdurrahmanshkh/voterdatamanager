import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

export async function POST({ params, request }) {
	const uri = env.MONGO_URI; // MongoDB connection string from environment variables
	const client = new MongoClient(uri);

	const formData = await request.json();

	const updateString = params.building; // Example string
	const partsArray = updateString.split(':'); // Split the string at every colon

	try {
		// Connect to the MongoDB cluster
		await client.connect();

		// Get the database and collection
		const database = client.db(env.dbname);
		const collection = database.collection(env.dbname);

		// Perform the updateMany operation
		const updateResult = await collection.updateMany(
			{ sectorName: partsArray[0], buildingName: partsArray[1] }, // Filtering by sectorName and buildingName
			{ $set: formData } // Applying the formData as updates
		);

		// Check if the update was successful
		if (updateResult.matchedCount === 0) {
			throw new Error('No matching documents found');
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
