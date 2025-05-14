const hre = require("hardhat");

async function main() {
  console.log("Interacting with deployed FundFactory contract...");
  
  // Get signers
  const [deployer, donor] = await hre.ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Donor address: ${donor.address}`);
  
  // Load the deployed FundFactory contract
  const fundFactoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const fundFactory = await hre.ethers.getContractAt("FundFactory", fundFactoryAddress);
  console.log(`Connected to FundFactory at: ${fundFactoryAddress}`);
  
  // Check admin
  const admin = await fundFactory.admin();
  console.log(`FundFactory admin: ${admin}`);
  
  // Create a new campaign
  console.log("\nCreating a new campaign...");
  
  const title = "Test Campaign";
  const description = "This is a test campaign created through the interact script";
  const targetAmount = hre.ethers.parseEther("0.5"); // 0.5 ETH
  const campaignType = "TEST";
  const imageHash = "QmTestImageHash";
  const documentHashes = ["QmTestDoc1", "QmTestDoc2"];
  const milestoneTitles = ["Milestone 1", "Milestone 2"];
  const milestoneDescriptions = ["First milestone", "Second milestone"];
  const milestoneAmounts = [
    hre.ethers.parseEther("0.2"),
    hre.ethers.parseEther("0.3")
  ];
  
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

  if (!event) {
    throw new Error("Campaign creation event not found in logs");
  }
  
  const campaignAddress = event.args[0];
  console.log(`New campaign created at address: ${campaignAddress}`);
  
  // Connect to the campaign contract
  const fundCampaign = await hre.ethers.getContractAt("FundCampaign", campaignAddress);
  
  // Verify campaign
  console.log("\nVerifying campaign...");
  const verifyTx = await fundFactory.verifyCampaign(campaignAddress);
  await verifyTx.wait();
  
  // Check campaign status
  const status = await fundCampaign.status();
  console.log(`Campaign status after verification: ${status} (1 = VERIFIED)`);
  
  // Make a donation
  console.log("\nMaking a donation...");
  const donationAmount = hre.ethers.parseEther("0.2");
  const donateTx = await fundCampaign.connect(donor).donate({
    value: donationAmount
  });
  await donateTx.wait();
  
  // Check donation details
  const amountRaised = await fundCampaign.amountRaised();
  console.log(`Total amount raised: ${hre.ethers.formatEther(amountRaised)} ETH`);
  const donorCount = await fundCampaign.donorsCount();
  console.log(`Number of donors: ${donorCount}`);
  
  // Complete a milestone
  console.log("\nCompleting first milestone...");
  const completeTx = await fundCampaign.completeMilestone(0);
  await completeTx.wait();
  
  // Check milestone status
  const milestone = await fundCampaign.milestones(0);
  console.log(`Milestone completed: ${milestone.isCompleted}`);
  
  // Withdraw funds
  console.log("\nWithdrawing funds for completed milestone...");
  const withdrawTx = await fundCampaign.withdraw(milestone.amount);
  await withdrawTx.wait();
  
  console.log(`Successfully withdrawn ${hre.ethers.formatEther(milestone.amount)} ETH`);
  
  // Get campaign details
  console.log("\nCampaign details:");
  const details = await fundCampaign.getCampaignDetails();
  console.log(`Title: ${details._title}`);
  console.log(`Description: ${details._description}`);
  console.log(`Target amount: ${hre.ethers.formatEther(details._targetAmount)} ETH`);
  console.log(`Amount raised: ${hre.ethers.formatEther(details._amountRaised)} ETH`);
  console.log(`Donors count: ${details._donorsCount}`);
  console.log(`Status: ${details._status}`);
  console.log(`Created at: ${new Date(Number(details._createdAt) * 1000).toLocaleString()}`);
  console.log(`Updated at: ${new Date(Number(details._updatedAt) * 1000).toLocaleString()}`);
  
  console.log("\nInteraction complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 