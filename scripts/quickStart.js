const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Quick Start: Deploying and Setting Up Local Environment\n");

  const [deployer, user1] = await ethers.getSigners();

  console.log("Accounts:");
  console.log("  Deployer/Owner:", deployer.address);
  console.log("  User1:", user1.address);
  console.log("");

  // Deploy MockXAUT
  console.log("Deploying MockXAUT...");
  const MockXAUT = await ethers.getContractFactory("MockXAUT");
  const mockXAUT = await MockXAUT.deploy();
  await mockXAUT.waitForDeployment();
  const mockXAUTAddress = await mockXAUT.getAddress();
  console.log("  MockXAUT deployed to:", mockXAUTAddress);

  // Mint XAUT tokens to the specified address
  const mintAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const mintAmount = ethers.parseEther("10000"); // Mint 10,000 XAUT

  console.log(`\nMinting ${ethers.formatEther(mintAmount)} XAUT to ${mintAddress}...`);
  const mintTx = await mockXAUT.mint(mintAddress, mintAmount);
  await mintTx.wait();
  const balanceAfter = await mockXAUT.balanceOf(mintAddress);
  console.log(`  Minted successfully! Balance: ${ethers.formatEther(balanceAfter)} XAUT`);

  // Deploy XGoldStaking
  console.log("\nDeploying XGoldStaking...");
  const XGoldStaking = await ethers.getContractFactory("XGoldStaking");
  const staking = await XGoldStaking.deploy(mockXAUTAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("  XGoldStaking deployed to:", stakingAddress);

  // Fund accounts
  console.log("\nFunding accounts...");
  const rewardAmount = ethers.parseEther("100000");
  const userAmount = ethers.parseEther("10000");

  await mockXAUT.transfer(user1.address, userAmount);
  console.log("  User1 funded:", ethers.formatEther(userAmount), "XAUT");

  // Owner deposits rewards into the contract
  console.log("\nDepositing rewards into staking contract...");
  await mockXAUT.approve(stakingAddress, rewardAmount);
  await staking.depositRewards(rewardAmount);
  console.log("  Deposited", ethers.formatEther(rewardAmount), "XAUT into reward pool");

  // Approve user accounts for staking
  console.log("\nApproving user accounts...");
  const user1Token = mockXAUT.connect(user1);
  await user1Token.approve(stakingAddress, ethers.MaxUint256);
  console.log("  User1 approved staking contract");

  // Create .env.local file for frontend
  console.log("\nCreating frontend .env.local...");
  const envContent = `NEXT_PUBLIC_STAKING_CONTRACT=${stakingAddress}
NEXT_PUBLIC_TOKEN_CONTRACT=${mockXAUTAddress}
`;

  const frontendEnvPath = path.join(__dirname, "..", "frontend", ".env.local");
  fs.writeFileSync(frontendEnvPath, envContent);
  console.log("  Created frontend/.env.local");

  console.log("\n" + "=".repeat(60));
  console.log("Setup Complete!");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("  Staking Contract:", stakingAddress);
  console.log("  Token Contract:", mockXAUTAddress);
  console.log("\nAccount Addresses:");
  console.log("  Owner:", deployer.address);
  console.log("  User1:", user1.address);
  console.log("\nReward Pool Balance:", ethers.formatEther(await staking.rewardPool()), "XAUT");
  console.log("\nPrivate Keys (from Hardhat node):");
  console.log("  Check the Hardhat node terminal for private keys");
  console.log("  Import these accounts to MetaMask for testing");
  console.log("\nNext Steps:");
  console.log("  1. Keep Hardhat node running (npm run node)");
  console.log("  2. Configure MetaMask:");
  console.log("     - Network: Hardhat Local");
  console.log("     - RPC URL: http://127.0.0.1:8545");
  console.log("     - Chain ID: 31337");
  console.log("  3. Import test accounts to MetaMask");
  console.log("  4. Start frontend: cd frontend && npm run dev");
  console.log("  5. Open http://localhost:3000");
  console.log("\nTip: Use User1 account to test staking");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
