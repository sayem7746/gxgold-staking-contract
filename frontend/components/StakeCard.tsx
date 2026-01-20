"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useStake, useUnstake, useStakeInfo } from "@/hooks/useStaking";
import { useTokenBalance, useTokenAllowance, useApprove } from "@/hooks/useToken";
import { formatToken, parseToken, formatTokenRaw } from "@/lib/utils";

type Tab = "stake" | "unstake";

export function StakeCard() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("stake");
  const [amount, setAmount] = useState("");

  const { data: balance, refetch: refetchBalance } = useTokenBalance(address);
  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(address);
  const { data: stakeInfo, refetch: refetchStakeInfo } = useStakeInfo(address);

  const {
    approve,
    isPending: isApproving,
    isConfirming: isConfirmingApproval,
    isSuccess: approvalSuccess,
  } = useApprove();

  const {
    stake,
    isPending: isStaking,
    isConfirming: isConfirmingStake,
    isSuccess: stakeSuccess,
  } = useStake();

  const {
    unstake,
    isPending: isUnstaking,
    isConfirming: isConfirmingUnstake,
    isSuccess: unstakeSuccess,
  } = useUnstake();

  const parsedAmount = parseToken(amount);
  const hasEnoughBalance = balance !== undefined && parsedAmount <= balance;
  const hasEnoughStaked =
    stakeInfo !== undefined && parsedAmount <= (stakeInfo as { amount: bigint }).amount;
  const needsApproval = allowance !== undefined && parsedAmount > allowance;

  // Refetch data after successful transactions
  useEffect(() => {
    if (approvalSuccess) {
      refetchAllowance();
    }
  }, [approvalSuccess, refetchAllowance]);

  useEffect(() => {
    if (stakeSuccess || unstakeSuccess) {
      setAmount("");
      refetchBalance();
      refetchStakeInfo();
      refetchAllowance();
    }
  }, [stakeSuccess, unstakeSuccess, refetchBalance, refetchStakeInfo, refetchAllowance]);

  const handleMaxClick = () => {
    if (activeTab === "stake" && balance) {
      setAmount(formatTokenRaw(balance));
    } else if (activeTab === "unstake" && stakeInfo) {
      setAmount(formatTokenRaw((stakeInfo as { amount: bigint }).amount));
    }
  };

  const handleAction = () => {
    if (!isConnected || parsedAmount === BigInt(0)) return;

    if (activeTab === "stake") {
      if (needsApproval) {
        approve(parsedAmount);
      } else {
        stake(parsedAmount);
      }
    } else {
      unstake(parsedAmount);
    }
  };

  const isLoading =
    isApproving || isConfirmingApproval || isStaking || isConfirmingStake || isUnstaking || isConfirmingUnstake;

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (parsedAmount === BigInt(0)) return "Enter Amount";
    if (isApproving || isConfirmingApproval) return "Approving...";
    if (isStaking || isConfirmingStake) return "Staking...";
    if (isUnstaking || isConfirmingUnstake) return "Unstaking...";
    if (activeTab === "stake") {
      if (!hasEnoughBalance) return "Insufficient Balance";
      if (needsApproval) return "Approve XAUT";
      return "Stake";
    }
    if (!hasEnoughStaked) return "Insufficient Staked";
    return "Unstake";
  };

  const isButtonDisabled = () => {
    if (!isConnected) return true;
    if (parsedAmount === BigInt(0)) return true;
    if (isLoading) return true;
    if (activeTab === "stake" && !hasEnoughBalance) return true;
    if (activeTab === "unstake" && !hasEnoughStaked) return true;
    return false;
  };

  return (
    <div className="card-gradient rounded-2xl p-6">
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => {
            setActiveTab("stake");
            setAmount("");
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            activeTab === "stake"
              ? "bg-gold-500 text-black"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Stake
        </button>
        <button
          onClick={() => {
            setActiveTab("unstake");
            setAmount("");
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            activeTab === "unstake"
              ? "bg-gold-500 text-black"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Unstake
        </button>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-400">Amount</span>
          <span className="text-sm text-gray-400">
            {activeTab === "stake" ? "Balance" : "Staked"}:{" "}
            <span className="text-white">
              {activeTab === "stake"
                ? formatToken(balance)
                : formatToken(stakeInfo ? (stakeInfo as { amount: bigint }).amount : undefined)}
            </span>{" "}
            XAUT
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-900 p-3">
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-xl text-white outline-none placeholder:text-gray-600"
          />
          <button
            onClick={handleMaxClick}
            className="rounded bg-gray-800 px-2 py-1 text-xs text-gold-400 hover:bg-gray-700"
          >
            MAX
          </button>
          <span className="text-gray-400">XAUT</span>
        </div>
      </div>

      <button
        onClick={handleAction}
        disabled={isButtonDisabled()}
        className={`w-full rounded-lg py-3 font-semibold transition-all ${
          isButtonDisabled()
            ? "cursor-not-allowed bg-gray-800 text-gray-500"
            : "bg-gradient-to-r from-gold-500 to-gold-600 text-black hover:from-gold-400 hover:to-gold-500"
        }`}
      >
        {getButtonText()}
      </button>

      {stakeInfo && (stakeInfo as { amount: bigint }).amount > BigInt(0) && (
        <div className="mt-4 rounded-lg bg-gray-900/50 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Currently Staked</span>
            <span className="text-white">
              {formatToken((stakeInfo as { amount: bigint }).amount)} XAUT
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
