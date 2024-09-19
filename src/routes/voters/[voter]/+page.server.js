import { MongoClient, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

export const load = async ({ params }) => {
	const uri = env.MONGO_URI; // Connection string for your MongoDB instance
	const client = new MongoClient(uri);

	try {
		// Connect to the MongoDB cluster
		await client.connect();

		// Get the database and collection
		const database = client.db(env.dbname);
		const collection = database.collection(env.dbname);

		// Step 1: Find the voter using the _id from params
		const voter = await collection.findOne({ _id: new ObjectId(params.voter) });

		if (!voter) {
			throw new Error('Voter not found');
		}

		// Step 2: Find all residents sharing the same flatNo, buildingName, sectorName, and wing
		const sharedResidents = await collection
			.find({
				flatNo: voter.flatNo || null,
				buildingName: voter.buildingName || null,
				sectorName: voter.sectorName || null,
				wing: voter.wing || ''
			})
			.toArray();

		// Step 3: Convert MongoDB ObjectId to string for serialization
		const serializedVoter = { ...voter, _id: voter._id.toString() };
		const serializedSharedResidents = sharedResidents.map((resident) => ({
			...resident,
			_id: resident._id.toString()
		}));

		// Return the original voter and others sharing the flatNo
		return {
			voter: serializedVoter,
			sharedResidents: serializedSharedResidents
		};
	} catch (error) {
		console.error('Error fetching data:', error);
		return {
			voter: null,
			sharedResidents: []
		};
	} finally {
		// Close the MongoDB connection
		await client.close();
	}
};
