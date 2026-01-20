'use client';

import { useWeb3 } from '../contexts/Web3Context';

export function WalletConnect() {
  const { 
    account, 
    connectWallet, 
    disconnectWallet, 
    isConnected,
    addHardhatNetwork,
    addXAUTToken,
    switchToHardhatNetwork,
    currentChainId,
  } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isHardhatNetwork = currentChainId === 31337;
  const HARDHAT_CHAIN_ID = 31337;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-4">
        {isConnected && account ? (
          <>
            {!isHardhatNetwork && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-medium">Wrong Network</span>
                <button
                  onClick={switchToHardhatNetwork}
                  className="px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Switch to Hardhat
                </button>
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">
              {formatAddress(account)}
            </span>
            <button
              onClick={disconnectWallet}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={connectWallet}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Connect Wallet
          </button>
        )}
      </div>
      {isConnected && (
        <div className="flex items-center gap-2">
          {!isHardhatNetwork && (
            <button
              onClick={addHardhatNetwork}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Add Hardhat Network
            </button>
          )}
          <button
            onClick={addXAUTToken}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Add XAUT Token
          </button>
        </div>
      )}
    </div>
  );
}

