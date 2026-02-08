"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useChainId } from "wagmi";
import { Address } from "viem";
import { ERC20_ABI, TOKEN_ADDRESSES } from "@/lib/contracts";
import { useStakingAddress } from "./useStaking";
import { maxUint256 } from "viem";

export function useTokenAddress(): Address | undefined {
  const chainId = useChainId();
  const tokenAddress = TOKEN_ADDRESSES[chainId];
  
  // Log for debugging
  if (typeof window !== 'undefined') {
    console.log('Current chainId:', chainId);
    console.log('Token address for chain:', tokenAddress);
    console.log('Available token addresses:', TOKEN_ADDRESSES);
  }
  
  if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
    console.error(`No valid token address configured for chainId ${chainId}`);
    return undefined;
  }
  
  return tokenAddress as Address;
}

export function useTokenBalance(address: `0x${string}` | undefined) {
  const tokenAddress = useTokenAddress();
  
  const result = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!tokenAddress,
      refetchInterval: 10000,
    },
  });
  
  // Log for debugging
  if (typeof window !== 'undefined' && address) {
    console.log('Token balance query:', {
      tokenAddress,
      userAddress: address,
      balance: result.data,
      error: result.error,
      isLoading: result.isLoading,
    });
  }
  
  return result;
}

export function useTokenDecimals() {
  const tokenAddress = useTokenAddress();
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: {
      enabled: !!tokenAddress,
    },
  });
}

export function useTokenSymbol() {
  const tokenAddress = useTokenAddress();
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: {
      enabled: !!tokenAddress,
    },
  });
}

export function useTokenAllowance(owner: `0x${string}` | undefined) {
  const tokenAddress = useTokenAddress();
  const stakingAddress = useStakingAddress();

  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: owner && stakingAddress ? [owner, stakingAddress] : undefined,
    query: {
      enabled: !!owner && !!tokenAddress && !!stakingAddress,
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
    if (!tokenAddress || !stakingAddress) {
      console.error('Token address or staking address not configured');
      return;
    }
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
