import { formatUnits, parseUnits } from "viem";

export function formatToken(
  value: bigint | undefined,
  decimals: number = 18,
  displayDecimals: number = 6
): string {
  if (value === undefined || value === BigInt(0)) return "0";
  const formatted = formatUnits(value, decimals);
  const num = parseFloat(formatted);
  if (num === 0) return "0";
  
  // For very small amounts, show more precision to ensure visibility
  // Use at least the number of decimals the token supports, up to a reasonable limit
  const minPrecision = Math.min(decimals, 8); // Cap at 8 decimals for display
  const actualDisplayDecimals = Math.max(displayDecimals, minPrecision);
  
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: actualDisplayDecimals,
  });
}

export function formatTokenRaw(value: bigint | undefined, decimals: number = 18): string {
  if (value === undefined) return "0";
  return formatUnits(value, decimals);
}

export function parseToken(value: string, decimals: number = 18): bigint {
  if (!value || value === "") return BigInt(0);
  try {
    return parseUnits(value, decimals);
  } catch {
    return BigInt(0);
  }
}

export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatAPY(apy: bigint | undefined): string {
  if (apy === undefined) return "0%";
  return `${apy.toString()}%`;
}

export function formatTimestamp(timestamp: bigint | undefined): string {
  if (!timestamp || timestamp === BigInt(0)) return "Never";
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
}

export function calculateEstimatedReward(
  stakedAmount: bigint,
  apy: bigint,
  durationSeconds: number
): bigint {
  if (stakedAmount === BigInt(0) || apy === BigInt(0)) return BigInt(0);
  const secondsPerYear = BigInt(365 * 24 * 60 * 60);
  return (stakedAmount * apy * BigInt(durationSeconds)) / (BigInt(100) * secondsPerYear);
}
