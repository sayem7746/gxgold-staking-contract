const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts to Sepolia with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Deploy MockXAUT for testing on Sepolia
  console.log("\nDeploying MockXAUT...");
  const MockXAUT = await ethers.getContractFactory("MockXAUT");
  const mockXAUT = await MockXAUT.deploy();
  await mockXAUT.waitForDeployment();
  const mockXAUTAddress = await mockXAUT.getAddress();
  console.log("MockXAUT deployed to:", mockXAUTAddress);

  // Mint test tokens to deployer
  const mintAmount = ethers.parseEther("100000"); // Mint 100,000 XAUT for testing
  console.log(`\nMinting ${ethers.formatEther(mintAmount)} XAUT to deployer...`);
  const mintTx = await mockXAUT.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log("Minted successfully!");

  // Deploy XGoldStaking
  console.log("\nDeploying XGoldStaking...");
  const XGoldStaking = await ethers.getContractFactory("XGoldStaking");
  const staking = await XGoldStaking.deploy(mockXAUTAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("XGoldStaking deployed to:", stakingAddress);

  console.log("\n=== Sepolia Deployment Summary ===");
  console.log("Network: Sepolia Testnet");
  console.log("MockXAUT Address:", mockXAUTAddress);
  console.log("XGoldStaking Address:", stakingAddress);
  console.log("Owner Address:", deployer.address);

  console.log("\n=== Frontend Environment Variables ===");
  console.log(`NEXT_PUBLIC_TOKEN_ADDRESS_SEPOLIA=${mockXAUTAddress}`);
  console.log(`NEXT_PUBLIC_STAKING_ADDRESS_SEPOLIA=${stakingAddress}`);

  console.log("\n=== Contract Verification ===");
  console.log("Run the following commands to verify contracts on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${mockXAUTAddress}`);
  console.log(`npx hardhat verify --network sepolia ${stakingAddress} "${mockXAUTAddress}"`);

  console.log("\n=== Next Steps ===");
  console.log("1. Verify contracts on Etherscan using commands above");
  console.log("2. Approve staking contract to spend tokens: mockXAUT.approve(stakingAddress, amount)");
  console.log("3. Deposit rewards: staking.depositRewards(amount)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
