'use client';

import { useState } from 'react';
import { useStaking } from '../hooks/useStaking';

const STAKING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT || '';
const TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT || '';

export function StakingPanel() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const {
    stakeInfo,
    pendingReward,
    tokenBalance,
    allowance,
    loading,
    approve,
    stake,
    unstake,
    claimReward,
  } = useStaking(STAKING_CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS);

  const handleApprove = async () => {
    if (!stakeAmount) return;
    try {
      await approve(stakeAmount);
      alert('Approval successful!');
    } catch (error: any) {
      alert(`Approval failed: ${error.message}`);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount) return;
    try {
      await stake(stakeAmount);
      alert('Staking successful!');
      setStakeAmount('');
    } catch (error: any) {
      alert(`Staking failed: ${error.message}`);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount) return;
    try {
      await unstake(unstakeAmount);
      alert('Unstaking successful!');
      setUnstakeAmount('');
    } catch (error: any) {
      alert(`Unstaking failed: ${error.message}`);
    }
  };

  const handleClaimReward = async () => {
    try {
      await claimReward();
      alert('Reward claimed successfully!');
    } catch (error: any) {
      alert(`Claim failed: ${error.message}`);
    }
  };

  const needsApproval = stakeAmount && parseFloat(allowance) < parseFloat(stakeAmount);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Staking Panel</h2>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Token Balance</p>
        <p className="text-2xl font-bold text-gray-800">{parseFloat(tokenBalance).toFixed(4)} XAUT</p>
      </div>

      {stakeInfo && parseFloat(stakeInfo.amount) > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Staked Amount</p>
          <p className="text-2xl font-bold text-blue-800">{parseFloat(stakeInfo.amount).toFixed(4)} XAUT</p>
          <p className="text-sm text-gray-600 mt-2">Pending Rewards</p>
          <p className="text-xl font-semibold text-green-600">{parseFloat(pendingReward).toFixed(4)} XAUT</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stake Amount (XAUT)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={loading}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Approving...' : 'Approve'}
              </button>
            ) : (
              <button
                onClick={handleStake}
                disabled={loading || !stakeAmount}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Staking...' : 'Stake'}
              </button>
            )}
          </div>
        </div>

        {stakeInfo && parseFloat(stakeInfo.amount) > 0 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unstake Amount (XAUT)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="0.0"
                  max={stakeInfo.amount}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleUnstake}
                  disabled={loading || !unstakeAmount}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Unstaking...' : 'Unstake'}
                </button>
              </div>
            </div>

            <button
              onClick={handleClaimReward}
              disabled={loading || parseFloat(pendingReward) === 0}
              className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? 'Claiming...' : `Claim Rewards (${parseFloat(pendingReward).toFixed(4)} XAUT)`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

