"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useIsOwner } from "@/hooks/useStaking";

export function Header() {
  const isOwner = useIsOwner();

  return (
    <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600">
              <span className="text-xl font-bold text-black">X</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">GXGold Staking</h1>
              <p className="text-xs text-gray-400">Stake XAUT, Earn Rewards</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectButton
              showBalance={false}
              chainStatus={isOwner ? "icon" : "none"}
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
