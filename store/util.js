import { providers } from 'ethers';

export const getProviderOrSigner = async (web3ModalRef, needSigner = false) => {
	const provider = await web3ModalRef.current.connect();
	const web3Provider = new providers.Web3Provider(provider);

	const { chainId } = await web3Provider.getNetwork();
	// Sepolia network ID is 11155111
	if (chainId !== 11155111) {
		window.alert('Change the network to Sepolia');
		throw new Error('Change the network to Sepolia');
	}
	if (needSigner) {
		const signer = web3Provider.getSigner();
		return signer;
	}
	return web3Provider;
};
