const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("XGoldStaking", function () {
  let stakingContract;
  let mockXAUT;
  let owner;
  let user1;
  let user2;
  let lpRewardAddress;

  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const STAKE_AMOUNT = ethers.parseEther("1000");
  const APY = 240; // 240%
  const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

  beforeEach(async function () {
    [owner, user1, user2, lpRewardAddress] = await ethers.getSigners();

    const MockXAUT = await ethers.getContractFactory("MockXAUT");
    mockXAUT = await MockXAUT.deploy();

    const XGoldStaking = await ethers.getContractFactory("XGoldStaking");
    stakingContract = await XGoldStaking.deploy(
      await mockXAUT.getAddress(),
      lpRewardAddress.address
    );

    await mockXAUT.transfer(user1.address, ethers.parseEther("10000"));
    await mockXAUT.transfer(user2.address, ethers.parseEther("10000"));
    await mockXAUT.transfer(lpRewardAddress.address, ethers.parseEther("100000"));

    await mockXAUT.connect(lpRewardAddress).approve(
      await stakingContract.getAddress(),
      ethers.MaxUint256
    );
  });

  describe("Deployment", function () {
    it("Should set the correct staking token", async function () {
      expect(await stakingContract.stakingToken()).to.equal(await mockXAUT.getAddress());
    });

    it("Should set the correct LP reward address", async function () {
      expect(await stakingContract.lpRewardAddress()).to.equal(lpRewardAddress.address);
    });

    it("Should set the correct APY", async function () {
      expect(await stakingContract.apy()).to.equal(APY);
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
      const expectedReward = (STAKE_AMOUNT * BigInt(APY) * BigInt(oneDay) * 10000n) / 
                              (BigInt(SECONDS_PER_YEAR) * 10000n);

      expect(reward).to.be.closeTo(expectedReward, ethers.parseEther("0.01"));
    });

    it("Should calculate monthly reward correctly (20% per month)", async function () {
      const oneMonth = 30 * 24 * 60 * 60;
      await time.increase(oneMonth);

      const reward = await stakingContract.calculateReward(user1.address);
      const expectedMonthlyReward = STAKE_AMOUNT * 20n / 100n;

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

    it("Should allow users to claim rewards", async function () {
      const oneDay = 24 * 60 * 60;
      await time.increase(oneDay);

      const reward = await stakingContract.calculateReward(user1.address);
      const lpBalanceBefore = await mockXAUT.balanceOf(lpRewardAddress.address);
      const userBalanceBefore = await mockXAUT.balanceOf(user1.address);

      await expect(stakingContract.connect(user1).claimReward())
        .to.emit(stakingContract, "RewardClaimed")
        .withArgs(user1.address, reward);

      const lpBalanceAfter = await mockXAUT.balanceOf(lpRewardAddress.address);
      const userBalanceAfter = await mockXAUT.balanceOf(user1.address);

      expect(lpBalanceBefore - lpBalanceAfter).to.equal(reward);
      expect(userBalanceAfter - userBalanceBefore).to.equal(reward);
    });

    it("Should revert if no reward to claim", async function () {
      await expect(
        stakingContract.connect(user1).claimReward()
      ).to.be.revertedWith("No reward to claim");
    });

    it("Should auto-claim rewards when staking additional amount", async function () {
      const oneDay = 24 * 60 * 60;
      await time.increase(oneDay);

      const rewardBefore = await stakingContract.calculateReward(user1.address);
      await mockXAUT.connect(user1).approve(
        await stakingContract.getAddress(),
        STAKE_AMOUNT * 2n
      );

      const userBalanceBefore = await mockXAUT.balanceOf(user1.address);
      await stakingContract.connect(user1).stake(STAKE_AMOUNT);
      const userBalanceAfter = await mockXAUT.balanceOf(user1.address);

      expect(userBalanceAfter - userBalanceBefore).to.equal(rewardBefore);
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

      await expect(stakingContract.connect(user1).unstake(unstakeAmount))
        .to.emit(stakingContract, "Unstaked")
        .withArgs(user1.address, unstakeAmount);

      const userBalanceAfter = await mockXAUT.balanceOf(user1.address);
      expect(userBalanceAfter - userBalanceBefore).to.equal(unstakeAmount);

      const stakeInfo = await stakingContract.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(STAKE_AMOUNT - unstakeAmount);
    });

    it("Should auto-claim rewards when unstaking", async function () {
      const oneDay = 24 * 60 * 60;
      await time.increase(oneDay);

      const reward = await stakingContract.calculateReward(user1.address);
      const userBalanceBefore = await mockXAUT.balanceOf(user1.address);

      await stakingContract.connect(user1).unstake(STAKE_AMOUNT);
      const userBalanceAfter = await mockXAUT.balanceOf(user1.address);

      expect(userBalanceAfter - userBalanceBefore).to.equal(STAKE_AMOUNT + reward);
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
    it("Should allow owner to set LP reward address", async function () {
      const newLpAddress = user2.address;
      await expect(stakingContract.setLPRewardAddress(newLpAddress))
        .to.emit(stakingContract, "LPRewardAddressUpdated")
        .withArgs(lpRewardAddress.address, newLpAddress);

      expect(await stakingContract.lpRewardAddress()).to.equal(newLpAddress);
    });

    it("Should not allow non-owner to set LP reward address", async function () {
      await expect(
        stakingContract.connect(user1).setLPRewardAddress(user2.address)
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

