'use client';

import { useStaking } from '../hooks/useStaking';
import { useEffect, useState } from 'react';

const STAKING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT || '';
const TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT || '';

export function Dashboard() {
  const { stakeInfo, pendingReward, totalStaked } = useStaking(
    STAKING_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ADDRESS
  );
  const [timeStaked, setTimeStaked] = useState<string>('');

  useEffect(() => {
    if (stakeInfo && stakeInfo.stakedAt > 0) {
      const updateTime = () => {
        const now = Math.floor(Date.now() / 1000);
        const seconds = now - stakeInfo.stakedAt;
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        setTimeStaked(`${days}d ${hours}h ${minutes}m`);
      };
      updateTime();
      const interval = setInterval(updateTime, 60000);
      return () => clearInterval(interval);
    }
  }, [stakeInfo]);

  const stakedAmount = stakeInfo ? parseFloat(stakeInfo.amount) : 0;
  const monthlyReward = stakedAmount * 0.20;
  const annualReward = stakedAmount * 2.40;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Staking Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <p className="text-sm opacity-90">Total Staked</p>
          <p className="text-3xl font-bold mt-2">{parseFloat(totalStaked).toFixed(4)} XAUT</p>
        </div>

        {stakedAmount > 0 && (
          <>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
              <p className="text-sm opacity-90">Your Staked Amount</p>
              <p className="text-3xl font-bold mt-2">{stakedAmount.toFixed(4)} XAUT</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
              <p className="text-sm opacity-90">Pending Rewards</p>
              <p className="text-3xl font-bold mt-2">{parseFloat(pendingReward).toFixed(4)} XAUT</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg">
              <p className="text-sm opacity-90">Time Staked</p>
              <p className="text-3xl font-bold mt-2">{timeStaked || '0d 0h 0m'}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Projected Rewards</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Monthly (20%)</p>
                  <p className="text-xl font-bold text-gray-800">{monthlyReward.toFixed(4)} XAUT</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Annual (240%)</p>
                  <p className="text-xl font-bold text-gray-800">{annualReward.toFixed(4)} XAUT</p>
                </div>
              </div>
            </div>
          </>
        )}

        {stakedAmount === 0 && (
          <div className="bg-gray-50 p-6 rounded-lg col-span-1 md:col-span-2 text-center">
            <p className="text-gray-600">No active staking. Start staking to see your rewards!</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm font-semibold text-blue-800">APY: 240%</p>
        <p className="text-xs text-blue-600 mt-1">Rewards are calculated daily and distributed from LP address</p>
      </div>
    </div>
  );
}

