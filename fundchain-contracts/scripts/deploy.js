// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // Deploy FundFactory contract
  const FundFactory = await hre.ethers.getContractFactory("FundFactory");
  const fundFactory = await FundFactory.deploy();

  await fundFactory.waitForDeployment();

  const fundFactoryAddress = await fundFactory.getAddress();
  console.log(`FundFactory deployed to: ${fundFactoryAddress}`);

  // For testing purposes, let's create a sample campaign
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  // Sample campaign data
  const title = "Test Medical Campaign";
  const description = "This is a test campaign for medical emergencies";
  const targetAmount = hre.ethers.parseEther("1"); // 1 ETH
  const campaignType = "MEDICAL";
  const imageHash = "QmSampleImageHash";
  const documentHashes = ["QmSampleDocHash1", "QmSampleDocHash2"];
  const milestoneTitles = ["Initial Tests", "Treatment Phase 1"];
  const milestoneDescriptions = [
    "Initial diagnosis and tests",
    "First phase of treatment"
  ];
  const milestoneAmounts = [
    hre.ethers.parseEther("0.4"),
    hre.ethers.parseEther("0.6")
  ];

  console.log("Creating test campaign...");
  const tx = await fundFactory.createCampaign(
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

  const receipt = await tx.wait();
  
  // Find the campaign address from the event logs
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
    const campaignAddress = event.args[0]; // First arg is the campaign address
    console.log(`Test campaign created at address: ${campaignAddress}`);
    
    // Verify the campaign
    console.log("Verifying test campaign...");
    const verifyTx = await fundFactory.verifyCampaign(campaignAddress);
    await verifyTx.wait();
    console.log("Test campaign verified!");
  } else {
    console.log("Campaign creation event not found in logs");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 