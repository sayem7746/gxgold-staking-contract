const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("XGoldStaking", function () {
  let stakingContract;
  let mockXAUT;
  let owner;
  let user1;
  let user2;

  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const STAKE_AMOUNT = ethers.parseEther("1000");
  const REWARD_DEPOSIT = ethers.parseEther("100000");
  const APY = 240; // 240%
  const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const MockXAUT = await ethers.getContractFactory("MockXAUT");
    mockXAUT = await MockXAUT.deploy();

    const XGoldStaking = await ethers.getContractFactory("XGoldStaking");
    stakingContract = await XGoldStaking.deploy(await mockXAUT.getAddress());

    await mockXAUT.transfer(user1.address, ethers.parseEther("10000"));
    await mockXAUT.transfer(user2.address, ethers.parseEther("10000"));

    // Owner approves and deposits rewards into the contract
    await mockXAUT.approve(await stakingContract.getAddress(), REWARD_DEPOSIT);
    await stakingContract.depositRewards(REWARD_DEPOSIT);
  });

  describe("Deployment", function () {
    it("Should set the correct staking token", async function () {
      expect(await stakingContract.stakingToken()).to.equal(await mockXAUT.getAddress());
    });

    it("Should set the correct APY", async function () {
      expect(await stakingContract.apy()).to.equal(APY);
    });

    it("Should have reward pool balance after deposit", async function () {
      expect(await stakingContract.rewardPool()).to.equal(REWARD_DEPOSIT);
    });
  });

  describe("Reward Deposits", function () {
    it("Should allow owner to deposit rewards", async function () {
      const additionalReward = ethers.parseEther("10000");
      await mockXAUT.approve(await stakingContract.getAddress(), additionalReward);

      const poolBefore = await stakingContract.rewardPool();
      await expect(stakingContract.depositRewards(additionalReward))
        .to.emit(stakingContract, "RewardsDeposited")
        .withArgs(owner.address, additionalReward);

      expect(await stakingContract.rewardPool()).to.equal(poolBefore + additionalReward);
    });

    it("Should not allow non-owner to deposit rewards", async function () {
      await mockXAUT.connect(user1).approve(
        await stakingContract.getAddress(),
        ethers.parseEther("1000")
      );
      await expect(
        stakingContract.connect(user1).depositRewards(ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(stakingContract, "OwnableUnauthorizedAccount");
    });

    it("Should revert if deposit amount is zero", async function () {
      await expect(stakingContract.depositRewards(0)).to.be.revertedWith(
        "Amount must be greater than 0"
      );
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake tokens", async function () {
      await mockXAUT.connect(user1).approve(
        await stakingContract.getAddress(),
        STAKE_AMOUNT
      );

      await expect(stakingContract.connect(user1).stake(STAKE_AMOUNT))
        .to.emit(stakingContract, "Staked")
        .withArgs(user1.address, STAKE_AMOUNT);

      const stakeInfo = await stakingContract.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(STAKE_AMOUNT);
      expect(await stakingContract.totalStaked()).to.equal(STAKE_AMOUNT);
    });

    it("Should revert if staking amount is zero", async function () {
      await mockXAUT.connect(user1).approve(
        await stakingContract.getAddress(),
        STAKE_AMOUNT
      );

      await expect(
        stakingContract.connect(user1).stake(0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should allow multiple stakes from same user", async function () {
      await mockXAUT.connect(user1).approve(
        await stakingContract.getAddress(),
        STAKE_AMOUNT * 2n
      );

      await stakingContract.connect(user1).stake(STAKE_AMOUNT);
      await stakingContract.connect(user1).stake(STAKE_AMOUNT);

      const stakeInfo = await stakingContract.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(STAKE_AMOUNT * 2n);
      expect(await stakingContract.totalStaked()).to.equal(STAKE_AMOUNT * 2n);
    });
  });

  describe("Reward Calculation", function () {
    beforeEach(async function () {
      await mockXAUT.connect(user1).approve(
        await stakingContract.getAddress(),
        STAKE_AMOUNT
      );
      await stakingContract.connect(user1).stake(STAKE_AMOUNT);
    });

    it("Should calculate rewards correctly for 240% APY", async function () {
      const oneDay = 24 * 60 * 60;
      await time.increase(oneDay);

      const reward = await stakingContract.calculateReward(user1.address);
      // reward = (amount * apy * timeElapsed) / (100 * SECONDS_PER_YEAR)
      const expectedReward = (STAKE_AMOUNT * BigInt(APY) * BigInt(oneDay)) /
                              (100n * BigInt(SECONDS_PER_YEAR));

      expect(reward).to.be.closeTo(expectedReward, ethers.parseEther("0.01"));
    });

    it("Should calculate monthly reward correctly (20% per month)", async function () {
      const oneMonth = 30 * 24 * 60 * 60;
      await time.increase(oneMonth);

      const reward = await stakingContract.calculateReward(user1.address);
      // 30 days at 240% APY = 30/365 * 240% = ~19.73%
      const expectedMonthlyReward = (STAKE_AMOUNT * BigInt(240) * BigInt(oneMonth)) / (100n * BigInt(SECONDS_PER_YEAR));

      expect(reward).to.be.closeTo(expectedMonthlyReward, ethers.parseEther("1"));
    });

    it("Should return zero reward if no time has passed", async function () {
      const reward = await stakingContract.calculateReward(user1.address);
      expect(reward).to.equal(0);
    });
  });

  describe("Claiming Rewards", function () {
    beforeEach(async function () {
      await mockXAUT.connect(user1).approve(
        await stakingContract.getAddress(),
        STAKE_AMOUNT
      );
      await stakingContract.connect(user1).stake(STAKE_AMOUNT);
    });

    it("Should allow users to claim rewards from reward pool", async function () {
      const oneDay = 24 * 60 * 60;
      await time.increase(oneDay);

      const poolBefore = await stakingContract.rewardPool();
      const userBalanceBefore = await mockXAUT.balanceOf(user1.address);

      const tx = await stakingContract.connect(user1).claimReward();
      const receipt = await tx.wait();

      // Get actual reward from event
      const event = receipt.logs.find(log => {
        try {
          return stakingContract.interface.parseLog(log)?.name === "RewardClaimed";
        } catch { return false; }
      });
      const parsedEvent = stakingContract.interface.parseLog(event);
      const actualReward = parsedEvent.args.reward;

      const poolAfter = await stakingContract.rewardPool();
      const userBalanceAfter = await mockXAUT.balanceOf(user1.address);

      expect(actualReward).to.be.gt(0);
      expect(poolBefore - poolAfter).to.equal(actualReward);
      expect(userBalanceAfter - userBalanceBefore).to.equal(actualReward);
    });

    it("Should revert if no reward to claim", async function () {
      // Use user2 who hasn't staked
      await expect(
        stakingContract.connect(user2).claimReward()
      ).to.be.revertedWith("No reward to claim");
    });

    it("Should revert if reward pool is insufficient", async function () {
      // Deploy a fresh contract without depositing rewards
      const XGoldStaking = await ethers.getContractFactory("XGoldStaking");
      const emptyPoolContract = await XGoldStaking.deploy(await mockXAUT.getAddress());

      await mockXAUT.connect(user1).approve(
        await emptyPoolContract.getAddress(),
        STAKE_AMOUNT
      );
      await emptyPoolContract.connect(user1).stake(STAKE_AMOUNT);

      const oneDay = 24 * 60 * 60;
      await time.increase(oneDay);

      await expect(
        emptyPoolContract.connect(user1).claimReward()
      ).to.be.revertedWith("Insufficient reward pool");
    });

    it("Should auto-claim rewards when staking additional amount", async function () {
      const oneDay = 24 * 60 * 60;
      await time.increase(oneDay);

      await mockXAUT.connect(user1).approve(
        await stakingContract.getAddress(),
        STAKE_AMOUNT * 2n
      );

      const userBalanceBefore = await mockXAUT.balanceOf(user1.address);
      const tx = await stakingContract.connect(user1).stake(STAKE_AMOUNT);
      const receipt = await tx.wait();
      const userBalanceAfter = await mockXAUT.balanceOf(user1.address);

      // Get actual reward from event
      const event = receipt.logs.find(log => {
        try {
          return stakingContract.interface.parseLog(log)?.name === "RewardClaimed";
        } catch { return false; }
      });
      const parsedEvent = stakingContract.interface.parseLog(event);
      const actualReward = parsedEvent.args.reward;

      // User balance change = reward received - stake amount
      expect(userBalanceAfter - userBalanceBefore + STAKE_AMOUNT).to.equal(actualReward);
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      await mockXAUT.connect(user1).approve(
        await stakingContract.getAddress(),
        STAKE_AMOUNT * 2n
      );
      await stakingContract.connect(user1).stake(STAKE_AMOUNT);
    });

    it("Should allow users to unstake tokens", async function () {
      const unstakeAmount = STAKE_AMOUNT / 2n;
      const userBalanceBefore = await mockXAUT.balanceOf(user1.address);

      const tx = await stakingContract.connect(user1).unstake(unstakeAmount);
      const receipt = await tx.wait();

      // Should emit Unstaked event
      const unstakeEvent = receipt.logs.find(log => {
        try {
          return stakingContract.interface.parseLog(log)?.name === "Unstaked";
        } catch { return false; }
      });
      expect(unstakeEvent).to.not.be.undefined;

      const userBalanceAfter = await mockXAUT.balanceOf(user1.address);
      // Balance increases by at least unstake amount (may include small reward)
      expect(userBalanceAfter - userBalanceBefore).to.be.gte(unstakeAmount);

      const stakeInfo = await stakingContract.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(STAKE_AMOUNT - unstakeAmount);
    });

    it("Should auto-claim rewards when unstaking", async function () {
      const oneDay = 24 * 60 * 60;
      await time.increase(oneDay);

      const userBalanceBefore = await mockXAUT.balanceOf(user1.address);

      const tx = await stakingContract.connect(user1).unstake(STAKE_AMOUNT);
      const receipt = await tx.wait();
      const userBalanceAfter = await mockXAUT.balanceOf(user1.address);

      // Get actual reward from event
      const event = receipt.logs.find(log => {
        try {
          return stakingContract.interface.parseLog(log)?.name === "RewardClaimed";
        } catch { return false; }
      });
      const parsedEvent = stakingContract.interface.parseLog(event);
      const actualReward = parsedEvent.args.reward;

      expect(userBalanceAfter - userBalanceBefore).to.equal(STAKE_AMOUNT + actualReward);
    });

    it("Should revert if unstaking more than staked", async function () {
      await expect(
        stakingContract.connect(user1).unstake(STAKE_AMOUNT + 1n)
      ).to.be.revertedWith("Insufficient staked amount");
    });

    it("Should delete stake info when fully unstaked", async function () {
      await stakingContract.connect(user1).unstake(STAKE_AMOUNT);
      const stakeInfo = await stakingContract.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(0);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to withdraw rewards", async function () {
      const withdrawAmount = ethers.parseEther("10000");
      const poolBefore = await stakingContract.rewardPool();
      const ownerBalanceBefore = await mockXAUT.balanceOf(owner.address);

      await expect(stakingContract.withdrawRewards(withdrawAmount))
        .to.emit(stakingContract, "RewardsWithdrawn")
        .withArgs(owner.address, withdrawAmount);

      expect(await stakingContract.rewardPool()).to.equal(poolBefore - withdrawAmount);
      expect(await mockXAUT.balanceOf(owner.address)).to.equal(ownerBalanceBefore + withdrawAmount);
    });

    it("Should not allow withdrawing more than reward pool", async function () {
      const excessAmount = REWARD_DEPOSIT + 1n;
      await expect(
        stakingContract.withdrawRewards(excessAmount)
      ).to.be.revertedWith("Amount exceeds reward pool");
    });

    it("Should not allow non-owner to withdraw rewards", async function () {
      await expect(
        stakingContract.connect(user1).withdrawRewards(ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(stakingContract, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to emergency withdraw", async function () {
      await mockXAUT.connect(user1).approve(
        await stakingContract.getAddress(),
        STAKE_AMOUNT
      );
      await stakingContract.connect(user1).stake(STAKE_AMOUNT);

      const contractBalance = await mockXAUT.balanceOf(await stakingContract.getAddress());
      const ownerBalanceBefore = await mockXAUT.balanceOf(owner.address);

      await stakingContract.emergencyWithdraw();
      const ownerBalanceAfter = await mockXAUT.balanceOf(owner.address);

      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(contractBalance);
      expect(await stakingContract.rewardPool()).to.equal(0);
      expect(await stakingContract.totalStaked()).to.equal(0);
    });

    it("Should allow owner to set APY", async function () {
      const newAPY = 120;
      await expect(stakingContract.setAPY(newAPY))
        .to.emit(stakingContract, "APYUpdated")
        .withArgs(APY, newAPY);

      expect(await stakingContract.apy()).to.equal(newAPY);
    });

    it("Should not allow APY greater than MAX_APY", async function () {
      await expect(stakingContract.setAPY(241)).to.be.revertedWith("APY exceeds maximum");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple users staking simultaneously", async function () {
      await mockXAUT.connect(user1).approve(
        await stakingContract.getAddress(),
        STAKE_AMOUNT
      );
      await mockXAUT.connect(user2).approve(
        await stakingContract.getAddress(),
        STAKE_AMOUNT
      );

      await stakingContract.connect(user1).stake(STAKE_AMOUNT);
      await stakingContract.connect(user2).stake(STAKE_AMOUNT);

      expect(await stakingContract.totalStaked()).to.equal(STAKE_AMOUNT * 2n);
    });

    it("Should calculate rewards independently for each user", async function () {
      await mockXAUT.connect(user1).approve(
        await stakingContract.getAddress(),
        STAKE_AMOUNT
      );
      await mockXAUT.connect(user2).approve(
        await stakingContract.getAddress(),
        STAKE_AMOUNT
      );

      await stakingContract.connect(user1).stake(STAKE_AMOUNT);
      await time.increase(24 * 60 * 60);
      await stakingContract.connect(user2).stake(STAKE_AMOUNT);

      const reward1 = await stakingContract.calculateReward(user1.address);
      const reward2 = await stakingContract.calculateReward(user2.address);

      expect(reward1).to.be.gt(0);
      expect(reward2).to.equal(0);
    });
  });
});
