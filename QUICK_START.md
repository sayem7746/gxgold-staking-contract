# Quick Start Guide - Local Testing

Follow these steps to test the XAUT Staking System on your local machine.

## 🚀 Step-by-Step Instructions

### Step 1: Start Hardhat Local Node

Open **Terminal 1** and run:
```bash
npm run node
```

**Keep this terminal open!** You'll see account addresses and private keys. Copy these for MetaMask.

### Step 2: Deploy Contracts & Setup

Open **Terminal 2** (new terminal) and run:
```bash
npm run quickstart
```

This will:
- ✅ Deploy contracts
- ✅ Fund test accounts
- ✅ Approve contracts
- ✅ Create frontend `.env.local` file

**Copy the contract addresses** shown in the output!

### Step 3: Configure MetaMask

1. **Add Network:**
   - Open MetaMask
   - Click network dropdown → "Add Network" → "Add a network manually"
   - Enter:
     - **Network Name**: Hardhat Local
     - **RPC URL**: `http://127.0.0.1:8545`
     - **Chain ID**: `31337`
     - **Currency Symbol**: ETH
   - Click "Save"

2. **Import Test Account:**
   - In Terminal 1 (Hardhat node), find a private key (starts with `0x...`)
   - In MetaMask: Account icon → "Import Account" → Paste private key → Import
   - Repeat for LP wallet account (use a different private key)

### Step 4: Start Frontend

Open **Terminal 3** (new terminal) and run:
```bash
cd frontend
npm run dev
```

Open http://localhost:3000 in your browser.

### Step 5: Test the Application

1. **Connect Wallet** in the browser
2. **Switch to LP Account** in MetaMask:
   - Approve contract in LP Admin Panel
3. **Switch to User Account** in MetaMask:
   - Check token balance
   - Stake some tokens
   - View rewards on dashboard
   - Claim rewards
   - Unstake tokens

## 📋 What You Should See

### After `npm run quickstart`:
```
✅ Setup Complete!
📋 Contract Addresses:
  Staking Contract: 0x...
  Token Contract: 0x...
📋 Account Addresses:
  LP Wallet: 0x...
  User1: 0x...
```

### In MetaMask:
- Network: Hardhat Local
- Account balance: 10,000 ETH
- After importing: XAUT token balance visible

### In Browser (localhost:3000):
- "Connect Wallet" button
- After connecting: Token balance, staking panel, dashboard

## 🔧 Troubleshooting

**Problem**: "Contract not found"
- ✅ Check `.env.local` exists in `frontend/` folder
- ✅ Verify contract addresses match deployment output
- ✅ Restart frontend dev server

**Problem**: "Insufficient balance"
- ✅ Run `npm run quickstart` again to fund accounts
- ✅ Check you're using the correct account in MetaMask

**Problem**: "Transaction failed"
- ✅ Check Hardhat node is still running
- ✅ Verify MetaMask is on Hardhat Local network
- ✅ Check Hardhat node terminal for error messages

**Problem**: Frontend shows "Connect Wallet" but nothing happens
- ✅ Check browser console for errors
- ✅ Ensure MetaMask is installed and unlocked
- ✅ Try refreshing the page

## 🎯 Testing Checklist

- [ ] Hardhat node running
- [ ] Contracts deployed
- [ ] MetaMask configured with Hardhat Local network
- [ ] Test accounts imported to MetaMask
- [ ] Frontend running on localhost:3000
- [ ] Can connect wallet
- [ ] Can see token balance
- [ ] LP wallet can approve contract
- [ ] Can stake tokens
- [ ] Can see pending rewards
- [ ] Can claim rewards
- [ ] Can unstake tokens

## 💡 Pro Tips

1. **Use Multiple Accounts**: Import both LP wallet and user accounts to MetaMask for easy switching
2. **Check Console**: Browser console (F12) shows helpful error messages
3. **Hardhat Node Logs**: Check Terminal 1 for transaction details
4. **Reset**: Stop Hardhat node, restart it, and run `quickstart` again to reset everything

## 📚 More Details

For detailed information, see [LOCAL_TESTING.md](./LOCAL_TESTING.md)

Happy Testing! 🎉

