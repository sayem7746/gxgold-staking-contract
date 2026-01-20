'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';

const STAKING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT || '';
const TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT || '';

const STAKING_ABI = [
  'function lpRewardAddress() view returns (address)',
  'function totalStaked() view returns (uint256)',
];

const TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

export function LPAdminPanel() {
  const { signer, account } = useWeb3();
  const [lpAddress, setLpAddress] = useState<string>('');
  const [lpBalance, setLpBalance] = useState<string>('0');
  const [lpAllowance, setLpAllowance] = useState<string>('0');
  const [totalStaked, setTotalStaked] = useState<string>('0');
  const [approveAmount, setApproveAmount] = useState<string>('');
  const [dailyProfit, setDailyProfit] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!signer || !STAKING_CONTRACT_ADDRESS) return;

    const loadLPData = async () => {
      try {
        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);
        const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);

        const [lpAddr, total] = await Promise.all([
          stakingContract.lpRewardAddress(),
          stakingContract.totalStaked(),
        ]);

        setLpAddress(lpAddr);

        if (lpAddr && lpAddr !== ethers.ZeroAddress) {
          const [balance, allowance] = await Promise.all([
            tokenContract.balanceOf(lpAddr),
            tokenContract.allowance(lpAddr, STAKING_CONTRACT_ADDRESS),
          ]);

          setLpBalance(ethers.formatEther(balance));
          setLpAllowance(ethers.formatEther(allowance));
        }

        setTotalStaked(ethers.formatEther(total));
      } catch (error) {
        console.error('Error loading LP data:', error);
      }
    };

    loadLPData();
    const interval = setInterval(loadLPData, 10000);
    return () => clearInterval(interval);
  }, [signer]);

  useEffect(() => {
    const generateDailyProfit = () => {
      const total = parseFloat(totalStaked);
      const dailyRate = 0.20 / 30;
      const profits: number[] = [];
      for (let i = 0; i < 30; i++) {
        profits.push(total * dailyRate * (i + 1));
      }
      setDailyProfit(profits);
    };

    if (parseFloat(totalStaked) > 0) {
      generateDailyProfit();
    }
  }, [totalStaked]);

  const handleApprove = async () => {
    if (!signer || !approveAmount || lpAddress !== account) {
      alert('You must be the LP address to approve');
      return;
    }

    setLoading(true);
    try {
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);
      const tx = await tokenContract.approve(STAKING_CONTRACT_ADDRESS, ethers.parseEther(approveAmount));
      await tx.wait();
      alert('Approval successful!');
      setApproveAmount('');
    } catch (error: any) {
      alert(`Approval failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isLPAddress = account && lpAddress.toLowerCase() === account.toLowerCase();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">LP Admin Panel</h2>

      {!isLPAddress && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            You are not the LP address. Connect with the LP wallet to manage rewards.
          </p>
          <p className="text-xs text-yellow-600 mt-1">LP Address: {lpAddress || 'Not set'}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">LP Balance</p>
          <p className="text-2xl font-bold text-blue-800">{parseFloat(lpBalance).toFixed(4)} XAUT</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">LP Allowance</p>
          <p className="text-2xl font-bold text-green-800">{parseFloat(lpAllowance).toFixed(4)} XAUT</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Staked</p>
          <p className="text-2xl font-bold text-purple-800">{parseFloat(totalStaked).toFixed(4)} XAUT</p>
        </div>
      </div>

      {isLPAddress && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Approve Contract to Pay Rewards</h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={approveAmount}
              onChange={(e) => setApproveAmount(e.target.value)}
              placeholder="Amount to approve"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleApprove}
              disabled={loading || !approveAmount}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Approving...' : 'Approve'}
            </button>
          </div>
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Company Profit Simulation</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Projected daily profit based on total staked (20% monthly = ~0.67% daily)
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dailyProfit.length > 0 ? (
              dailyProfit.map((profit, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Day {index + 1}</span>
                  <span className="font-semibold text-green-600">{profit.toFixed(4)} XAUT</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No staking data available</p>
            )}
          </div>
          {dailyProfit.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">30-Day Total Profit</span>
                <span className="text-xl font-bold text-green-600">
                  {dailyProfit[dailyProfit.length - 1].toFixed(4)} XAUT
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

