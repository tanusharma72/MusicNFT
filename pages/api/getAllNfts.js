// pages/api/getAllNfts.js

import { MongoClient } from 'mongodb';

const MONGO_URI =  "mongodb+srv://vdixit3911:lha2jH99GlE3YLt7@cluster0.qzr8g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(MONGO_URI);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(MONGO_URI);
    clientPromise = client.connect();
}

export default async function handler(req, res) {
    try {
        console.log('Connecting to MongoDB...');
        const client = await clientPromise;
        const db = client.db('test_database');
        const collection = db.collection('metadata_hashes');

        console.log('Fetching ipfsHash from metadata_hashes collection...');
        const data = await collection.find({}, { projection: { _id: 0, ipfsHash: 1 } }).toArray();

        console.log('Fetched data:', data);
        
        if (data.length === 0) {
            return res.status(404).json({ message: 'No NFTs found' });
        }

        res.status(200).json(data); // Send the data as JSON response
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
