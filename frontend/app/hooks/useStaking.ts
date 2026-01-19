'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';

const STAKING_CONTRACT_ABI = [
  'function stake(uint256 amount)',
  'function unstake(uint256 amount)',
  'function claimReward()',
  'function calculateReward(address user) view returns (uint256)',
  'function getStakeInfo(address user) view returns (tuple(uint256 amount, uint256 stakedAt, uint256 lastRewardClaimedAt))',
  'function totalStaked() view returns (uint256)',
  'function APY() view returns (uint256)',
  'function lpRewardAddress() view returns (address)',
];

const TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

export function useStaking(contractAddress: string, tokenAddress: string) {
  const { signer, account } = useWeb3();
  const [stakeInfo, setStakeInfo] = useState<any>(null);
  const [pendingReward, setPendingReward] = useState<string>('0');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [allowance, setAllowance] = useState<string>('0');
  const [totalStaked, setTotalStaked] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  const stakingContract = signer && contractAddress
    ? new ethers.Contract(contractAddress, STAKING_CONTRACT_ABI, signer)
    : null;

  const tokenContract = signer && tokenAddress
    ? new ethers.Contract(tokenAddress, TOKEN_ABI, signer)
    : null;

  const loadData = async () => {
    if (!stakingContract || !tokenContract || !account) return;

    try {
      const [stake, reward, balance, allow, total] = await Promise.all([
        stakingContract.getStakeInfo(account),
        stakingContract.calculateReward(account),
        tokenContract.balanceOf(account),
        tokenContract.allowance(account, contractAddress),
        stakingContract.totalStaked(),
      ]);

      setStakeInfo({
        amount: ethers.formatEther(stake.amount),
        stakedAt: Number(stake.stakedAt),
        lastRewardClaimedAt: Number(stake.lastRewardClaimedAt),
      });
      setPendingReward(ethers.formatEther(reward));
      setTokenBalance(ethers.formatEther(balance));
      setAllowance(ethers.formatEther(allow));
      setTotalStaked(ethers.formatEther(total));
    } catch (error) {
      console.error('Error loading staking data:', error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [account, contractAddress, tokenAddress]);

  const approve = async (amount: string) => {
    if (!tokenContract) throw new Error('Token contract not initialized');
    setLoading(true);
    try {
      const tx = await tokenContract.approve(contractAddress, ethers.parseEther(amount));
      await tx.wait();
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const stake = async (amount: string) => {
    if (!stakingContract) throw new Error('Staking contract not initialized');
    setLoading(true);
    try {
      const tx = await stakingContract.stake(ethers.parseEther(amount));
      await tx.wait();
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const unstake = async (amount: string) => {
    if (!stakingContract) throw new Error('Staking contract not initialized');
    setLoading(true);
    try {
      const tx = await stakingContract.unstake(ethers.parseEther(amount));
      await tx.wait();
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async () => {
    if (!stakingContract) throw new Error('Staking contract not initialized');
    setLoading(true);
    try {
      const tx = await stakingContract.claimReward();
      await tx.wait();
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  return {
    stakeInfo,
    pendingReward,
    tokenBalance,
    allowance,
    totalStaked,
    loading,
    approve,
    stake,
    unstake,
    claimReward,
    refresh: loadData,
  };
}

