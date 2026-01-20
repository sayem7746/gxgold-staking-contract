'use client';

import { WalletConnect } from './components/WalletConnect';
import { Dashboard } from './components/Dashboard';
import { StakingPanel } from './components/StakingPanel';
import { LPAdminPanel } from './components/LPAdminPanel';
import { MintToken } from './components/MintToken';
import { useWeb3 } from './contexts/Web3Context';

export default function Home() {
  const { isConnected, currentChainId, switchToHardhatNetwork, addHardhatNetwork } = useWeb3();
  const isHardhatNetwork = currentChainId === 31337;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">XAUT Staking Platform</h1>
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Connect Your Wallet to Get Started
            </h2>
            <p className="text-gray-600 mb-4">
              Please connect your MetaMask wallet to start staking XAUT and earning rewards.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left max-w-2xl mx-auto">
              <p className="text-sm font-semibold text-blue-800 mb-2">Setup Instructions:</p>
              <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                <li>Make sure Hardhat node is running: <code className="bg-blue-100 px-1 rounded">npm run node</code></li>
                <li>Click "Connect Wallet" above</li>
                <li>If prompted, click "Add Hardhat Network" to configure MetaMask</li>
                <li>Click "Add XAUT Token" to see your token balance in MetaMask</li>
              </ol>
            </div>
          </div>
        ) : !isHardhatNetwork ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Wrong Network Detected
              </h2>
              <p className="text-gray-600 mb-6">
                Please switch to the Hardhat Local network (Chain ID: 31337) to use this application.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={switchToHardhatNetwork}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Switch to Hardhat Network
                </button>
                <button
                  onClick={addHardhatNetwork}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Add Hardhat Network
                </button>
              </div>
            </div>
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-left max-w-2xl mx-auto">
              <p className="text-sm font-semibold text-yellow-800 mb-2">Network Configuration:</p>
              <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                <li><strong>Network Name:</strong> Hardhat Local</li>
                <li><strong>RPC URL:</strong> http://127.0.0.1:8545</li>
                <li><strong>Chain ID:</strong> 31337</li>
                <li><strong>Currency Symbol:</strong> ETH</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <Dashboard />
            <MintToken />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <StakingPanel />
              <LPAdminPanel />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>XAUT Staking Platform - 240% APY</p>
            <p className="mt-2">Rewards distributed from LP address</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
