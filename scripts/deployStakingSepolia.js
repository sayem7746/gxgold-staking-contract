const { ethers } = require("hardhat");

const TOKEN_ADDRESS = "0x4C31841FA482e6916Ac9243706aF2374Bb563E9e";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying XGoldStaking to Sepolia with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("Staking token address:", TOKEN_ADDRESS);

  console.log("\nDeploying XGoldStaking...");
  const XGoldStaking = await ethers.getContractFactory("XGoldStaking");
  const staking = await XGoldStaking.deploy(TOKEN_ADDRESS);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();

  console.log("\n=== Deployment Summary ===");
  console.log("Network: Sepolia Testnet");
  console.log("Token Address:", TOKEN_ADDRESS);
  console.log("XGoldStaking Address:", stakingAddress);
  console.log("Owner Address:", deployer.address);

  console.log("\n=== Verify on Etherscan ===");
  console.log(`npx hardhat verify --network sepolia ${stakingAddress} "${TOKEN_ADDRESS}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
