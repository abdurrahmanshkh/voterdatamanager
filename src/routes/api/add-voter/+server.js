// src/routes/api/add-voter/+server.js
import { MongoClient } from 'mongodb';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const uri = 'mongodb+srv://abdurrahman19702:Abdur%402002@cluster0.kntzr.mongodb.net/';
	const dbName = 'voterinfo';
	const collectionName = 'voterinfo';

	const client = new MongoClient(uri);

	try {
		const voterData = await request.json();
		await client.connect();
		const database = client.db(dbName);
		const collection = database.collection(collectionName);

		const result = await collection.insertOne(voterData);

		return json({ message: 'New voter added', insertedId: result.insertedId });
	} catch (error) {
		return json({ error: 'Error adding voter', details: error.message }, { status: 500 });
	} finally {
		await client.close();
	}
}
