# How to Add XAUT Tokens to Your MetaMask Account

There are several ways to get XAUT tokens in your MetaMask account for testing. Choose the method that works best for you.

## Method 1: Using the Frontend UI (Easiest) ⭐

1. **Start Hardhat node** (if not already running):
   ```bash
   npm run node
   ```

2. **Deploy contracts** (if not already deployed):
   ```bash
   npm run quickstart
   ```

3. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Open the app** in your browser: `http://localhost:3000`

5. **Connect your MetaMask wallet** to the app

6. **Make sure you're on Hardhat Local network** (Chain ID: 31337)
   - If not, click "Switch to Hardhat" or "Add Hardhat Network" button

7. **Use the "Mint Test Tokens" component** on the main page
   - Enter the amount you want (e.g., 1000)
   - Click "Mint Tokens"
   - ⚠️ **Note**: This only works if you're using the deployer account (the first account from Hardhat node)

## Method 2: Using Command Line Script (Recommended) 🚀

This method works with any MetaMask account address:

1. **Get your MetaMask address**:
   - Open MetaMask
   - Copy your account address (starts with `0x...`)

2. **Make sure Hardhat node is running**:
   ```bash
   npm run node
   ```

3. **Deploy contracts** (if not already deployed):
   ```bash
   npm run quickstart
   ```

4. **Mint tokens to your address**:
   ```bash
   npm run mint:to <YOUR_METAMASK_ADDRESS> <AMOUNT>
   ```

   **Example**:
   ```bash
   npm run mint:to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5 1000
   ```

   This will mint 1000 XAUT tokens to your address.

5. **Add token to MetaMask**:
   - In the frontend app, click "Add XAUT Token" button
   - Or manually in MetaMask:
     - Click "Import tokens"
     - Click "Custom token"
     - Paste the token contract address (shown in terminal after `npm run quickstart`)
     - Token symbol: `MOCKXAUT`
     - Decimals: `18`
     - Click "Add"

## Method 3: Import Pre-funded Test Account 📝

The `quickstart` script already funds some test accounts. You can import these to MetaMask:

1. **Run quickstart**:
   ```bash
   npm run quickstart
   ```

2. **Check Hardhat node terminal** for private keys:
   - Look for accounts listed when you started `npm run node`
   - Copy a private key (starts with `0x...`)

3. **Import to MetaMask**:
   - Open MetaMask
   - Click account icon → "Import Account"
   - Paste the private key
   - Click "Import"

4. **These accounts already have XAUT tokens**:
   - LP Wallet: 100,000 XAUT
   - User1: 10,000 XAUT
   - User2: 10,000 XAUT (if using setup:local)

## Method 4: Transfer from Another Account 💸

If you have XAUT in another account:

1. **Connect the account with tokens** in MetaMask

2. **Use the frontend app** to transfer:
   - The app shows your balance
   - You can approve and stake, but direct transfer UI isn't included
   - Use MetaMask's "Send" feature:
     - Click "Send" in MetaMask
     - Enter recipient address
     - Select "MOCKXAUT" token
     - Enter amount
     - Confirm transaction

## Troubleshooting 🔧

### "Token contract address not found"
- Make sure you've run `npm run quickstart` first
- Check that `frontend/.env.local` exists and has `NEXT_PUBLIC_TOKEN_CONTRACT`

### "Failed to mint tokens"
- Make sure Hardhat node is running
- Check you're using the correct network (Hardhat Local, Chain ID: 31337)
- The mint function only works from accounts that have minting permission
- Try using Method 2 (command line) instead

### "Tokens not showing in MetaMask"
- Make sure you've added the token to MetaMask (click "Add XAUT Token")
- Verify you're on the correct network (Hardhat Local)
- Check the token contract address matches what's in `.env.local`
- Refresh MetaMask or restart it

### "Wrong network"
- Click "Switch to Hardhat" button in the app
- Or manually add network:
  - Network Name: `Hardhat Local`
  - RPC URL: `http://127.0.0.1:8545`
  - Chain ID: `31337`
  - Currency Symbol: `ETH`

## Quick Reference 📋

**Token Contract Address**: Check `frontend/.env.local` after running `npm run quickstart`

**Token Details**:
- Symbol: `MOCKXAUT`
- Decimals: `18`
- Network: Hardhat Local (Chain ID: 31337)

**Useful Commands**:
```bash
# Start Hardhat node
npm run node

# Deploy contracts and setup
npm run quickstart

# Mint tokens to address
npm run mint:to <ADDRESS> <AMOUNT>

# Example: Mint 5000 XAUT to your address
npm run mint:to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5 5000
```

## Need Help? 💡

- Check that Hardhat node is running
- Verify contracts are deployed (`npm run quickstart`)
- Make sure you're on Hardhat Local network in MetaMask
- Check browser console for errors (F12)
- Check Hardhat node terminal for transaction details

