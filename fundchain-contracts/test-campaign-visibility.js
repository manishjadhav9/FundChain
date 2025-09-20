// Test script to verify campaign visibility in frontend
const { ethers } = require('ethers');

async function testCampaignVisibility() {
  console.log('🔍 Testing campaign visibility for frontend...\n');
  
  try {
    // Simulate frontend getAllCampaigns function
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    
    const abi = [
      "function getAllCampaigns() external view returns (address[] memory)"
    ];
    
    const campaignAbi = [
      "function getCampaignDetails() external view returns (string memory _title, string memory _description, uint256 _targetAmount, uint256 _amountRaised, uint256 _donorsCount, uint8 _status, uint256 _createdAt, uint256 _updatedAt)",
      "function imageHash() external view returns (string memory)",
      "function campaignType() external view returns (string memory)",
      "function owner() external view returns (address)"
    ];
    
    const factory = new ethers.Contract(contractAddress, abi, provider);
    
    // Get all campaigns
    const campaignAddresses = await factory.getAllCampaigns();
    console.log(`📊 Found ${campaignAddresses.length} campaigns on blockchain`);
    
    const campaigns = [];
    
    for (let i = 0; i < campaignAddresses.length; i++) {
      const address = campaignAddresses[i];
      console.log(`\n--- Processing Campaign ${i + 1}: ${address} ---`);
      
      const campaign = new ethers.Contract(address, campaignAbi, provider);
      const details = await campaign.getCampaignDetails();
      
      const targetAmountEth = ethers.formatEther(details._targetAmount);
      const amountRaisedEth = ethers.formatEther(details._amountRaised);
      const percentRaised = details._targetAmount > 0 
        ? Math.round((Number(details._amountRaised) * 100) / Number(details._targetAmount))
        : 0;
      
      const campaignData = {
        id: address,
        title: details._title,
        description: details._description,
        targetAmount: targetAmountEth,
        amountRaised: amountRaisedEth,
        donorsCount: Number(details._donorsCount),
        donorCount: Number(details._donorsCount),
        percentRaised: percentRaised,
        status: ['OPEN', 'VERIFIED', 'CLOSED'][details._status],
        createdAt: new Date(Number(details._createdAt) * 1000).toISOString(),
        updatedAt: new Date(Number(details._updatedAt) * 1000).toISOString(),
        imageHash: await campaign.imageHash(),
        type: await campaign.campaignType(),
        owner: await campaign.owner(),
        targetAmountInr: Math.round(parseFloat(targetAmountEth) * 275000).toString(),
        contractAddress: address
      };
      
      campaigns.push(campaignData);
      
      console.log(`✅ Title: ${campaignData.title}`);
      console.log(`   Status: ${campaignData.status}`);
      console.log(`   Type: ${campaignData.type}`);
      console.log(`   Target: ${campaignData.targetAmount} ETH (₹${campaignData.targetAmountInr})`);
      console.log(`   Progress: ${campaignData.percentRaised}%`);
    }
    
    // Filter for verified campaigns (what frontend shows)
    const verifiedCampaigns = campaigns.filter(c => c.status === 'VERIFIED');
    
    console.log(`\n📈 Frontend Display Summary:`);
    console.log(`Total campaigns: ${campaigns.length}`);
    console.log(`Verified campaigns (visible): ${verifiedCampaigns.length}`);
    
    if (verifiedCampaigns.length > 0) {
      console.log(`\n🎯 Campaigns that will appear in /campaigns page:`);
      verifiedCampaigns.forEach((campaign, index) => {
        console.log(`${index + 1}. "${campaign.title}" (${campaign.type})`);
        console.log(`   Target: ${campaign.targetAmount} ETH | Progress: ${campaign.percentRaised}%`);
        console.log(`   Contract: ${campaign.contractAddress}`);
      });
      
      console.log(`\n✅ SUCCESS! ${verifiedCampaigns.length} campaigns are ready to display in the frontend.`);
      console.log(`🌐 Visit the /campaigns page to see them.`);
    } else {
      console.log(`\n❌ No verified campaigns found. Frontend will show empty state.`);
    }
    
  } catch (error) {
    console.error('❌ Error testing campaign visibility:', error.message);
  }
}

testCampaignVisibility();
