"use client";

import { useAccount } from "wagmi";
import { useAPY, useTotalStaked, useRewardPool, useStakeInfo } from "@/hooks/useStaking";
import { useTokenBalance } from "@/hooks/useToken";
import { formatToken, formatAPY } from "@/lib/utils";

interface StatItemProps {
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
}

function StatItem({ label, value, subValue, highlight }: StatItemProps) {
  return (
    <div className="rounded-lg bg-gray-900/50 p-4">
      <p className="mb-1 text-sm text-gray-400">{label}</p>
      <p className={`text-xl font-bold ${highlight ? "text-gold-400" : "text-white"}`}>{value}</p>
      {subValue && <p className="mt-1 text-xs text-gray-500">{subValue}</p>}
    </div>
  );
}

export function StatsCard() {
  const { address, isConnected } = useAccount();
  const { data: apy } = useAPY();
  const { data: totalStaked } = useTotalStaked();
  const { data: rewardPool } = useRewardPool();
  const { data: stakeInfo } = useStakeInfo(address);
  const { data: balance } = useTokenBalance(address);

  const userStaked = stakeInfo ? (stakeInfo as { amount: bigint }).amount : BigInt(0);

  return (
    <div className="card-gradient rounded-2xl p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Protocol Stats</h3>

      <div className="grid gap-3">
        <StatItem label="Current APY" value={formatAPY(apy)} highlight />

        <StatItem
          label="Total Value Locked"
          value={`${formatToken(totalStaked)} XAUT`}
          subValue="All stakers combined"
        />

        <StatItem
          label="Reward Pool"
          value={`${formatToken(rewardPool)} XAUT`}
          subValue="Available for distribution"
        />

        {isConnected && (
          <>
            <div className="my-2 border-t border-gray-800" />
            <h4 className="text-sm font-medium text-gray-400">Your Position</h4>

            <StatItem
              label="Your Staked Amount"
              value={`${formatToken(userStaked)} XAUT`}
              highlight={userStaked > BigInt(0)}
            />

            <StatItem
              label="Wallet Balance"
              value={`${formatToken(balance)} XAUT`}
              subValue="Available to stake"
            />

            {userStaked > BigInt(0) && totalStaked && totalStaked > BigInt(0) && (
              <StatItem
                label="Your Share"
                value={`${((Number(userStaked) / Number(totalStaked)) * 100).toFixed(2)}%`}
                subValue="Of total staked"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
