// pages/api/pushName.ts

import { MongoClient } from 'mongodb';

const MONGO_URI = "mongodb+srv://vdixit3911:lha2jH99GlE3YLt7@cluster0.qzr8g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log("Attempting to connect to MongoDB...");

      // Connect to the MongoDB cluster
      const client = new MongoClient(MONGO_URI);
      await client.connect();

      console.log("Connected to MongoDB");

      // Define the database and collection
      const database = client.db('test_database'); // Replace with your DB name
      const collection = database.collection('metadata_hashes'); // Use a meaningful name for the collection

      // Get the IPFS hash from the request body
      const { name } = req.body; // name now contains the IPFS hash

      console.log("Inserting IPFS hash:", name);
      
      // Insert the IPFS hash into the collection
      await collection.insertOne({ ipfsHash: name });

      // Close the connection
      await client.close();
      console.log("Successfully inserted IPFS hash and closed connection");

      // Respond with success
      res.status(200).json({ message: 'IPFS hash pushed to MongoDB', ipfsHash: name });
    } catch (error) {
      console.error('Error pushing IPFS hash to MongoDB:', error);
      res.status(500).json({ error: 'Failed to push IPFS hash to MongoDB' });
    }
  } else {
    // Handle any request that isn't POST
    res.status(405).json({ error: 'Method not allowed' });
  }
}
