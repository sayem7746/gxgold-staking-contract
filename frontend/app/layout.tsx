import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "XGold Staking",
  description: "Stake your XAUT tokens and earn 240% APY rewards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gradient-animated antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
