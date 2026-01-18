# Troubleshooting: XAUT Tokens Not Showing in MetaMask

## Quick Checklist ✅

- [ ] Hardhat node is running (`npm run node`)
- [ ] Contracts are deployed (`npm run quickstart`)
- [ ] Tokens were minted to your address (`npm run mint:to <ADDRESS> <AMOUNT>`)
- [ ] You're on Hardhat Local network in MetaMask (Chain ID: 31337)
- [ ] Token is added to MetaMask (see below)

## Step-by-Step Fix

### 1. Check Your Balance

First, verify tokens were actually minted:

```bash
npm run check:balance <YOUR_METAMASK_ADDRESS>
```

**Example:**
```bash
npm run check:balance 0x17bf05db0B75017620d4EeBB16fFcAE1B48930FB
```

If balance is 0, mint tokens first:
```bash
npm run mint:to 0x17bf05db0B75017620d4EeBB16fFcAE1B48930FB 1000
```

### 2. Verify Network

**Check you're on Hardhat Local:**
- Open MetaMask
- Click network dropdown (top center)
- Should show "Hardhat Local" or "Localhost 8545"
- Chain ID should be 31337

**If not on Hardhat Local:**
- Use the frontend app: Click "Add Hardhat Network" or "Switch to Hardhat"
- Or manually add:
  - Network Name: `Hardhat Local`
  - RPC URL: `http://127.0.0.1:8545`
  - Chain ID: `31337`
  - Currency Symbol: `ETH`

### 3. Add Token to MetaMask

**Method 1: Using Frontend App (Easiest)**
1. Open `http://localhost:3000`
2. Connect wallet
3. Click "Add XAUT Token" button
4. Approve in MetaMask popup

**Method 2: Manual Import**
1. Open MetaMask
2. Scroll down → Click "Import tokens"
3. Click "Custom token"
4. Get token address:
   ```bash
   cat frontend/.env.local | grep TOKEN_CONTRACT
   ```
5. Enter:
   - **Token Contract Address**: (from step 4)
   - **Token Symbol**: `MOCKXAUT`
   - **Decimals**: `18`
6. Click "Add Custom Token"

### 4. Get Token Contract Address

If you need the token contract address:

```bash
# Check .env.local file
cat frontend/.env.local

# Or check quickstart output
npm run quickstart
# Look for "Token Contract:" in the output
```

### 5. Refresh MetaMask

After adding token:
- Refresh MetaMask (close and reopen)
- Or switch networks and switch back
- Tokens should appear under "Tokens" tab

## Common Issues

### "Token not found"
- ✅ Make sure Hardhat node is running
- ✅ Verify token contract address is correct
- ✅ Check you're on Hardhat Local network

### "Balance is 0"
- ✅ Run `npm run mint:to <ADDRESS> <AMOUNT>` to mint tokens
- ✅ Verify mint transaction succeeded
- ✅ Check balance with `npm run check:balance <ADDRESS>`

### "Wrong network"
- ✅ Switch to Hardhat Local (Chain ID: 31337)
- ✅ Use frontend app's network switching buttons
- ✅ Verify RPC URL is `http://127.0.0.1:8545`

### "Can't connect to Hardhat"
- ✅ Make sure `npm run node` is running in a terminal
- ✅ Check RPC URL is correct: `http://127.0.0.1:8545`
- ✅ Try restarting Hardhat node

## Still Not Working?

1. **Check Hardhat node is running:**
   ```bash
   # Should see account addresses and private keys
   npm run node
   ```

2. **Redeploy contracts:**
   ```bash
   npm run quickstart
   ```

3. **Check browser console:**
   - Open browser DevTools (F12)
   - Look for errors in Console tab

4. **Verify token contract:**
   ```bash
   npm run check:balance <YOUR_ADDRESS>
   ```

5. **Try importing a test account:**
   - Use one of the accounts from Hardhat node output
   - These accounts are pre-funded with tokens

## Quick Commands Reference

```bash
# Start Hardhat node
npm run node

# Deploy contracts
npm run quickstart

# Mint tokens
npm run mint:to <ADDRESS> <AMOUNT>

# Check balance
npm run check:balance <ADDRESS>

# Example: Mint 1000 XAUT
npm run mint:to 0x17bf05db0B75017620d4EeBB16fFcAE1B48930FB 1000
```

