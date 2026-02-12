"use client";

import { Header } from "@/components/Header";
import { StakeCard } from "@/components/StakeCard";
import { RewardsCard } from "@/components/RewardsCard";
import { StatsCard } from "@/components/StatsCard";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();

  // Auth temporarily disabled — show dashboard directly
  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-white md:text-4xl">
            Stake XAUT, Earn{" "}
            <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              240% APY
            </span>
          </h2>
          <p className="text-gray-400">
            Earn rewards by staking your XAUT tokens in our secure staking protocol
          </p>
        </div>

        {!isConnected && (
          <div className="mb-8 rounded-2xl border border-gold-500/20 bg-gold-500/5 p-6 text-center">
            <p className="text-gray-300">
              Connect your wallet to start staking and earning rewards
            </p>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Staking */}
          <div className="lg:col-span-2">
            <div className="grid gap-6 md:grid-cols-2">
              <StakeCard />
              <RewardsCard />
            </div>
          </div>

          {/* Right Column - Stats */}
          <div>
            <StatsCard />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
            <h4 className="mb-2 font-semibold text-white">High APY</h4>
            <p className="text-sm text-gray-400">
              Earn up to 240% annual percentage yield on your staked XAUT tokens
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
            <h4 className="mb-2 font-semibold text-white">No Lock Period</h4>
            <p className="text-sm text-gray-400">
              Stake and unstake anytime. Your tokens are never locked
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
            <h4 className="mb-2 font-semibold text-white">Real-time Rewards</h4>
            <p className="text-sm text-gray-400">
              Watch your rewards accumulate in real-time and claim whenever you want
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          <p>GXGold Staking Protocol</p>
        </footer>
      </main>
    </div>
  );
}
