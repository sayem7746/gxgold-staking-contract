const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get arguments from environment variables (set by wrapper) or command line
  const targetAddress = process.env.MINT_TARGET_ADDRESS;
  
  if (!targetAddress) {
    console.error("❌ Error: Target address is required!");
    console.log("\nUsage:");
    console.log("  npm run mint:to <YOUR_METAMASK_ADDRESS> [amount]");
    console.log("\nExample:");
    console.log("  npm run mint:to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5 1000");
    process.exit(1);
  }

  // Validate address format
  if (!ethers.isAddress(targetAddress)) {
    console.error("❌ Error: Invalid Ethereum address format!");
    process.exit(1);
  }

  // Get amount and token address from environment or defaults
  const amount = process.env.MINT_AMOUNT || "1000";
  const amountWei = ethers.parseEther(amount);
  
  // Token address can be passed via env, or read from frontend .env.local
  let tokenAddress = process.env.MINT_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_TOKEN_CONTRACT;
  
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

  // If still not found, try to get from last deployment or use default
  if (!tokenAddress) {
    // Try to find from artifacts or use a common default
    console.log("⚠️  Token contract address not found in .env.local");
    console.log("   Trying to find deployed contract...");
    
    // Check if contracts are deployed by trying common addresses
    const [signer] = await ethers.getSigners();
    const MockXAUT = await ethers.getContractFactory("MockXAUT");
    
    // Try to get from deployment artifacts
    const artifactsPath = path.join(__dirname, "..", "artifacts", "contracts", "MockXAUT.sol", "MockXAUT.json");
    if (fs.existsSync(artifactsPath)) {
      console.log("   Found contract artifacts");
    }
    
    console.error("\n❌ Error: Token contract address not found!");
    console.log("\nPlease provide the token contract address:");
    console.log("  1. Run 'npm run quickstart' first to deploy contracts");
    console.log("  2. Or set NEXT_PUBLIC_TOKEN_CONTRACT environment variable");
    console.log("  3. Or pass as 3rd argument: npm run mint:to <ADDRESS> <AMOUNT> <TOKEN_ADDRESS>");
    console.log("\nExample:");
    console.log("  npm run mint:to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5 1000 0x5FbDB2315678afecb367f032d93F642f64180aa3");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  console.log("\n" + "=".repeat(60));
  console.log("💰 Minting XAUT Tokens");
  console.log("=".repeat(60));
  console.log("🔐 From account:", signer.address);
  console.log("🎯 To address:", targetAddress);
  console.log("📦 Token contract:", tokenAddress);
  console.log("💵 Amount:", amount, "XAUT");
  console.log("");

  // Connect to the deployed MockXAUT contract
  const MockXAUT = await ethers.getContractFactory("MockXAUT");
  const mockXAUT = MockXAUT.attach(tokenAddress);

  // Verify contract is valid
  try {
    const symbol = await mockXAUT.symbol();
    const decimals = await mockXAUT.decimals();
    console.log("✓ Connected to token contract");
    console.log("  Symbol:", symbol);
    console.log("  Decimals:", decimals);
  } catch (error) {
    console.error("❌ Error: Could not connect to token contract at", tokenAddress);
    console.error("   Make sure the contract is deployed and the address is correct");
    process.exit(1);
  }

  // Check current balance
  const balanceBefore = await mockXAUT.balanceOf(targetAddress);
  console.log(`\n📊 Balance before: ${ethers.formatEther(balanceBefore)} XAUT`);

  // Mint tokens
  console.log(`\n⏳ Minting ${amount} XAUT...`);
  try {
    const tx = await mockXAUT.mint(targetAddress, amountWei);
    console.log("   Transaction hash:", tx.hash);
    console.log("   Waiting for confirmation...");
    
    await tx.wait();
    console.log("✅ Transaction confirmed!");
  } catch (error) {
    console.error("❌ Error minting tokens:", error.message);
    if (error.message.includes("nonce")) {
      console.log("\n💡 Tip: Try again in a few seconds");
    }
    process.exit(1);
  }

  // Check new balance
  const balanceAfter = await mockXAUT.balanceOf(targetAddress);
  const minted = balanceAfter - balanceBefore;
  
  console.log(`\n📊 Balance after: ${ethers.formatEther(balanceAfter)} XAUT`);
  console.log(`✨ Successfully minted: ${ethers.formatEther(minted)} XAUT`);
  console.log("\n" + "=".repeat(60));
  console.log("✅ Done! Your tokens should now appear in MetaMask");
  console.log("=".repeat(60));
  console.log("\n💡 Next steps:");
  console.log("  1. Make sure you're on Hardhat Local network in MetaMask");
  console.log("  2. Click 'Add XAUT Token' button in the app");
  console.log("  3. Or manually add token in MetaMask:");
  console.log("     - Import tokens → Custom token");
  console.log("     - Address:", tokenAddress);
  console.log("     - Symbol: MOCKXAUT (or check contract)");
  console.log("     - Decimals: 18");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

