const { ethers } = require("hardhat");

async function main() {
  const [owner, user, lpReward] = await ethers.getSigners();

  console.log("Deploying contracts...");
  
  const MockXAUT = await ethers.getContractFactory("MockXAUT");
  const mockXAUT = await MockXAUT.deploy();
  await mockXAUT.waitForDeployment();
  console.log("MockXAUT deployed to:", await mockXAUT.getAddress());

  // Mint XAUT tokens to the specified address
  const mintAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const mintAmount = ethers.parseEther("10000"); // Mint 10,000 XAUT
  
  console.log(`Minting ${ethers.formatEther(mintAmount)} XAUT to ${mintAddress}...`);
  const mintTx = await mockXAUT.mint(mintAddress, mintAmount);
  await mintTx.wait();
  const balanceAfter = await mockXAUT.balanceOf(mintAddress);
  console.log(`Minted successfully! Balance: ${ethers.formatEther(balanceAfter)} XAUT`);

  const XGoldStaking = await ethers.getContractFactory("XGoldStaking");
  const staking = await XGoldStaking.deploy(
    await mockXAUT.getAddress(),
    lpReward.address
  );
  await staking.waitForDeployment();
  console.log("XGoldStaking deployed to:", await staking.getAddress());

  const stakeAmount = ethers.parseEther("1000");
  
  await mockXAUT.transfer(user.address, stakeAmount);
  await mockXAUT.transfer(lpReward.address, ethers.parseEther("100000"));
  
  await mockXAUT.connect(user).approve(await staking.getAddress(), stakeAmount);
  await mockXAUT.connect(lpReward).approve(await staking.getAddress(), ethers.MaxUint256);

  console.log("\n=== Simulation: 1 Month Staking ===");
  console.log(`Initial stake: ${ethers.formatEther(stakeAmount)} XAUT`);

  await staking.connect(user).stake(stakeAmount);
  console.log("Staked successfully");

  const oneMonth = 30 * 24 * 60 * 60;
  console.log("\nSimulating 1 month...");
  await ethers.provider.send("evm_increaseTime", [oneMonth]);
  await ethers.provider.send("evm_mine", []);

  const reward = await staking.calculateReward(user.address);
  console.log(`Reward after 1 month: ${ethers.formatEther(reward)} XAUT`);
  console.log(`Expected (20%): ${ethers.formatEther(stakeAmount * 20n / 100n)} XAUT`);

  const stakeInfo = await staking.getStakeInfo(user.address);
  console.log(`\nStake Info:`);
  console.log(`  Amount: ${ethers.formatEther(stakeInfo.amount)} XAUT`);
  console.log(`  Staked At: ${new Date(Number(stakeInfo.stakedAt) * 1000).toLocaleString()}`);
  console.log(`  Last Reward Claimed At: ${new Date(Number(stakeInfo.lastRewardClaimedAt) * 1000).toLocaleString()}`);

  await staking.connect(user).claimReward();
  console.log("\nReward claimed successfully");

  const userBalance = await mockXAUT.balanceOf(user.address);
  console.log(`User balance after claim: ${ethers.formatEther(userBalance)} XAUT`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

