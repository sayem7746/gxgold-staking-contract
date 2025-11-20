const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Quick Start: Deploying and Setting Up Local Environment\n");

  const [deployer, lpReward, user1] = await ethers.getSigners();

  console.log("📋 Accounts:");
  console.log("  Deployer:", deployer.address);
  console.log("  LP Reward:", lpReward.address);
  console.log("  User1:", user1.address);
  console.log("");

  // Deploy MockXAUT
  console.log("📦 Deploying MockXAUT...");
  const MockXAUT = await ethers.getContractFactory("MockXAUT");
  const mockXAUT = await MockXAUT.deploy();
  await mockXAUT.waitForDeployment();
  const mockXAUTAddress = await mockXAUT.getAddress();
  console.log("  ✓ MockXAUT deployed to:", mockXAUTAddress);

  // Deploy XGoldStaking
  console.log("\n📦 Deploying XGoldStaking...");
  const XGoldStaking = await ethers.getContractFactory("XGoldStaking");
  const staking = await XGoldStaking.deploy(mockXAUTAddress, lpReward.address);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("  ✓ XGoldStaking deployed to:", stakingAddress);

  // Fund accounts
  console.log("\n💰 Funding accounts...");
  const lpAmount = ethers.parseEther("100000");
  const userAmount = ethers.parseEther("10000");

  await mockXAUT.transfer(lpReward.address, lpAmount);
  console.log("  ✓ LP wallet funded:", ethers.formatEther(lpAmount), "XAUT");

  await mockXAUT.transfer(user1.address, userAmount);
  console.log("  ✓ User1 funded:", ethers.formatEther(userAmount), "XAUT");

  // Approve contracts
  console.log("\n✅ Approving contracts...");
  const lpToken = mockXAUT.connect(lpReward);
  await lpToken.approve(stakingAddress, ethers.MaxUint256);
  console.log("  ✓ LP wallet approved staking contract");

  const user1Token = mockXAUT.connect(user1);
  await user1Token.approve(stakingAddress, ethers.MaxUint256);
  console.log("  ✓ User1 approved staking contract");

  // Create .env.local file for frontend
  console.log("\n📝 Creating frontend .env.local...");
  const envContent = `NEXT_PUBLIC_STAKING_CONTRACT=${stakingAddress}
NEXT_PUBLIC_TOKEN_CONTRACT=${mockXAUTAddress}
`;

  const frontendEnvPath = path.join(__dirname, "..", "frontend", ".env.local");
  fs.writeFileSync(frontendEnvPath, envContent);
  console.log("  ✓ Created frontend/.env.local");

  console.log("\n" + "=".repeat(60));
  console.log("✅ Setup Complete!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("  Staking Contract:", stakingAddress);
  console.log("  Token Contract:", mockXAUTAddress);
  console.log("\n📋 Account Addresses:");
  console.log("  LP Wallet:", lpReward.address);
  console.log("  User1:", user1.address);
  console.log("\n📋 Private Keys (from Hardhat node):");
  console.log("  Check the Hardhat node terminal for private keys");
  console.log("  Import these accounts to MetaMask for testing");
  console.log("\n🚀 Next Steps:");
  console.log("  1. Keep Hardhat node running (npm run node)");
  console.log("  2. Configure MetaMask:");
  console.log("     - Network: Hardhat Local");
  console.log("     - RPC URL: http://127.0.0.1:8545");
  console.log("     - Chain ID: 31337");
  console.log("  3. Import test accounts to MetaMask");
  console.log("  4. Start frontend: cd frontend && npm run dev");
  console.log("  5. Open http://localhost:3000");
  console.log("\n💡 Tip: Use the LP wallet account to approve rewards");
  console.log("   Use User1 account to test staking");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

