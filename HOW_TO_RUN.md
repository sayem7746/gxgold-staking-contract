# How to Run This Smart Contract Project

This guide will walk you through running the XAUT Staking System project from scratch.

## Prerequisites Check

- ✅ Node.js installed (you have v18.19.0)
- ⚠️ **Note**: Hardhat 3.x requires Node.js 22+. If you encounter issues, consider upgrading to Node.js 22+ or downgrading Hardhat to 2.x
- MetaMask browser extension (for frontend testing)

## Step 1: Install Dependencies

### Install Root Dependencies (Smart Contracts)

```bash
cd /Users/samoldair/Desktop/Sayem/gxgold/smart-contract
npm install
```

This installs:
- Hardhat
- OpenZeppelin contracts
- Testing tools

### Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## Step 2: Compile Smart Contracts

```bash
npm run compile
```

This compiles the Solidity contracts in the `contracts/` directory.

## Step 3: Run Tests (Optional but Recommended)

```bash
npm run test
```

This runs the test suite to verify everything works correctly.

## Step 4: Start Local Blockchain (Terminal 1)

Open a terminal and run:

```bash
npm run node
```

**Keep this terminal open!** This starts a local Hardhat blockchain on `http://127.0.0.1:8545`.

You'll see:
- Account addresses with private keys
- Network information
- Chain ID: 31337

**Important**: Copy the private keys shown - you'll need them for MetaMask!

## Step 5: Deploy Contracts & Setup (Terminal 2)

Open a **new terminal** and run:

```bash
npm run quickstart
```

This script will:
- ✅ Deploy MockXAUT token contract
- ✅ Deploy XGoldStaking contract
- ✅ Fund test accounts with tokens
- ✅ Approve contracts for staking
- ✅ Create `frontend/.env.local` with contract addresses

**Copy the contract addresses** from the output!

## Step 6: Configure MetaMask

### Add Hardhat Network

1. Open MetaMask
2. Click network dropdown → "Add Network" → "Add a network manually"
3. Enter:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: ETH
4. Click "Save"

### Import Test Accounts

1. In Terminal 1 (Hardhat node), find private keys (they start with `0x...`)
2. In MetaMask:
   - Click account icon (top right)
   - Click "Import Account"
   - Paste a private key
   - Click "Import"
3. Repeat for a second account (you'll need both LP wallet and user account)

**Note**: These accounts have 10,000 ETH for testing. Never use these keys on mainnet!

## Step 7: Start Frontend (Terminal 3)

Open a **new terminal** and run:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

## Step 8: Test the Application

1. **Open Browser**: Go to `http://localhost:3000`

2. **Connect Wallet**: 
   - Click "Connect Wallet" button
   - Approve connection in MetaMask
   - Make sure MetaMask is on "Hardhat Local" network

3. **As LP Administrator** (switch to LP account in MetaMask):
   - Go to LP Admin Panel
   - Approve the staking contract to pay rewards
   - View LP balance and daily profit simulation

4. **As Regular User** (switch to user account in MetaMask):
   - Check your XAUT token balance
   - Enter amount to stake
   - Click "Approve" (if needed)
   - Click "Stake"
   - View rewards on dashboard
   - Claim rewards
   - Unstake tokens

## Available Scripts

### Root Directory Scripts

- `npm run compile` - Compile smart contracts
- `npm run test` - Run tests
- `npm run node` - Start local Hardhat node
- `npm run quickstart` - Deploy and setup everything
- `npm run simulate` - Run simulation script
- `npm run deploy:local` - Deploy contracts only
- `npm run setup:local` - Setup local environment

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

## Troubleshooting

### "Cannot find module" errors
- Run `npm install` in both root and frontend directories

### "Contract not found" in frontend
- Check `frontend/.env.local` exists and has correct addresses
- Restart frontend dev server after creating `.env.local`
- Verify Hardhat node is still running

### "Transaction failed"
- Check Hardhat node is running (Terminal 1)
- Verify MetaMask is on "Hardhat Local" network
- Check Hardhat node terminal for error messages
- Ensure you have enough ETH for gas

### "Insufficient balance"
- Run `npm run quickstart` again to fund accounts
- Check you're using the correct account in MetaMask

### Node.js version issues
- If you get errors about Node.js version, upgrade to Node.js 22+:
  ```bash
  # Using nvm (recommended)
  nvm install 22
  nvm use 22
  ```

### Frontend won't connect
- Check browser console (F12) for errors
- Ensure MetaMask is installed and unlocked
- Try refreshing the page
- Verify `.env.local` has correct contract addresses

## Project Structure

```
smart-contract/
├── contracts/          # Solidity smart contracts
│   ├── MockXAUT.sol    # Mock ERC20 token
│   └── XGoldStaking.sol # Main staking contract
├── test/               # Hardhat tests
├── scripts/            # Deployment scripts
│   ├── deploy.js       # Deploy contracts
│   ├── quickStart.js   # Full setup script
│   └── setupLocal.js   # Local setup
├── frontend/           # Next.js frontend
│   └── app/            # React components
└── hardhat.config.js   # Hardhat configuration
```

## Quick Reference

**Three Terminal Setup:**
1. Terminal 1: `npm run node` (keep running)
2. Terminal 2: `npm run quickstart` (run once)
3. Terminal 3: `cd frontend && npm run dev` (keep running)

**Reset Everything:**
1. Stop Hardhat node (Ctrl+C in Terminal 1)
2. Restart: `npm run node`
3. Redeploy: `npm run quickstart`
4. Refresh frontend

## Next Steps

- Read [QUICK_START.md](./QUICK_START.md) for more details
- Read [LOCAL_TESTING.md](./LOCAL_TESTING.md) for advanced testing
- Check [README.md](./README.md) for project overview

Happy coding! 🚀

