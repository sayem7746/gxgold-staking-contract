const { ethers } = require("hardhat");

async function main() {
  const [deployer, lpReward] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  console.log("\nDeploying MockXAUT...");
  const MockXAUT = await ethers.getContractFactory("MockXAUT");
  const mockXAUT = await MockXAUT.deploy();
  await mockXAUT.waitForDeployment();
  const mockXAUTAddress = await mockXAUT.getAddress();
  console.log("MockXAUT deployed to:", mockXAUTAddress);

  console.log("\nDeploying XGoldStaking...");
  const XGoldStaking = await ethers.getContractFactory("XGoldStaking");
  const staking = await XGoldStaking.deploy(
    mockXAUTAddress,
    lpReward.address
  );
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("XGoldStaking deployed to:", stakingAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("MockXAUT Address:", mockXAUTAddress);
  console.log("XGoldStaking Address:", stakingAddress);
  console.log("LP Reward Address:", lpReward.address);
  console.log("\nAdd these addresses to your frontend .env.local file:");
  console.log(`NEXT_PUBLIC_STAKING_CONTRACT=${stakingAddress}`);
  console.log(`NEXT_PUBLIC_TOKEN_CONTRACT=${mockXAUTAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

