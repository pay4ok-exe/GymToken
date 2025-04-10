import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { message } from 'antd';

// Import ABI
import UserProfileArtifact from '../artifacts/contracts/UserProfile.sol/UserProfile.json';
import GymCoinArtifact from '../artifacts/contracts/GymCoin.sol/GymCoin.json';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [userProfileContract, setUserProfileContract] = useState(null);
  const [gymCoinContract, setGymCoinContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [networkName, setNetworkName] = useState('');
  const [loading, setLoading] = useState(true);

  // Contract addresses - update these after deployment
  const userProfileAddress = "CONTRACT_ADDRESS_HERE"; // Update after deploying
  const gymCoinAddress = "CONTRACT_ADDRESS_HERE"; // Update after deploying

  // Check if MetaMask is installed
  const checkIfMetaMaskExists = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Initialize Web3
  const initializeWeb3 = async () => {
    try {
      if (!checkIfMetaMaskExists()) {
        message.error('MetaMask is not installed!');
        setLoading(false);
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const network = await provider.getNetwork();
      setNetworkName(network.name);

      // Check if we're on Sepolia testnet
      if (network.chainId !== 11155111) { // Sepolia chainId
        message.warning('Please connect to Sepolia Test Network');
      }

      // Get user's accounts
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        setAccount(account);
        
        const signer = provider.getSigner();
        setSigner(signer);
        
        // Initialize contracts
        await initializeContracts(provider, signer);
        setIsConnected(true);
        
        // Check if user is registered
        await checkUserRegistration(account);
      } else {
        setIsConnected(false);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error initializing Web3:', error);
      message.error('Failed to connect to blockchain');
      setLoading(false);
    }
  };

  // Initialize contracts
  const initializeContracts = async (provider, signer) => {
    try {
      // Initialize UserProfile contract
      const userProfileContract = new ethers.Contract(
        userProfileAddress,
        UserProfileArtifact.abi,
        provider
      );
      const userProfileWithSigner = userProfileContract.connect(signer);
      setUserProfileContract(userProfileWithSigner);

      // Initialize GymCoin contract
      const gymCoinContract = new ethers.Contract(
        gymCoinAddress,
        GymCoinArtifact.abi,
        provider
      );
      const gymCoinWithSigner = gymCoinContract.connect(signer);
      setGymCoinContract(gymCoinWithSigner);
      
      return { userProfileWithSigner, gymCoinWithSigner };
    } catch (error) {
      console.error('Error initializing contracts:', error);
      message.error('Failed to initialize contracts');
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!checkIfMetaMaskExists()) {
        message.error('MetaMask не установлен!');
        return;
      }
      
      setLoading(true);
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length > 0) {
        const account = accounts[0];
        setAccount(account);
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setSigner(signer);
        
        setIsConnected(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      message.error('Не удалось подключить кошелек');
      setLoading(false);
    }
  };
  
  

  // Check if user is registered
  const checkUserRegistration = async (account) => {
    try {
      if (!userProfileContract) return;
      
      const exists = await userProfileContract.userExists(account);
      setIsRegistered(exists);
      
      if (exists) {
        const profile = await userProfileContract.getUserByAddress(account);
        setUserProfile({
          username: profile.username,
          email: profile.email,
          address: profile.userAddress
        });
        
        // Get token balance
        await updateTokenBalance();
      }
    } catch (error) {
      console.error('Error checking user registration:', error);
    }
  };

  // Register user
  const registerUser = async (username, email) => {
    try {
      if (!userProfileContract) {
        message.error('Contract not initialized');
        return;
      }
      
      const tx = await userProfileContract.registerUser(username, email);
      message.loading('Registering user...Please wait for confirmation');
      
      await tx.wait();
      message.success('User registered successfully!');
      
      setIsRegistered(true);
      setUserProfile({
        username,
        email,
        address: account
      });
      
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      message.error('Failed to register user');
      return false;
    }
  };

  // Update token balance
  const updateTokenBalance = async () => {
    try {
      if (!gymCoinContract || !account) return;
      
      const balance = await gymCoinContract.balanceOf(account);
      setTokenBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('Error updating token balance:', error);
    }
  };

  // Buy tokens
  const buyTokens = async (amount) => {
    try {
      if (!gymCoinContract) {
        message.error('Contract not initialized');
        return false;
      }
      
      // Get rates
      const rates = await gymCoinContract.getRates();
      const sellRate = rates.sellRate;
      
      // Calculate ETH amount required
      const gcAmount = ethers.utils.parseEther(amount);
      const ethRequired = gcAmount.mul(sellRate).div(ethers.utils.parseEther('1'));
      
      const tx = await gymCoinContract.buy(gcAmount, {
        value: ethRequired
      });
      
      message.loading('Buying tokens...Please wait for confirmation');
      await tx.wait();
      
      message.success(`Successfully purchased ${amount} GC tokens`);
      await updateTokenBalance();
      return true;
    } catch (error) {
      console.error('Error buying tokens:', error);
      message.error('Failed to buy tokens: ' + error.message);
      return false;
    }
  };

  // Sell tokens
  const sellTokens = async (amount) => {
    try {
      if (!gymCoinContract) {
        message.error('Contract not initialized');
        return false;
      }
      
      const gcAmount = ethers.utils.parseEther(amount);
      
      const tx = await gymCoinContract.sell(gcAmount);
      message.loading('Selling tokens...Please wait for confirmation');
      
      await tx.wait();
      message.success(`Successfully sold ${amount} GC tokens`);
      
      await updateTokenBalance();
      return true;
    } catch (error) {
      console.error('Error selling tokens:', error);
      message.error('Failed to sell tokens: ' + error.message);
      return false;
    }
  };

  // Transfer tokens
  const transferTokens = async (to, amount) => {
    try {
      if (!gymCoinContract) {
        message.error('Contract not initialized');
        return false;
      }
      
      const gcAmount = ethers.utils.parseEther(amount);
      
      const tx = await gymCoinContract.transfer(to, gcAmount);
      message.loading('Transferring tokens...Please wait for confirmation');
      
      await tx.wait();
      message.success(`Successfully transferred ${amount} GC tokens to ${to}`);
      
      await updateTokenBalance();
      return true;
    } catch (error) {
      console.error('Error transferring tokens:', error);
      message.error('Failed to transfer tokens: ' + error.message);
      return false;
    }
  };

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        setIsConnected(false);
        setAccount(null);
        setSigner(null);
        setIsRegistered(false);
        setUserProfile(null);
      } else {
        // Account changed
        const account = accounts[0];
        setAccount(account);
        
        if (provider) {
          const signer = provider.getSigner();
          setSigner(signer);
          
          await initializeContracts(provider, signer);
          setIsConnected(true);
          
          await checkUserRegistration(account);
        }
      }
    };

    const handleChainChanged = () => {
      // Reload the page when chain changes
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [provider]);

  // Initialize on mount
  useEffect(() => {
    initializeWeb3();
  }, []);

  const value = {
    provider,
    signer,
    account,
    userProfileContract,
    gymCoinContract,
    isConnected,
    isRegistered,
    userProfile,
    tokenBalance,
    networkName,
    loading,
    connectWallet,
    registerUser,
    buyTokens,
    sellTokens,
    transferTokens,
    updateTokenBalance
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};