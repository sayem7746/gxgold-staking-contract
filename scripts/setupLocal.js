const { ethers } = require("hardhat");

async function main() {
  const [deployer, lpReward, user1, user2] = await ethers.getSigners();

  console.log("Setting up local test environment...");
  console.log("Deployer:", deployer.address);
  console.log("LP Reward:", lpReward.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);

  // Get contract addresses from environment or use defaults
  const tokenAddress = process.env.TOKEN_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const stakingAddress = process.env.STAKING_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  console.log("\nToken Address:", tokenAddress);
  console.log("Staking Address:", stakingAddress);

  const MockXAUT = await ethers.getContractFactory("MockXAUT");
  const token = MockXAUT.attach(tokenAddress);

  const XGoldStaking = await ethers.getContractFactory("XGoldStaking");
  const staking = XGoldStaking.attach(stakingAddress);

  console.log("\n=== Funding Accounts ===");

  // Fund LP wallet with tokens
  const lpAmount = ethers.parseEther("100000");
  console.log(`Transferring ${ethers.formatEther(lpAmount)} XAUT to LP wallet...`);
  await token.transfer(lpReward.address, lpAmount);
  console.log("✓ LP wallet funded");

  // Fund user accounts
  const userAmount = ethers.parseEther("10000");
  console.log(`Transferring ${ethers.formatEther(userAmount)} XAUT to User1...`);
  await token.transfer(user1.address, userAmount);
  console.log("✓ User1 funded");

  console.log(`Transferring ${ethers.formatEther(userAmount)} XAUT to User2...`);
  await token.transfer(user2.address, userAmount);
  console.log("✓ User2 funded");

  // Approve staking contract from LP wallet
  console.log("\n=== Setting up LP Wallet ===");
  const lpToken = token.connect(lpReward);
  const approveAmount = ethers.MaxUint256;
  console.log("Approving staking contract from LP wallet...");
  await lpToken.approve(stakingAddress, approveAmount);
  console.log("✓ LP wallet approved");

  // Approve staking contract from user accounts (for convenience)
  console.log("\n=== Setting up User Accounts ===");
  const user1Token = token.connect(user1);
  await user1Token.approve(stakingAddress, approveAmount);
  console.log("✓ User1 approved");

  const user2Token = token.connect(user2);
  await user2Token.approve(stakingAddress, approveAmount);
  console.log("✓ User2 approved");

  console.log("\n=== Setup Complete ===");
  console.log("\nAccount Balances:");
  console.log("LP Wallet:", ethers.formatEther(await token.balanceOf(lpReward.address)), "XAUT");
  console.log("User1:", ethers.formatEther(await token.balanceOf(user1.address)), "XAUT");
  console.log("User2:", ethers.formatEther(await token.balanceOf(user2.address)), "XAUT");

  console.log("\n=== Private Keys (for MetaMask import) ===");
  console.log("⚠️  WARNING: These are test keys. Never use on mainnet!");
  console.log("LP Wallet Private Key:", process.env.LP_PRIVATE_KEY || "Check Hardhat node output");
  console.log("User1 Private Key:", process.env.USER1_PRIVATE_KEY || "Check Hardhat node output");
  console.log("User2 Private Key:", process.env.USER2_PRIVATE_KEY || "Check Hardhat node output");

  console.log("\n=== Next Steps ===");
  console.log("1. Import accounts to MetaMask using private keys from Hardhat node");
  console.log("2. Connect MetaMask to Hardhat Local network (Chain ID: 31337)");
  console.log("3. Open frontend at http://localhost:3000");
  console.log("4. Start testing!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

