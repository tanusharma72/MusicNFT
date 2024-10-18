// pages/upload.tsx

import { PinataSDK } from "pinata-web3";
import { useState } from 'react';
import Navbar from '../components/Navbar'; // Assuming you have a Navbar component

export default function UploadPage() {
  const [albumName, setAlbumName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [typeofSong, setTypeofSong] = useState('');
  const [language, setLanguage] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [musicFile, setMusicFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [loader, setLoader] = useState(false);

  // Handle file selection for music and image
  const handleMusicChange = (e) => {
    setMusicFile(e.target.files[0]);
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Handle the form submission
  const mintNft = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoader(true); // Show loader

    if (!musicFile || !imageFile) {
      setUploadStatus('Please select both a music file and an image file.');
      setLoader(false);
      return;
    }

    try {
      const pinata = new PinataSDK({
        pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
        pinataGateway: "example-gateway.mypinata.cloud",
      });

      // Upload music file
      const musicUpload = await pinata.upload.file(musicFile);
      console.log('Music uploaded:', musicUpload);

      // Upload image file
      const imageUpload = await pinata.upload.file(imageFile);
      console.log('Image uploaded:', imageUpload);

      // Construct the NFT data object
      const nftData = {
        albumName,
        creatorName,
        typeofSong,
        language,
        amount,
        price,
        musicIpfsHash: musicUpload.IpfsHash,
        imageIpfsHash: imageUpload.IpfsHash,
      };

      // Convert NFT data to JSON and upload it to Pinata as a single file
      const jsonBlob = new Blob([JSON.stringify(nftData)], { type: 'application/json' });
      const jsonUpload = await pinata.upload.file(jsonBlob, { pinataMetadata: { name: `${albumName}_NFT_Metadata` } });
      console.log('Metadata uploaded:', jsonUpload);

      // After uploading to Pinata, push the metadata IPFS hash to MongoDB
      await pushMetadataToMongoDB(jsonUpload.IpfsHash);

      // Update the upload status with the metadata IPFS hash
      setUploadStatus(`Files and metadata uploaded successfully! Metadata IPFS Hash: ${jsonUpload.IpfsHash}`);

      // Reset form fields
      resetForm();
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadStatus('File upload failed.');
    } finally {
      setLoader(false); // Hide loader
    }
  };

  // Function to push metadata IPFS hash to MongoDB
  const pushMetadataToMongoDB = async (ipfsHash) => {
    try {
      const response = await fetch('/api/pushName', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: ipfsHash }), // Send the IPFS hash as the name
      });

      if (!response.ok) {
        throw new Error('Failed to push metadata IPFS hash to MongoDB');
      }

      const result = await response.json();
      console.log('MongoDB response:', result);
    } catch (error) {
      console.error('Error pushing to MongoDB:', error);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setAlbumName('');
    setCreatorName('');
    setTypeofSong('');
    setLanguage('');
    setAmount('');
    setPrice('');
    setMusicFile(null);
    setImageFile(null);
    setUploadStatus(null);
  };

  return (
    <div className='bg-bgBlue min-h-screen px-1 md:px-12'>
      <Navbar />
      <h1 className='mb-12 text-center text-transparent text-2xl md:text-3xl bg-rainbow bg-clip-text font-display'>
        Create Your NFT
      </h1>
      <form className='px-12 flex flex-col' onSubmit={mintNft}>
        <div className='grid gap-6 mb-6 md:grid-cols-2'>
          {/* Form Fields */}
          <div>
            <label htmlFor='album_name' className='block mb-2 text-sm font-medium text-white dark:text-white'>Album name</label>
            <input
              type='text'
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              id='album_name'
              className='outline-none bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              placeholder='Music Album name'
              required
            />
          </div>
          <div>
            <label htmlFor='creator-name' className='block mb-2 text-sm font-medium text-white dark:text-white'>Creator name</label>
            <input
              type='text'
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              id='creator-name'
              className='outline-none bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              placeholder='Music Creator name'
              required
            />
          </div>
          <div>
            <label htmlFor='typeofsong' className='block mb-2 text-sm font-medium text-white dark:text-white'>Type of song</label>
            <input
              type='text'
              value={typeofSong}
              onChange={(e) => setTypeofSong(e.target.value)}
              id='typeofsong'
              className='outline-none bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              placeholder='Pop'
              required
            />
          </div>
          <div>
            <label htmlFor='language' className='block mb-2 text-sm font-medium text-white dark:text-white'>Language</label>
            <input
              type='text'
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              id='language'
              className='outline-none bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              placeholder='English'
              required
            />
          </div>
          <div>
            <label htmlFor='amount' className='block mb-2 text-sm font-medium text-white dark:text-white'>Amount</label>
            <input
              type='text'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              id='amount'
              className='outline-none bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              placeholder='2'
              required
            />
          </div>
          <div>
            <label htmlFor='price' className='block mb-2 text-sm font-medium text-white dark:text-white'>Price</label>
            <input
              type='text'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              id='price'
              className='outline-none bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              placeholder='0.01 ETH'
              required
            />
          </div>
        </div>

        {/* File Inputs */}
        <div className='mb-6 flex items-center justify-between'>
  <div className='flex-1 mr-4'>
    <label htmlFor='music' className='block mb-2 text-sm font-medium text-white dark:text-white'>
      Upload Music File
    </label>
    <input
      type='file'
      onChange={handleMusicChange}
      accept='audio/*'
      required
      className='block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none'
    />
  </div>
  
  <div className='flex-1'>
    <label htmlFor='image' className='block mb-2 text-sm font-medium text-white dark:text-white'>
      Upload Image File
    </label>
    <input
      type='file'
      onChange={handleImageChange}
      accept='image/*'
      required
      className='block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none'
    />
  </div>
</div>


        {/* Submit Button */}
        <button type='submit' className='bg-blue-500 text-white py-2 px-4 rounded-lg' disabled={loader}>
          {loader ? 'Uploading...' : 'Mint NFT'}
        </button>

        {/* Status Message */}
        {uploadStatus && <p className='mt-4 text-center text-white'>{uploadStatus}</p>}
      </form>
    </div>
  );
}
