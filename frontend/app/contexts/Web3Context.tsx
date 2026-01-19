'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
  addHardhatNetwork: () => Promise<void>;
  addXAUTToken: () => Promise<void>;
  switchToHardhatNetwork: () => Promise<void>;
  currentChainId: number | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const HARDHAT_NETWORK = {
  chainId: '0x7A69', // 31337 in hex
  chainName: 'Hardhat Local',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['http://127.0.0.1:8545'],
  blockExplorerUrls: [],
};

const TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT || '';

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const checkConnection = async () => {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const network = await provider.getNetwork();
            setProvider(provider);
            setSigner(signer);
            setAccount(accounts[0]);
            setCurrentChainId(Number(network.chainId));
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      };
      checkConnection();

      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setCurrentChainId(Number(chainId));
        window.location.reload();
      });
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const accounts = await provider.listAccounts();
        const network = await provider.getNetwork();
        setProvider(provider);
        setSigner(signer);
        setAccount(accounts[0].address);
        setCurrentChainId(Number(network.chainId));
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet. Please make sure MetaMask is installed.');
      }
    } else {
      alert('Please install MetaMask to connect your wallet.');
    }
  };

  const updateNetworkState = async () => {
    if (typeof window !== 'undefined' && window.ethereum && account) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setCurrentChainId(Number(network.chainId));
      const signer = await provider.getSigner();
      setProvider(provider);
      setSigner(signer);
    }
  };

  const switchToHardhatNetwork = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: HARDHAT_NETWORK.chainId }],
        });
        await updateNetworkState();
      } catch (error: any) {
        console.error('Error switching network:', error);
        if (error.code === 4902) {
          // Network not added, add it first
          await addHardhatNetwork();
        } else {
          alert(`Failed to switch network: ${error.message}`);
        }
      }
    }
  };

  const addHardhatNetwork = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [HARDHAT_NETWORK],
        });
        // After adding, update state
        await updateNetworkState();
      } catch (error: any) {
        console.error('Error adding network:', error);
        if (error.code === 4902) {
          // Network already exists, try switching
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: HARDHAT_NETWORK.chainId }],
            });
            await updateNetworkState();
          } catch (switchError: any) {
            alert(`Failed to switch network: ${switchError.message}`);
          }
        } else {
          alert(`Failed to add network: ${error.message}`);
        }
      }
    } else {
      alert('Please install MetaMask to add the network.');
    }
  };

  const addXAUTToken = async () => {
    if (typeof window !== 'undefined' && window.ethereum && TOKEN_CONTRACT_ADDRESS) {
      try {
        // Get token symbol and decimals from contract
        const provider = new ethers.BrowserProvider(window.ethereum);
        const tokenAbi = ['function symbol() view returns (string)', 'function decimals() view returns (uint8)'];
        const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenAbi, provider);
        
        const [symbol, decimals] = await Promise.all([
          tokenContract.symbol(),
          tokenContract.decimals(),
        ]);

        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: TOKEN_CONTRACT_ADDRESS,
              symbol: symbol,
              decimals: decimals,
            },
          },
        });
        alert('XAUT token added to MetaMask successfully!');
      } catch (error: any) {
        console.error('Error adding token:', error);
        alert(`Failed to add token: ${error.message}`);
      }
    } else {
      alert('Token contract address not configured. Please deploy contracts first.');
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        connectWallet,
        disconnectWallet,
        isConnected: !!account,
        addHardhatNetwork,
        addXAUTToken,
        switchToHardhatNetwork,
        currentChainId,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

