#!/usr/bin/env node

// Wrapper script to handle npm argument passing to Hardhat
const { spawn } = require('child_process');
const path = require('path');

// Get all arguments after the script name
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Error: Address is required!');
  console.log('\nUsage: npm run check:balance <ADDRESS>');
  console.log('Example: npm run check:balance 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5');
  process.exit(1);
}

// Set environment variable for the script to read
process.env.CHECK_ADDRESS = args[0];

// Build the hardhat command (without -- separator)
const hardhatArgs = [
  'run',
  'scripts/checkBalance.js',
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

