const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const targetAddress = process.env.CHECK_ADDRESS || process.argv[2];
  
  if (!targetAddress) {
    console.error("❌ Error: Address is required!");
    console.log("\nUsage:");
    console.log("  npm run check:balance <ADDRESS>");
    console.log("\nOr set CHECK_ADDRESS environment variable");
    process.exit(1);
  }

  if (!ethers.isAddress(targetAddress)) {
    console.error("❌ Error: Invalid Ethereum address format!");
    process.exit(1);
  }

  // Try to get token address from frontend .env.local
  let tokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT;
  
  if (!tokenAddress) {
    const envPath = path.join(__dirname, "..", "frontend", ".env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      const match = envContent.match(/NEXT_PUBLIC_TOKEN_CONTRACT=(.+)/);
      if (match) {
        tokenAddress = match[1].trim();
      }
    }
  }

  if (!tokenAddress) {
    console.error("❌ Error: Token contract address not found!");
    console.log("Please run 'npm run quickstart' first to deploy contracts");
    process.exit(1);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🔍 Checking XAUT Balance");
  console.log("=".repeat(60));
  console.log("📍 Address:", targetAddress);
  console.log("📦 Token contract:", tokenAddress);
  console.log("");

  try {
    const MockXAUT = await ethers.getContractFactory("MockXAUT");
    const mockXAUT = MockXAUT.attach(tokenAddress);

    // Get token info
    const [symbol, decimals, balance] = await Promise.all([
      mockXAUT.symbol(),
      mockXAUT.decimals(),
      mockXAUT.balanceOf(targetAddress)
    ]);

    console.log("✓ Token Info:");
    console.log("  Symbol:", symbol);
    console.log("  Decimals:", decimals);
    console.log("");
    console.log("💰 Balance:", ethers.formatEther(balance), symbol);
    
    if (balance === 0n) {
      console.log("\n⚠️  Balance is 0. You may need to mint tokens first.");
      console.log("   Run: npm run mint:to", targetAddress, "1000");
    } else {
      console.log("\n✅ Tokens found! If you don't see them in MetaMask:");
      console.log("   1. Make sure you're on Hardhat Local network (Chain ID: 31337)");
      console.log("   2. Click 'Add XAUT Token' button in the app");
      console.log("   3. Or manually add token:");
      console.log("      - Address:", tokenAddress);
      console.log("      - Symbol:", symbol);
      console.log("      - Decimals:", decimals);
    }
  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
    if (error.message.includes("network")) {
      console.log("\n💡 Make sure Hardhat node is running: npm run node");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

