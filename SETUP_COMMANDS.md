# 🚀 Quick Setup Commands

Share these commands with your colleagues to get the project running quickly!

## One-Line Install Command

Copy and paste this single command to install all dependencies:

```bash
npm install && cd frontend && npm install && cd .. && echo "✅ All dependencies installed!"
```

## Or Use the Setup Script

```bash
chmod +x setup.sh && ./setup.sh
```

## Complete Setup & Run Commands

### Step 1: Install All Dependencies

```bash
# Install root dependencies (Hardhat, smart contracts)
npm install

# Install frontend dependencies (Next.js, React)
cd frontend && npm install && cd ..
```

### Step 2: Run the Application (3 Terminals Required)

**Terminal 1 - Start Hardhat Local Blockchain:**
```bash
npm run node
```
*Keep this running!* You'll see account addresses and private keys for MetaMask.

**Terminal 2 - Deploy Contracts & Setup:**
```bash
npm run quickstart
```
*Run this once.* It deploys contracts, funds accounts, and creates frontend config.

**Terminal 3 - Start Frontend:**
```bash
cd frontend && npm run dev
```
*Keep this running!* Frontend will be at http://localhost:3000

## Quick Reference

| Task | Command |
|------|---------|
| Install all dependencies | `npm install && cd frontend && npm install && cd ..` |
| Start Hardhat node | `npm run node` |
| Deploy & setup | `npm run quickstart` |
| Start frontend | `cd frontend && npm run dev` |
| Compile contracts | `npm run compile` |
| Run tests | `npm run test` |

## Prerequisites

- Node.js 20+ (22+ recommended)
- npm or yarn
- MetaMask browser extension (for frontend testing)

## Troubleshooting

**If installation fails:**
- Make sure Node.js is installed: `node --version`
- Try clearing npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

**If frontend won't start:**
- Make sure you ran `npm install` in the `frontend/` folder
- Check that port 3000 is not in use

**If contracts won't deploy:**
- Make sure Hardhat node is running (Terminal 1)
- Check that you're on the correct network (localhost)

## Need Help?

- See [HOW_TO_RUN.md](./HOW_TO_RUN.md) for detailed instructions
- See [QUICK_START.md](./QUICK_START.md) for step-by-step guide
- See [README.md](./README.md) for project overview
