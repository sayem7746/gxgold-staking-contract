# XAUT Staking System

A smart contract-based staking platform for XAUT (Tether Gold) with 240% APY, featuring reward distribution from a Liquidity Provider (LP) address and a Web2 simulation dashboard.

## Features

- **240% APY Staking**: Stake XAUT tokens and earn 240% annual percentage yield (20% monthly)
- **LP Reward Distribution**: Rewards are distributed from a designated LP wallet address
- **Real-time Dashboard**: View staked amounts, pending rewards, and projected earnings
- **LP Admin Panel**: Manage LP allowance and view daily profit simulation
- **Web3 Integration**: Connect with MetaMask and interact with smart contracts

## Project Structure

```
gxgold/
├── contracts/          # Solidity smart contracts
│   ├── MockXAUT.sol    # Mock ERC20 token for testing
│   └── XGoldStaking.sol # Main staking contract
├── test/               # Hardhat tests
│   └── XGoldStaking.test.js
├── scripts/            # Deployment and simulation scripts
│   └── simulate.js
├── frontend/           # Next.js frontend application
│   └── app/
│       ├── components/ # React components
│       ├── contexts/   # Web3 context provider
│       └── hooks/      # Custom React hooks
└── hardhat.config.js   # Hardhat configuration
```

## Smart Contracts

### MockXAUT
A mintable ERC20 token used for development and testing. In production, replace this with the actual XAUT token address.

### XGoldStaking
The main staking contract with the following features:
- 240% APY (calculated per second)
- User staking and unstaking
- Reward calculation and claiming
- LP-based reward distribution
- Admin functions for LP address management

## Getting Started

### Prerequisites

- Node.js 22+ (recommended) or Node.js 20+ (with Hardhat 2.x)
- npm or yarn
- MetaMask browser extension

**Note**: Hardhat 3.x requires Node.js 22+ and ESM modules. If you're using Node.js 20, consider using Hardhat 2.x or upgrade Node.js.

### Quick Local Testing

**Want to test locally?** See [QUICK_START.md](./QUICK_START.md) for a step-by-step guide!

Quick commands:
```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy and setup
npm run quickstart

# Terminal 3: Start frontend
cd frontend && npm run dev
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gxgold
```

2. Install dependencies:
```bash
npm install
cd frontend
npm install
cd ..
```

### Smart Contract Development

1. Compile contracts:
```bash
npm run compile
```

2. Run tests:
```bash
npm run test
```

3. Start local Hardhat node:
```bash
npm run node
```

4. Deploy contracts (in a new terminal):
```bash
npm run simulate
```

### Frontend Development

1. Set up environment variables:
```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` and add your deployed contract addresses:
```
NEXT_PUBLIC_STAKING_CONTRACT=0x...
NEXT_PUBLIC_TOKEN_CONTRACT=0x...
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### For Users

1. Connect your MetaMask wallet
2. Ensure you have XAUT tokens in your wallet
3. Enter the amount you want to stake
4. Approve the staking contract to spend your tokens
5. Click "Stake" to deposit your tokens
6. View your rewards in real-time on the dashboard
7. Claim rewards or unstake at any time

### For LP Administrators

1. Connect with the LP wallet address
2. View LP balance and allowance
3. Approve the staking contract to pay rewards
4. Monitor daily profit simulation
5. Ensure sufficient balance for reward distribution

## Reward Calculation

- **APY**: 240% annually
- **Monthly Rate**: 20% per month
- **Daily Rate**: ~0.67% per day
- Rewards are calculated per second based on staked amount
- Rewards are distributed from the LP address when claimed

## Security Considerations

- The staking contract uses OpenZeppelin's ReentrancyGuard for protection
- LP address must approve the contract before rewards can be distributed
- Admin functions are protected with Ownable pattern
- Emergency withdraw function available for contract owner

## Testing

Run the comprehensive test suite:
```bash
npm run test
```

The tests cover:
- Contract deployment
- Staking and unstaking
- Reward calculations (240% APY verification)
- Reward claiming from LP address
- Admin functions
- Edge cases

## Deployment

### Smart Contracts

1. Update `hardhat.config.js` with your network configuration
2. Deploy contracts:
```bash
npx hardhat run scripts/deploy.js --network <network>
```

### Frontend

1. Update environment variables with deployed contract addresses
2. Build the application:
```bash
cd frontend
npm run build
```

3. Deploy to your hosting provider (Vercel, Netlify, etc.)

## License

ISC

## Notes

- This is a development/testing version. For production, replace MockXAUT with the actual XAUT token contract address.
- Ensure the LP wallet has sufficient balance to cover all reward distributions.
- The 240% APY is fixed in the contract. Modify the `APY` constant if needed.

