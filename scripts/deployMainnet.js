const { ethers, run, network } = require("hardhat");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Real XAUT token address on Ethereum Mainnet
const XAUT_MAINNET_ADDRESS = "0x68749665ff8d2d112fa859aa293f07a622782f38";

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function saveDeployment(data) {
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  const filePath = path.join(deploymentsDir, "mainnet.json");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Deployment artifacts saved to: ${filePath}`);
}

async function verifyContract(address, constructorArgs) {
  console.log("\nVerifying contract on Etherscan...");
  try {
    await run("verify:verify", {
      address,
      constructorArguments: constructorArgs,
    });
    console.log("Contract verified successfully!");
    return true;
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("Contract is already verified.");
      return true;
    }
    console.error("Verification failed:", error.message);
    console.log("You can retry manually:");
    console.log(`npx hardhat verify --network mainnet ${address} "${constructorArgs[0]}"`);
    return false;
  }
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  // Pre-flight checks
  console.log("=== MAINNET DEPLOYMENT - PRE-FLIGHT CHECKS ===\n");

  console.log("Deployer address:", deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  console.log("XAUT token address:", XAUT_MAINNET_ADDRESS);
  console.log("Network:", network.name);

  if (network.name !== "mainnet") {
    console.error(`\nERROR: Expected network 'mainnet' but got '${network.name}'.`);
    console.error("Run with: npx hardhat run scripts/deployMainnet.js --network mainnet");
    process.exit(1);
  }

  if (balance === 0n) {
    console.error("\nERROR: Deployer account has no ETH. Fund the account before deploying.");
    process.exit(1);
  }

  const minBalance = ethers.parseEther("0.01");
  if (balance < minBalance) {
    console.warn(`\nWARNING: Low balance (${ethers.formatEther(balance)} ETH). Deployment may fail.`);
  }

  // Confirmation prompt
  console.log("\n========================================");
  console.log("WARNING: This will deploy to Ethereum Mainnet using REAL ETH!");
  console.log("========================================\n");

  const answer = await prompt("Type 'yes' to confirm mainnet deployment: ");
  if (answer !== "yes") {
    console.log("Deployment cancelled.");
    process.exit(0);
  }

  // Deploy
  console.log("\nDeploying XGoldStaking...");
  const XGoldStaking = await ethers.getContractFactory("XGoldStaking");
  const staking = await XGoldStaking.deploy(XAUT_MAINNET_ADDRESS);

  console.log("Transaction hash:", staking.deploymentTransaction().hash);
  console.log("Waiting for confirmation...");

  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  const deployTx = staking.deploymentTransaction();
  const receipt = await deployTx.wait();

  console.log("XGoldStaking deployed to:", stakingAddress);
  console.log("Gas used:", receipt.gasUsed.toString());
  console.log("Block number:", receipt.blockNumber);

  // Save deployment artifacts
  const deploymentData = {
    network: "mainnet",
    chainId: 1,
    deployedAt: new Date().toISOString(),
    blockNumber: receipt.blockNumber,
    contracts: {
      XGoldStaking: {
        address: stakingAddress,
        transactionHash: deployTx.hash,
        constructorArgs: [XAUT_MAINNET_ADDRESS],
      },
    },
    xautToken: XAUT_MAINNET_ADDRESS,
    deployer: deployer.address,
    gasUsed: receipt.gasUsed.toString(),
  };
  saveDeployment(deploymentData);

  // Verify contract on Etherscan
  console.log("\nWaiting 30 seconds for Etherscan to index the contract...");
  await new Promise((resolve) => setTimeout(resolve, 30000));
  const verified = await verifyContract(stakingAddress, [XAUT_MAINNET_ADDRESS]);

  // Summary
  console.log("\n=== Mainnet Deployment Summary ===");
  console.log("Network:              Ethereum Mainnet");
  console.log("XAUT Token Address:  ", XAUT_MAINNET_ADDRESS);
  console.log("XGoldStaking Address:", stakingAddress);
  console.log("Owner Address:       ", deployer.address);
  console.log("Contract Verified:   ", verified ? "Yes" : "No (retry manually)");
  console.log("Transaction Hash:    ", deployTx.hash);
  console.log("Block Number:        ", receipt.blockNumber);

  console.log("\n=== Frontend Environment Variables ===");
  console.log(`NEXT_PUBLIC_TOKEN_ADDRESS_MAINNET=${XAUT_MAINNET_ADDRESS}`);
  console.log(`NEXT_PUBLIC_STAKING_ADDRESS_MAINNET=${stakingAddress}`);

  console.log("\n=== Next Steps ===");
  console.log("1. Whitelist staker addresses:  staking.addToWhitelist(address) or staking.batchAddToWhitelist([...])");
  console.log("2. Transfer XAUT to owner address for rewards");
  console.log("3. Approve staking contract:    XAUT.approve(stakingAddress, amount)");
  console.log("4. Deposit rewards:             staking.depositRewards(amount)");
  console.log("5. Consider transferring ownership to a multisig (e.g. Gnosis Safe)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
