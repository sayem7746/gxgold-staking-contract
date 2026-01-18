const { ethers } = require("hardhat");

async function main() {
  // Get the target address from command line argument or use default
  const targetAddress = process.argv[2] || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  
  // Get the MockXAUT contract address from command line argument or environment
  const mockXAUTAddress = process.argv[3] || process.env.MOCK_XAUT_ADDRESS;
  
  if (!mockXAUTAddress) {
    console.error("❌ Error: MockXAUT contract address not provided!");
    console.log("Usage: npx hardhat run scripts/mintXAUT.js --network <network> [targetAddress] [mockXAUTAddress]");
    console.log("Or set MOCK_XAUT_ADDRESS environment variable");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  console.log("🔐 Using account:", signer.address);
  console.log("🎯 Minting to address:", targetAddress);
  console.log("📦 MockXAUT contract:", mockXAUTAddress);

  // Connect to the deployed MockXAUT contract
  const MockXAUT = await ethers.getContractFactory("MockXAUT");
  const mockXAUT = MockXAUT.attach(mockXAUTAddress);

  // Get amount from command line or use default (1000 tokens)
  const amount = process.argv[4] || "1000";
  const amountWei = ethers.parseEther(amount);

  console.log(`💰 Minting ${amount} XAUT (${amountWei.toString()} wei)...`);

  // Check current balance
  const balanceBefore = await mockXAUT.balanceOf(targetAddress);
  console.log(`📊 Balance before: ${ethers.formatEther(balanceBefore)} XAUT`);

  // Mint tokens
  const tx = await mockXAUT.mint(targetAddress, amountWei);
  console.log("⏳ Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ Transaction confirmed!");

  // Check new balance
  const balanceAfter = await mockXAUT.balanceOf(targetAddress);
  console.log(`📊 Balance after: ${ethers.formatEther(balanceAfter)} XAUT`);
  console.log(`✨ Minted: ${ethers.formatEther(balanceAfter - balanceBefore)} XAUT`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

