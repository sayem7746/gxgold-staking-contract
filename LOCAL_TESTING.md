# Local Testing Guide

This guide will help you test the XAUT Staking System on your local machine.

## Prerequisites

1. **MetaMask installed** in your browser
2. **Node.js** installed (20+ recommended, 22+ for Hardhat 3.x)
3. All dependencies installed (`npm install` in root and `frontend` directories)

## Step 1: Start Local Hardhat Node

Open a terminal in the project root and run:

```bash
npm run node
```

This will start a local Hardhat network on `http://127.0.0.1:8545` with 20 test accounts, each with 10,000 ETH.

**Keep this terminal open!** You'll need it running while testing.

## Step 2: Configure MetaMask

1. Open MetaMask and click the network dropdown
2. Click "Add Network" → "Add a network manually"
3. Enter the following details:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH
4. Click "Save"

## Step 3: Import Test Account to MetaMask

The Hardhat node provides test accounts. Import one to MetaMask:

1. In the terminal where Hardhat node is running, you'll see account addresses and private keys
2. Copy a private key (starts with `0x...`)
3. In MetaMask:
   - Click the account icon (top right)
   - Click "Import Account"
   - Paste the private key
   - Click "Import"

**Important**: These accounts have 10,000 ETH for testing. Never use these private keys on mainnet!

## Step 4: Deploy Contracts Locally

Open a **new terminal** (keep the Hardhat node running) and run:

```bash
npm run simulate
```

Or use the deployment script:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This will:
- Deploy MockXAUT token
- Deploy XGoldStaking contract
- Print the contract addresses

**Copy these addresses!** You'll need them for the frontend.

## Step 5: Fund Test Accounts

After deployment, you need to:
1. Transfer MockXAUT tokens to your MetaMask account
2. Set up the LP wallet

You can use the Hardhat console or create a script. Let's create a helper script:

```bash
npx hardhat run scripts/setupLocal.js --network localhost
```

(We'll create this script next)

## Step 6: Configure Frontend

1. Navigate to the `frontend` directory:
```bash
cd frontend
```

2. Create `.env.local` file:
```bash
# Windows PowerShell
New-Item -ItemType File -Path .env.local

# Or manually create .env.local file
```

3. Add your contract addresses to `.env.local`:
```
NEXT_PUBLIC_STAKING_CONTRACT=0x... (from deployment output)
NEXT_PUBLIC_TOKEN_CONTRACT=0x... (from deployment output)
```

4. Start the frontend:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## Step 7: Test the Application

### As a Regular User:

1. **Connect Wallet**: Click "Connect Wallet" and approve in MetaMask
2. **Check Balance**: You should see your MockXAUT balance
3. **Approve**: Enter an amount to stake, click "Approve"
4. **Stake**: After approval, click "Stake"
5. **View Rewards**: Check the dashboard for pending rewards
6. **Claim Rewards**: Click "Claim Rewards" (requires LP setup)
7. **Unstake**: Enter amount and click "Unstake"

### As LP Administrator:

1. **Switch Account**: In MetaMask, switch to the LP wallet account
2. **Approve Contract**: In LP Admin Panel, approve the contract to pay rewards
3. **Fund LP Wallet**: Ensure LP wallet has MockXAUT tokens
4. **Monitor**: View daily profit simulation

## Troubleshooting

### "Contract not found" error
- Make sure contract addresses in `.env.local` are correct
- Ensure Hardhat node is still running
- Check MetaMask is connected to Hardhat Local network

### "Insufficient balance" error
- Run the setup script to fund accounts
- Check you're using the correct account in MetaMask

### "Transaction failed" error
- Check Hardhat node console for error messages
- Ensure you have enough ETH for gas
- Verify contract addresses are correct

### Frontend not connecting
- Check `.env.local` file exists and has correct addresses
- Restart the frontend dev server after changing `.env.local`
- Check browser console for errors

## Quick Test Checklist

- [ ] Hardhat node running on port 8545
- [ ] MetaMask connected to Hardhat Local network
- [ ] Test account imported with ETH balance
- [ ] Contracts deployed and addresses copied
- [ ] `.env.local` configured with contract addresses
- [ ] Frontend running on localhost:3000
- [ ] Can connect wallet
- [ ] Can see token balance
- [ ] Can approve tokens
- [ ] Can stake tokens
- [ ] Can see pending rewards
- [ ] LP wallet set up and approved
- [ ] Can claim rewards
- [ ] Can unstake tokens

## Advanced: Using Hardhat Console

You can interact with contracts directly:

```bash
npx hardhat console --network localhost
```

Then in the console:
```javascript
const MockXAUT = await ethers.getContractFactory("MockXAUT");
const mockXAUT = await MockXAUT.attach("0x..."); // Your deployed address

const [owner, user] = await ethers.getSigners();
await mockXAUT.transfer(user.address, ethers.parseEther("1000"));
```

## Reset Everything

To start fresh:
1. Stop Hardhat node (Ctrl+C)
2. Restart Hardhat node (`npm run node`)
3. Redeploy contracts
4. Update `.env.local` with new addresses
5. Refresh frontend

Happy testing! 🚀

