"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useChainId } from "wagmi";
import { ERC20_ABI, TOKEN_ADDRESSES } from "@/lib/contracts";
import { useStakingAddress } from "./useStaking";
import { maxUint256 } from "viem";

export function useTokenAddress() {
  const chainId = useChainId();
  return TOKEN_ADDRESSES[chainId] || TOKEN_ADDRESSES[31337];
}

export function useTokenBalance(address: `0x${string}` | undefined) {
  const tokenAddress = useTokenAddress();
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });
}

export function useTokenDecimals() {
  const tokenAddress = useTokenAddress();
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
  });
}

export function useTokenSymbol() {
  const tokenAddress = useTokenAddress();
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "symbol",
  });
}

export function useTokenAllowance(owner: `0x${string}` | undefined) {
  const tokenAddress = useTokenAddress();
  const stakingAddress = useStakingAddress();

  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: owner ? [owner, stakingAddress] : undefined,
    query: {
      enabled: !!owner,
    },
  });
}

export function useApprove() {
  const tokenAddress = useTokenAddress();
  const stakingAddress = useStakingAddress();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (amount?: bigint) => {
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [stakingAddress, amount ?? maxUint256],
    });
  };

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
