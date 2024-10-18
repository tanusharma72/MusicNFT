import { useState, useEffect } from 'react';
import axios from 'axios';
import Card1 from '../components/Card1'; // Import the Card1 component
import Navbar from '../components/Navbar'; // Import the Navbar component
import { ethers } from 'ethers'; // Import ethers.js
import { abi, NFT_CONTRACT_ADDRESS } from '../constants'; // Import your contract ABI and address

// Utility function to get provider or signer
const getProviderOrSigner = async (web3Modal, needSigner = false) => {
    const provider = await web3Modal.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);

    if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
    }
    return web3Provider;
};

// Main Marketplace component
export default function Marketplace() {
    const [nfts, setNfts] = useState([]); // State for NFTs
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [marketItems, setMarketItems] = useState([]); // State for market items
    const [web3modalRef, setWeb3modalRef] = useState(null); // State for Web3Modal reference

    // Initialize Web3Modal
    useEffect(() => {
        const Web3Modal = require('web3modal').default;
        const modal = new Web3Modal({
            network: 'mainnet', // Specify your network
            providerOptions: {}, // Add any provider options if needed
        });
        setWeb3modalRef(modal);
    }, []);

    // Fetch all NFTs (ipfsHash) from MongoDB
    const fetchNfts = async () => {
        try {
            const response = await fetch('/api/getAllNfts');
            if (!response.ok) {
                throw new Error('No NFTs Available');
            }
            const data = await response.json();
            // Fetch details from Pinata for each NFT
            await fetchNftDetails(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch NFT details from Pinata
    const fetchNftDetails = async (nftArray) => {
        const detailsArray = [];
        for (const nft of nftArray) {
            const ipfsHash = nft.ipfsHash;
            const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

            try {
                const response = await axios.get(url);
                // No need to log the IPFS hash
                detailsArray.push({ ipfsHash, details: response.data });
            } catch (error) {
                console.error(`Error fetching data for IPFS hash:`, error.response ? error.response.data : error.message);
                detailsArray.push({ ipfsHash, details: null });
            }
        }
        setNfts(detailsArray);
    };

    // Fetch market items on component mount
    useEffect(() => {
        if (web3modalRef) {
            const getMarketItems = async () => {
                try {
                    const provider = await getProviderOrSigner(web3modalRef, false);
                    const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, abi, provider);
                    const _marketItems = await nftContract.fetchMarketItems();
                    setMarketItems(_marketItems);
                    console.log(_marketItems); // Optional, you can remove this log as well if needed
                } catch (error) {
                    console.error('Error fetching market items NFTs: ', error.message);
                }
            };
            getMarketItems();
        }
    }, [web3modalRef]);

    // Fetch NFTs from MongoDB
    useEffect(() => {
        fetchNfts();
    }, []);

    if (loading) return <p>Loading NFTs...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className='bg-bgBlue min-h-screen px-8 md:px-12'>
            <Navbar />
            <h1 className='mb-12 text-center text-transparent text-2xl md:text-4xl bg-rainbow bg-clip-text font-display'>
                Marketplace
            </h1>
            <div className='grid gap-8 pb-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-4'>
                {nfts.map((nft, index) => (
                    <Card1
                        key={index}
                        imageIpfsHash={nft.details?.imageIpfsHash}
                        musicIpfsHash={nft.details?.musicIpfsHash}
                        nftDetails={nft.details} // Pass other NFT details if needed
                    />
                ))}
            </div>
            {marketItems.length === 0 && (
                <p className='mt-5 text-white text-center'></p>
            )}
        </div>
    );
}
