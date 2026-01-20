'use client';

import { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';

const TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT || '';
const TOKEN_ABI = [
  'function mint(address to, uint256 amount) external',
  'function balanceOf(address account) view returns (uint256)',
  'function symbol() view returns (string)',
];

export function MintToken() {
  const { signer, account, isConnected } = useWeb3();
  const [mintAmount, setMintAmount] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!signer || !account || !TOKEN_CONTRACT_ADDRESS) {
      setError('Please connect your wallet and ensure contracts are deployed');
      return;
    }

    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);
      
      // Get balance before minting
      const balanceBefore = await tokenContract.balanceOf(account);
      
      // Mint tokens
      const amountWei = ethers.parseEther(mintAmount);
      const tx = await tokenContract.mint(account, amountWei);
      
      // Wait for transaction
      await tx.wait();
      
      // Get balance after minting
      const balanceAfter = await tokenContract.balanceOf(account);
      const minted = balanceAfter - balanceBefore;
      
      alert(`Successfully minted ${ethers.formatEther(minted)} XAUT!\n\nYour new balance: ${ethers.formatEther(balanceAfter)} XAUT`);
      setMintAmount('1000');
    } catch (err: any) {
      console.error('Error minting tokens:', err);
      setError(err.message || 'Failed to mint tokens. Make sure you have permission to mint.');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Mint Test Tokens</h2>
        <p className="text-gray-600">Please connect your wallet to mint XAUT tokens for testing.</p>
      </div>
    );
  }

  if (!TOKEN_CONTRACT_ADDRESS) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Mint Test Tokens</h2>
        <p className="text-red-600">Token contract address not configured. Please deploy contracts first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mint Test Tokens</h2>
        <p className="text-sm text-gray-600">
          Mint XAUT tokens to your connected wallet for testing purposes.
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This only works if the token contract allows minting from your address.
          For local testing, the deployer account can mint tokens.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount to Mint (XAUT)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={mintAmount}
            onChange={(e) => {
              setMintAmount(e.target.value);
              setError(null);
            }}
            placeholder="1000"
            min="0"
            step="0.1"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleMint}
            disabled={loading || !mintAmount}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? 'Minting...' : 'Mint Tokens'}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-xs text-gray-600 mb-2">
          <strong>Alternative method:</strong> If minting from the UI doesn't work, use the command line:
        </p>
        <code className="block text-xs bg-gray-800 text-green-400 p-2 rounded overflow-x-auto">
          npm run mint:to {account} {mintAmount || '1000'}
        </code>
      </div>
    </div>
  );
}

