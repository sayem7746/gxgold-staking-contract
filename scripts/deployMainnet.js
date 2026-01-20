const { ethers } = require("hardhat");

// Real XAUT token address on Ethereum Mainnet
const XAUT_MAINNET_ADDRESS = "0x68749665ff8d2d112fa859aa293f07a622782f38";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=== MAINNET DEPLOYMENT ===");
  console.log("WARNING: This will deploy to Ethereum Mainnet using real ETH for gas!");
  console.log("");
  console.log("Deployer address:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("XAUT token address:", XAUT_MAINNET_ADDRESS);

  // Deploy XGoldStaking with real XAUT address
  console.log("\nDeploying XGoldStaking...");
  const XGoldStaking = await ethers.getContractFactory("XGoldStaking");
  const staking = await XGoldStaking.deploy(XAUT_MAINNET_ADDRESS);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("XGoldStaking deployed to:", stakingAddress);

  console.log("\n=== Mainnet Deployment Summary ===");
  console.log("Network: Ethereum Mainnet");
  console.log("XAUT Token Address:", XAUT_MAINNET_ADDRESS);
  console.log("XGoldStaking Address:", stakingAddress);
  console.log("Owner Address:", deployer.address);

  console.log("\n=== Frontend Environment Variables ===");
  console.log(`NEXT_PUBLIC_TOKEN_ADDRESS_MAINNET=${XAUT_MAINNET_ADDRESS}`);
  console.log(`NEXT_PUBLIC_STAKING_ADDRESS_MAINNET=${stakingAddress}`);

  console.log("\n=== Contract Verification ===");
  console.log("Run the following command to verify contract on Etherscan:");
  console.log(`npx hardhat verify --network mainnet ${stakingAddress} "${XAUT_MAINNET_ADDRESS}"`);

  console.log("\n=== Next Steps ===");
  console.log("1. Verify contract on Etherscan using command above");
  console.log("2. Transfer XAUT to owner address for rewards");
  console.log("3. Approve staking contract: XAUT.approve(stakingAddress, amount)");
  console.log("4. Deposit rewards: staking.depositRewards(amount)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
