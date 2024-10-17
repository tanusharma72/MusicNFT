import React from 'react';
import { ethers } from 'ethers';
import useweb3store from '../store/web3store'; // Adjust the import path as needed
import { Router } from 'next/router';
import { getProviderOrSigner } from '../store/util'; // Adjust the import path as needed
import { Contract } from 'ethers';
import { abi, NFT_CONTRACT_ADDRESS } from '../constants'; // Adjust the import path as needed

export default function Card1({ imageIpfsHash, musicIpfsHash, nftDetails }) {
    const [loading, setLoading] = React.useState('Buy NFT');
    const { web3modalRef } = useweb3store((state) => ({
        web3modalRef: state.web3Modal,
    }));

    const createMarketSale = async () => {
        try {
            setLoading('Buying NFT');
            const signer = await getProviderOrSigner(web3modalRef, true);
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
            const tx = await nftContract.createMarketSale(nftDetails.tokenId, {
                value: nftDetails.price,
            });
            await tx.wait();
            setLoading('Done!');
            Router.push('/profile');
        } catch (error) {
            alert('You already own this NFT');
            setLoading('Owned');
            console.error('Unable to create market sale', { error });
        }
    };

    // Log the nftDetails to check the structure
    console.log('NFT Details:', nftDetails);

    const formattedPrice = (() => {
        if (typeof nftDetails.price === 'string' || typeof nftDetails.price === 'number') {
            try {
                return ethers.utils.formatEther(nftDetails.price);
            } catch (error) {
                console.error('Error formatting price:', error);
                return 'Invalid Price'; // Fallback in case of an error
            }
        }
        return 'Invalid Price'; // Fallback for invalid type
    })();

    return (
        <div className='text-white p-3 rounded-lg flex flex-col items-center border border-white w-66 min-h-80'>
            <img
                src={`https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`} // Display image from Pinata
                className='rounded-lg mb-4'
                width={300}
                height={300}
                alt='NFT Image'
            />
            <audio controls className="mb-4 w-full">
                <source src={`https://gateway.pinata.cloud/ipfs/${musicIpfsHash}`} type="audio/mp3" />
                Your browser does not support the audio element.
            </audio>
            <div className='flex flex-col items-center w-full'>
                <p className='font-bold text-xl self-center my-4'>{nftDetails.name}</p>
                <div className='grid grid-cols-2 w-full justify-between'>
                    <p className='text-sm text-gray-400 font-thin'>
                        Creator: {nftDetails.creatorName}{' '}
                    </p>
                    <p className='text-sm text-right text-gray-400 font-thin'>
                        Language: {nftDetails.language}
                    </p>
                    <p className='text-sm text-gray-400 font-thin'>
                        Type: {nftDetails.typeofSong}
                    </p>
                    <p className='text-sm text-right text-gray-400 font-thin'>
                        Remaining: {typeof nftDetails.amount === 'object' ? nftDetails.amount.toNumber() : nftDetails.amount} {/* Check type and handle accordingly */}
                    </p>
                </div>
                <p className='my-4'>
                    Price: {' '}
                    <span className='inline-block bg-transparent border border-white rounded-full px-3 py-1 text-sm font-semibold text-white'>
                        {formattedPrice} MATIC
                    </span>
                </p>
            </div>
            <button
                className='bg-lightBlue px-6 py-1 text-white font-sans rounded-3xl'
                onClick={createMarketSale}
                disabled={nftDetails.amount <= 0}>
                {loading}
            </button>
        </div>
    );
}
