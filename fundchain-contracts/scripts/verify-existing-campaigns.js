const hre = require("hardhat");

async function main() {
  console.log("Checking and verifying existing campaigns...");
  
  // Get the deployed contract address
  const fundFactoryAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  
  // Get contract instance
  const FundFactory = await hre.ethers.getContractFactory("FundFactory");
  const fundFactory = FundFactory.attach(fundFactoryAddress);
  
  // Get signer (admin)
  const [admin] = await hre.ethers.getSigners();
  console.log("Admin address:", admin.address);
  
  try {
    // Get all campaigns
    const campaignAddresses = await fundFactory.getAllCampaigns();
    console.log(`Found ${campaignAddresses.length} campaigns:`);
    
    for (let i = 0; i < campaignAddresses.length; i++) {
      const campaignAddress = campaignAddresses[i];
      console.log(`\n--- Campaign ${i + 1}: ${campaignAddress} ---`);
      
      // Get campaign contract
      const FundCampaign = await hre.ethers.getContractFactory("FundCampaign");
      const campaign = FundCampaign.attach(campaignAddress);
      
      // Get campaign details
      const details = await campaign.getCampaignDetails();
      const title = details._title;
      const status = details._status; // 0=OPEN, 1=VERIFIED, 2=CLOSED
      const statusNames = ['OPEN', 'VERIFIED', 'CLOSED'];
      
      console.log(`Title: ${title}`);
      console.log(`Status: ${statusNames[status]} (${status})`);
      console.log(`Target: ${hre.ethers.formatEther(details._targetAmount)} ETH`);
      console.log(`Raised: ${hre.ethers.formatEther(details._amountRaised)} ETH`);
      
      // If campaign is not verified, verify it
      if (Number(status) === 0) { // OPEN
        console.log("🔄 Verifying campaign...");
        try {
          const verifyTx = await fundFactory.verifyCampaign(campaignAddress);
          const receipt = await verifyTx.wait();
          console.log("✅ Campaign verified successfully! Tx:", receipt.hash);
          
          // Check status again to confirm
          const newDetails = await campaign.getCampaignDetails();
          const newStatus = newDetails._status;
          console.log(`Status updated to: ${statusNames[newStatus]} (${newStatus})`);
        } catch (verifyError) {
          console.error("❌ Failed to verify campaign:", verifyError.message);
          if (verifyError.reason) {
            console.error("Reason:", verifyError.reason);
          }
        }
      } else if (status === 1) { // VERIFIED
        console.log("✅ Campaign already verified");
      } else if (status === 2) { // CLOSED
        console.log("🔒 Campaign is closed");
      }
    }
    
    console.log("\n🎉 Campaign verification check complete!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
