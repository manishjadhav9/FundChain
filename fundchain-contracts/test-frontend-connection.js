// Test script to verify frontend connection works without MetaMask
const { ethers } = require('ethers');

// Simulate the frontend contract interaction
async function testFrontendConnection() {
  console.log('Testing frontend connection without MetaMask...');
  
  try {
    // This simulates what the frontend does
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    
    // Test connection
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ Connected to local network, block number:', blockNumber);
    
    // Use test account (same as frontend will use)
    const testPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const signer = new ethers.Wallet(testPrivateKey, provider);
    
    console.log('✅ Test account address:', await signer.getAddress());
    
    // Test balance
    const balance = await provider.getBalance(await signer.getAddress());
    console.log('✅ Account balance:', ethers.formatEther(balance), 'ETH');
    
    // Test contract connection
    const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const abi = [
      "function getCampaignCount() external view returns (uint256)",
      "function isAdmin(address) external view returns (bool)"
    ];
    
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    const campaignCount = await contract.getCampaignCount();
    console.log('✅ Campaign count:', campaignCount.toString());
    
    const isAdmin = await contract.isAdmin(await signer.getAddress());
    console.log('✅ Is admin:', isAdmin);
    
    console.log('\n🎉 Frontend connection test successful!');
    console.log('The frontend should now work without MetaMask by using the local test account.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendConnection();
