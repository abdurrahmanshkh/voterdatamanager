// src/routes/api/get-voters/+server.js
import { MongoClient } from 'mongodb';

export async function GET({ url }) {
	const uri = 'mongodb+srv://abdurrahman19702:Abdur%402002@cluster0.kntzr.mongodb.net/';
	const client = new MongoClient(uri);

	try {
		await client.connect();
		const database = client.db('voterinfo');
		const collection = database.collection('voterinfo');

		const buildingName = url.searchParams.get('buildingName');

		// Fetch unique building names
		const uniqueBuildings = await collection.distinct('buildingName');

		let voters = [];
		if (buildingName) {
			// Fetch voters for the selected building
			voters = await collection.find({ buildingName }).toArray();
		} else {
			// Fetch all voters
			voters = await collection.find({}).toArray();
		}

		return new Response(JSON.stringify({ voters, uniqueBuildings }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error fetching data:', error);
		return new Response(JSON.stringify({ error: 'Failed to fetch data' }), { status: 500 });
	} finally {
		await client.close();
	}
}
