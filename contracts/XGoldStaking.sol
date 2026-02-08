// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract XGoldStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;

    uint256 public constant MAX_APY = 240; // Maximum 240% APY
    uint256 public apy = 240; // Current APY, configurable by owner
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant REWARD_PRECISION = 10000; // For precision in calculations

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 lastRewardClaimedAt;
        uint256 unclaimedReward;
    }

    mapping(address => StakeInfo) public stakes;
    mapping(address => bool) public whitelist;
    uint256 public totalStaked;
    uint256 public rewardPool;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event RewardsDeposited(address indexed depositor, uint256 amount);
    event RewardsWithdrawn(address indexed owner, uint256 amount);
    event APYUpdated(uint256 oldAPY, uint256 newAPY);
    event WhitelistAdded(address indexed account);
    event WhitelistRemoved(address indexed account);

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender], "Address is not whitelisted");
        _;
    }

    constructor(address _stakingToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token address");
        stakingToken = IERC20(_stakingToken);
    }

    function stake(uint256 amount) external nonReentrant onlyWhitelisted {
        require(amount > 0, "Amount must be greater than 0");

        StakeInfo storage userStake = stakes[msg.sender];

        if (userStake.amount > 0) {
            uint256 pendingReward = calculateReward(msg.sender);
            if (pendingReward > 0) {
                if (rewardPool >= pendingReward) {
                    _claimReward(msg.sender, pendingReward);
                } else {
                    uint256 claimable = rewardPool;
                    if (claimable > 0) {
                        rewardPool -= claimable;
                        stakingToken.safeTransfer(msg.sender, claimable);
                        emit RewardClaimed(msg.sender, claimable);
                    }
                    userStake.unclaimedReward = pendingReward - claimable;
                }
            }
            userStake.lastRewardClaimedAt = block.timestamp;
        } else {
            userStake.stakedAt = block.timestamp;
            userStake.lastRewardClaimedAt = block.timestamp;
        }

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        userStake.amount += amount;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient staked amount");
        require(amount > 0, "Amount must be greater than 0");

        uint256 pendingReward = calculateReward(msg.sender);
        if (pendingReward > 0) {
            uint256 claimableReward = pendingReward > rewardPool ? rewardPool : pendingReward;
            uint256 unpaidReward = pendingReward - claimableReward;

            if (claimableReward > 0) {
                rewardPool -= claimableReward;
                stakingToken.safeTransfer(msg.sender, claimableReward);
                emit RewardClaimed(msg.sender, claimableReward);
            }

            userStake.unclaimedReward = unpaidReward;
            userStake.lastRewardClaimedAt = block.timestamp;
        }

        userStake.amount -= amount;
        totalStaked -= amount;

        if (userStake.amount == 0) {
            if (userStake.unclaimedReward == 0) {
                delete stakes[msg.sender];
            }
        } else {
            userStake.lastRewardClaimedAt = block.timestamp;
        }

        stakingToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function claimReward() external nonReentrant {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No reward to claim");
        _claimReward(msg.sender, reward);
    }

    function _claimReward(address user, uint256 reward) internal {
        require(rewardPool >= reward, "Insufficient reward pool");

        StakeInfo storage userStake = stakes[user];
        userStake.lastRewardClaimedAt = block.timestamp;
        userStake.unclaimedReward = 0;

        rewardPool -= reward;
        stakingToken.safeTransfer(user, reward);
        emit RewardClaimed(user, reward);

        if (userStake.amount == 0) {
            delete stakes[user];
        }
    }

    function calculateReward(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) {
            return userStake.unclaimedReward;
        }

        uint256 timeElapsed = block.timestamp - userStake.lastRewardClaimedAt;
        uint256 reward = 0;
        if (timeElapsed > 0) {
            // reward = (amount * apy * timeElapsed) / (100 * SECONDS_PER_YEAR)
            // Using 100 because APY is expressed as percentage (240 = 240%)
            reward = (userStake.amount * apy * timeElapsed) / (100 * SECONDS_PER_YEAR);
        }

        return reward + userStake.unclaimedReward;
    }

    function getStakeInfo(address user) external view returns (StakeInfo memory) {
        return stakes[user];
    }

    function depositRewards(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardsDeposited(msg.sender, amount);
    }

    function withdrawRewards(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= rewardPool, "Amount exceeds reward pool");
        rewardPool -= amount;
        stakingToken.safeTransfer(owner(), amount);
        emit RewardsWithdrawn(owner(), amount);
    }

    function setAPY(uint256 _apy) external onlyOwner {
        require(_apy > 0, "APY must be greater than 0");
        require(_apy <= MAX_APY, "APY exceeds maximum");
        uint256 oldAPY = apy;
        apy = _apy;
        emit APYUpdated(oldAPY, _apy);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = stakingToken.balanceOf(address(this));
        rewardPool = 0;
        totalStaked = 0;
        stakingToken.safeTransfer(owner(), balance);
    }

    function addToWhitelist(address account) external onlyOwner {
        require(account != address(0), "Invalid address");
        require(!whitelist[account], "Address already whitelisted");
        whitelist[account] = true;
        emit WhitelistAdded(account);
    }

    function removeFromWhitelist(address account) external onlyOwner {
        require(whitelist[account], "Address not whitelisted");
        whitelist[account] = false;
        emit WhitelistRemoved(account);
    }

    function batchAddToWhitelist(address[] calldata accounts) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (accounts[i] != address(0) && !whitelist[accounts[i]]) {
                whitelist[accounts[i]] = true;
                emit WhitelistAdded(accounts[i]);
            }
        }
    }

    function batchRemoveFromWhitelist(address[] calldata accounts) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (whitelist[accounts[i]]) {
                whitelist[accounts[i]] = false;
                emit WhitelistRemoved(accounts[i]);
            }
        }
    }
}

