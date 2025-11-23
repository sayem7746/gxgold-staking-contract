// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract XGoldStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    address public lpRewardAddress;

    uint256 public constant APY = 240; // 240% APY
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant REWARD_PRECISION = 10000; // For precision in calculations

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 lastRewardClaimedAt;
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event LPRewardAddressUpdated(address indexed oldAddress, address indexed newAddress);

    constructor(address _stakingToken, address _lpRewardAddress) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token address");
        require(_lpRewardAddress != address(0), "Invalid LP reward address");
        stakingToken = IERC20(_stakingToken);
        lpRewardAddress = _lpRewardAddress;
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(lpRewardAddress != address(0), "LP reward address not set");

        StakeInfo storage userStake = stakes[msg.sender];

        if (userStake.amount > 0) {
            uint256 pendingReward = calculateReward(msg.sender);
            if (pendingReward > 0) {
                _claimReward(msg.sender, pendingReward);
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
            _claimReward(msg.sender, pendingReward);
        }

        userStake.amount -= amount;
        totalStaked -= amount;

        if (userStake.amount == 0) {
            delete stakes[msg.sender];
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
        require(lpRewardAddress != address(0), "LP reward address not set");
        require(
            stakingToken.balanceOf(lpRewardAddress) >= reward,
            "Insufficient LP balance for rewards"
        );

        StakeInfo storage userStake = stakes[user];
        userStake.lastRewardClaimedAt = block.timestamp;

        stakingToken.safeTransferFrom(lpRewardAddress, user, reward);
        emit RewardClaimed(user, reward);
    }

    function calculateReward(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - userStake.lastRewardClaimedAt;
        if (timeElapsed == 0) {
            return 0;
        }

        uint256 rewardRate = (APY * REWARD_PRECISION) / SECONDS_PER_YEAR;
        uint256 reward = (userStake.amount * rewardRate * timeElapsed) / (REWARD_PRECISION * REWARD_PRECISION);

        return reward;
    }

    function getStakeInfo(address user) external view returns (StakeInfo memory) {
        return stakes[user];
    }

    function setLPRewardAddress(address _lpRewardAddress) external onlyOwner {
        require(_lpRewardAddress != address(0), "Invalid LP reward address");
        address oldAddress = lpRewardAddress;
        lpRewardAddress = _lpRewardAddress;
        emit LPRewardAddressUpdated(oldAddress, _lpRewardAddress);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = stakingToken.balanceOf(address(this));
        stakingToken.safeTransfer(owner(), balance);
    }
}

