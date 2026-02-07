import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { mainnet, sepolia, hardhat } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "GXGold Staking",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [hardhat, sepolia, mainnet],
  transports: {
    [hardhat.id]: http("/rpc"),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});
