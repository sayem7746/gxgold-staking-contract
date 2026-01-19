#!/bin/bash

# XAUT Staking System - Setup Script
# This script installs all dependencies for the project

set -e  # Exit on error

echo "🚀 Setting up XAUT Staking System..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install root dependencies (Smart Contracts)
echo "📦 Installing root dependencies (Hardhat, contracts, etc.)..."
npm install

echo ""
echo "📦 Installing frontend dependencies (Next.js, React, etc.)..."
cd frontend
npm install
cd ..

echo ""
echo "✅ All dependencies installed successfully!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Start Hardhat local node (Terminal 1):"
echo "   npm run node"
echo ""
echo "2. Deploy contracts & setup (Terminal 2):"
echo "   npm run quickstart"
echo ""
echo "3. Start frontend dev server (Terminal 3):"
echo "   cd frontend && npm run dev"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo ""
echo "For detailed instructions, see HOW_TO_RUN.md or QUICK_START.md"
