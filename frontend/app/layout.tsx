import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "GXGold Staking - Earn 240% APY",
  description: "Stake your XAUT tokens and earn rewards with GXGold Staking Protocol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-animated min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
