const hre = require("hardhat");

async function main() {
  console.log("Testing campaign creation...");
  
  // Get the deployed contract address
  const fundFactoryAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  
  // Get contract instance
  const FundFactory = await hre.ethers.getContractFactory("FundFactory");
  const fundFactory = FundFactory.attach(fundFactoryAddress);
  
  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Using signer:", signer.address);
  
  // Test campaign data (similar to what frontend would send)
  const title = "Test Campaign from Script";
  const description = "This is a test campaign created from script";
  const targetAmount = hre.ethers.parseEther("1"); // 1 ETH
  const campaignType = "RELIGIOUS";
  const imageHash = "QmPcWh7u1MTzPJQJGwtpcNQesLBdonoVUvMYkn1tKrZvxr";
  const documentHashes = ["QmRbyJ6Srs1k7dPopd63gN8n3KRBh8JSdif6KyadKcSUSU"];
  const milestoneTitles = ["Initial Funding"];
  const milestoneDescriptions = ["First milestone for campaign setup"];
  const milestoneAmounts = [hre.ethers.parseEther("1")];
  
  try {
    console.log("Creating campaign with parameters:");
    console.log("- Title:", title);
    console.log("- Target Amount:", hre.ethers.formatEther(targetAmount), "ETH");
    console.log("- Campaign Type:", campaignType);
    
    // Estimate gas first
    const gasEstimate = await fundFactory.createCampaign.estimateGas(
      title,
      description,
      targetAmount,
      campaignType,
      imageHash,
      documentHashes,
      milestoneTitles,
      milestoneDescriptions,
      milestoneAmounts
    );
    
    console.log("Estimated gas:", gasEstimate.toString());
    
    // Create the campaign
    const tx = await fundFactory.createCampaign(
      title,
      description,
      targetAmount,
      campaignType,
      imageHash,
      documentHashes,
      milestoneTitles,
      milestoneDescriptions,
      milestoneAmounts,
      {
        gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
      }
    );
    
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    // Parse the event to get campaign address
    const event = receipt.logs
      .map(log => {
        try {
          return fundFactory.interface.parseLog({
            topics: [...log.topics],
            data: log.data
          });
        } catch (e) {
          return null;
        }
      })
      .find(event => event && event.name === 'CampaignCreated');
    
    if (event) {
      const campaignAddress = event.args[0];
      console.log("✅ Campaign created successfully!");
      console.log("Campaign address:", campaignAddress);
      console.log("Owner:", event.args[1]);
      console.log("Title:", event.args[2]);
      console.log("Target Amount:", hre.ethers.formatEther(event.args[3]), "ETH");
    } else {
      console.log("❌ Campaign creation event not found");
    }
    
  } catch (error) {
    console.error("❌ Error creating campaign:", error);
    
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
