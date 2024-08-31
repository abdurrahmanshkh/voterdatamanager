// src/routes/api/get-voters/+server.js
import { MongoClient } from 'mongodb';

export async function GET() {
	const uri = 'mongodb+srv://abdurrahman19702:Abdur%402002@cluster0.kntzr.mongodb.net/';
	const client = new MongoClient(uri);

	try {
		await client.connect();
		const database = client.db('voterinfo');
		const collection = database.collection('voterinfo');

		const voters = await collection.find({}).toArray();
		return new Response(JSON.stringify(voters), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error fetching voters:', error);
		return new Response(JSON.stringify({ error: 'Failed to fetch voters' }), { status: 500 });
	} finally {
		await client.close();
	}
}
