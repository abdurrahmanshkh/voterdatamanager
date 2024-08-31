// src/routes/api/add-voter/+server.js
import { MongoClient } from 'mongodb';

export async function POST({ request }) {
	const uri = 'mongodb+srv://abdurrahman19702:Abdur%402002@cluster0.kntzr.mongodb.net/';
	const client = new MongoClient(uri);
	const { flatNo, epicNo, name, age, relativeName, phoneNo, buildingName } =
		await request.json();

	try {
		await client.connect();
		const database = client.db('voterinfo');
		const collection = database.collection('voterinfo');

		const result = await collection.insertOne({
			flatNo,
			epicNo,
			name,
			age,
			relativeName,
			phoneNo,
			buildingName,
		});

		return new Response(JSON.stringify({ insertedId: result.insertedId }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error adding voter:', error);
		return new Response(JSON.stringify({ error: 'Failed to add voter' }), { status: 500 });
	} finally {
		await client.close();
	}
}
