"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useChainId, useAccount } from "wagmi";
import { STAKING_ABI, STAKING_ADDRESSES } from "@/lib/contracts";

export function useStakingAddress() {
  const chainId = useChainId();
  return STAKING_ADDRESSES[chainId] || STAKING_ADDRESSES[31337];
}

export function useAPY() {
  const stakingAddress = useStakingAddress();
  return useReadContract({
    address: stakingAddress,
    abi: STAKING_ABI,
    functionName: "apy",
  });
}

export function useTotalStaked() {
  const stakingAddress = useStakingAddress();
  return useReadContract({
    address: stakingAddress,
    abi: STAKING_ABI,
    functionName: "totalStaked",
  });
}

export function useRewardPool() {
  const stakingAddress = useStakingAddress();
  return useReadContract({
    address: stakingAddress,
    abi: STAKING_ABI,
    functionName: "rewardPool",
  });
}

export function useStakeInfo(address: `0x${string}` | undefined) {
  const stakingAddress = useStakingAddress();
  return useReadContract({
    address: stakingAddress,
    abi: STAKING_ABI,
    functionName: "getStakeInfo",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function usePendingRewards(address: `0x${string}` | undefined) {
  const stakingAddress = useStakingAddress();
  return useReadContract({
    address: stakingAddress,
    abi: STAKING_ABI,
    functionName: "calculateReward",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    },
  });
}

export function useStake() {
  const stakingAddress = useStakingAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const stake = (amount: bigint) => {
    writeContract({
      address: stakingAddress,
      abi: STAKING_ABI,
      functionName: "stake",
      args: [amount],
    });
  };

  return {
    stake,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useUnstake() {
  const stakingAddress = useStakingAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const unstake = (amount: bigint) => {
    writeContract({
      address: stakingAddress,
      abi: STAKING_ABI,
      functionName: "unstake",
      args: [amount],
    });
  };

  return {
    unstake,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useClaimReward() {
  const stakingAddress = useStakingAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimReward = () => {
    writeContract({
      address: stakingAddress,
      abi: STAKING_ABI,
      functionName: "claimReward",
    });
  };

  return {
    claimReward,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
