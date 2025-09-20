const hre = require("hardhat");

async function main() {
  console.log("Testing getAllCampaigns function...");
  
  // Get the deployed contract address
  const fundFactoryAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  
  // Get contract instance
  const FundFactory = await hre.ethers.getContractFactory("FundFactory");
  const fundFactory = FundFactory.attach(fundFactoryAddress);
  
  try {
    // Get all campaigns (similar to what frontend does)
    const campaignAddresses = await fundFactory.getAllCampaigns();
    console.log(`Found ${campaignAddresses.length} campaigns:`);
    
    const campaigns = [];
    
    for (let i = 0; i < campaignAddresses.length; i++) {
      const address = campaignAddresses[i];
      console.log(`\n--- Processing Campaign ${i + 1}: ${address} ---`);
      
      // Get campaign contract
      const FundCampaign = await hre.ethers.getContractFactory("FundCampaign");
      const campaign = FundCampaign.attach(address);
      
      // Get campaign details (same as frontend)
      const details = await campaign.getCampaignDetails();
      const imageHash = await campaign.imageHash();
      const campaignType = await campaign.campaignType();
      const owner = await campaign.owner();
      
      const campaignData = {
        id: address,
        title: details._title,
        description: details._description,
        targetAmount: hre.ethers.formatEther(details._targetAmount),
        amountRaised: hre.ethers.formatEther(details._amountRaised),
        donorsCount: Number(details._donorsCount),
        status: ['OPEN', 'VERIFIED', 'CLOSED'][details._status],
        createdAt: new Date(Number(details._createdAt) * 1000).toISOString(),
        updatedAt: new Date(Number(details._updatedAt) * 1000).toISOString(),
        imageHash: imageHash,
        type: campaignType,
        owner: owner
      };
      
      campaigns.push(campaignData);
      
      console.log(`Title: ${campaignData.title}`);
      console.log(`Status: ${campaignData.status}`);
      console.log(`Type: ${campaignData.type}`);
      console.log(`Target: ${campaignData.targetAmount} ETH`);
      console.log(`Raised: ${campaignData.amountRaised} ETH`);
      console.log(`Owner: ${campaignData.owner}`);
    }
    
    // Filter verified campaigns (what frontend will show)
    const verifiedCampaigns = campaigns.filter(c => c.status === 'VERIFIED');
    console.log(`\n📊 Summary:`);
    console.log(`Total campaigns: ${campaigns.length}`);
    console.log(`Verified campaigns: ${verifiedCampaigns.length}`);
    console.log(`\n✅ Verified campaigns that will show in frontend:`);
    
    verifiedCampaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.title} (${campaign.type})`);
    });
    
    if (verifiedCampaigns.length > 0) {
      console.log("\n🎉 Success! Campaigns should now be visible in the frontend.");
    } else {
      console.log("\n⚠️ No verified campaigns found. Frontend will show sample data.");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
