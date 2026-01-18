#!/usr/bin/env node

// Wrapper script to handle npm argument passing to Hardhat
const { spawn } = require('child_process');
const path = require('path');

// Get all arguments after the script name
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Error: Target address is required!');
  console.log('\nUsage: npm run mint:to <ADDRESS> [amount]');
  console.log('Example: npm run mint:to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5 1000');
  process.exit(1);
}

// Set environment variables for the script to read
process.env.MINT_TARGET_ADDRESS = args[0];
process.env.MINT_AMOUNT = args[1] || '1000';
if (args[2]) {
  process.env.MINT_TOKEN_ADDRESS = args[2];
}

// Build the hardhat command (without -- separator)
const hardhatArgs = [
  'run',
  'scripts/mintToAddress.js',
  '--network',
  'localhost'
];

// Spawn hardhat process
const hardhat = spawn('npx', ['hardhat', ...hardhatArgs], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..'),
  env: { ...process.env }
});

hardhat.on('close', (code) => {
  process.exit(code || 0);
});

