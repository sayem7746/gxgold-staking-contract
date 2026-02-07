"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAuth } from "@/app/contexts/AuthContext";

export function Header() {
  const { user, logout } = useAuth();

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
              chainStatus="icon"
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
            />
            <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2">
              <span className="text-sm text-gray-400">
                {user}
              </span>
              <button
                onClick={logout}
                className="rounded-md bg-gray-700 px-2.5 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-red-600/80 hover:text-white"
                title="Sign out"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
