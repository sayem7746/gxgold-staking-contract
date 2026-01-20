"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { usePendingRewards, useClaimReward, useStakeInfo, useAPY } from "@/hooks/useStaking";
import { formatToken, formatTimestamp, calculateEstimatedReward } from "@/lib/utils";

export function RewardsCard() {
  const { address, isConnected } = useAccount();
  const [displayedReward, setDisplayedReward] = useState<bigint>(BigInt(0));

  const { data: pendingRewards, refetch: refetchRewards } = usePendingRewards(address);
  const { data: stakeInfo, refetch: refetchStakeInfo } = useStakeInfo(address);
  const { data: apy } = useAPY();

  const {
    claimReward,
    isPending: isClaiming,
    isConfirming: isConfirmingClaim,
    isSuccess: claimSuccess,
  } = useClaimReward();

  // Sync displayed reward with contract value
  useEffect(() => {
    if (pendingRewards !== undefined) {
      setDisplayedReward(pendingRewards);
    }
  }, [pendingRewards]);

  // Reset to 0 when user has no stake (e.g., after full unstake)
  useEffect(() => {
    if (stakeInfo && (stakeInfo as { amount: bigint }).amount === BigInt(0)) {
      setDisplayedReward(BigInt(0));
    }
  }, [stakeInfo]);

  // Simulate real-time reward accumulation
  useEffect(() => {
    if (!stakeInfo || !apy) return;
    const stakedAmount = (stakeInfo as { amount: bigint }).amount;
    if (stakedAmount === BigInt(0)) return;

    const interval = setInterval(() => {
      setDisplayedReward((prev) => {
        const increment = calculateEstimatedReward(stakedAmount, apy, 1);
        return prev + increment;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stakeInfo, apy]);

  // Reset displayed reward and refetch after successful claim
  useEffect(() => {
    if (claimSuccess) {
      setDisplayedReward(BigInt(0)); // Immediately reset to 0
      refetchRewards();
      refetchStakeInfo();
    }
  }, [claimSuccess, refetchRewards, refetchStakeInfo]);

  const handleClaim = () => {
    if (!isConnected || displayedReward === BigInt(0)) return;
    claimReward();
  };

  const isLoading = isClaiming || isConfirmingClaim;
  const canClaim = isConnected && displayedReward > BigInt(0) && !isLoading;

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (isLoading) return "Claiming...";
    if (displayedReward === BigInt(0)) return "No Rewards";
    return "Claim Rewards";
  };

  const lastClaimedAt = stakeInfo
    ? (stakeInfo as { lastRewardClaimedAt: bigint }).lastRewardClaimedAt
    : undefined;

  return (
    <div className="card-gradient rounded-2xl p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Your Rewards</h3>

      <div className="mb-6 rounded-xl bg-gradient-to-br from-gold-500/10 to-gold-600/5 p-4">
        <p className="mb-1 text-sm text-gray-400">Pending Rewards</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gold-400 pulse-gold">
            {formatToken(displayedReward, 18, 6)}
          </span>
          <span className="text-gray-400">XAUT</span>
        </div>
        {displayedReward > BigInt(0) && (
          <p className="mt-2 text-xs text-gray-500">
            Rewards accumulate in real-time based on your stake
          </p>
        )}
      </div>

      <button
        onClick={handleClaim}
        disabled={!canClaim}
        className={`w-full rounded-lg py-3 font-semibold transition-all ${
          canClaim
            ? "bg-gradient-to-r from-gold-500 to-gold-600 text-black hover:from-gold-400 hover:to-gold-500 gold-glow"
            : "cursor-not-allowed bg-gray-800 text-gray-500"
        }`}
      >
        {getButtonText()}
      </button>

      {lastClaimedAt && lastClaimedAt > BigInt(0) && (
        <div className="mt-4 rounded-lg bg-gray-900/50 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Last Claimed</span>
            <span className="text-gray-300">{formatTimestamp(lastClaimedAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
