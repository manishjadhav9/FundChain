const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FundCampaign Contract", function () {
  let fundFactory;
  let owner;
  let admin;
  let donor;
  let campaignOwner;
  let fundCampaign;
  let campaignAddress;

  const title = "Medical Campaign";
  const description = "Help fund medical expenses";
  const targetAmount = ethers.parseEther("1"); // 1 ETH
  const campaignType = "MEDICAL";
  const imageHash = "QmImageHash";
  const documentHashes = ["QmDocHash1", "QmDocHash2"];
  const milestoneTitles = ["Initial Tests", "Treatment"];
  const milestoneDescriptions = ["Initial diagnosis", "Complete treatment"];
  const milestoneAmounts = [ethers.parseEther("0.4"), ethers.parseEther("0.6")];

  before(async function () {
    // Get signers
    [owner, admin, donor, campaignOwner] = await ethers.getSigners();

    // Deploy FundFactory
    const FundFactory = await ethers.getContractFactory("FundFactory");
    fundFactory = await FundFactory.deploy();
    await fundFactory.waitForDeployment();

    // Add admin
    await fundFactory.addAdmin(admin.address);

    // Create a campaign
    const tx = await fundFactory.connect(campaignOwner).createCampaign(
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

    campaignAddress = event.args[0]; // First arg is the campaign address
    fundCampaign = await ethers.getContractAt("FundCampaign", campaignAddress);
    
    // Verify the campaign
    await fundFactory.connect(admin).verifyCampaign(campaignAddress);
    
    // Check verification
    const status = await fundCampaign.status();
    console.log("Initial Campaign Status:", status.toString());
    expect(status.toString()).to.equal("1"); // Status.VERIFIED = 1
  });

  // Test that properly verifies withdraw restrictions for incomplete milestones
  it("Should prevent withdrawal for incomplete milestones", async function () {
    // 1. Verify that the campaign is verified
    const status = await fundCampaign.status();
    console.log("Campaign Status before donation:", status.toString());
    expect(status.toString()).to.equal("1"); // Status.VERIFIED = 1
    
    // 2. Make a donation slightly less than target to prevent auto-closing
    const donationAmount = ethers.parseEther("0.9"); // 0.9 ETH instead of 1 ETH
    console.log("Making donation of:", donationAmount.toString());
    const donateTx = await fundCampaign.connect(donor).donate({ value: donationAmount });
    await donateTx.wait();
    console.log("Donation complete");
    
    // 3. Verify campaign status after donation
    const statusAfterDonation = await fundCampaign.status();
    console.log("Campaign Status after donation:", statusAfterDonation.toString());
    expect(statusAfterDonation.toString()).to.equal("1"); // Status.VERIFIED = 1
    
    // 4. Complete the first milestone
    console.log("Completing milestone 0");
    const completeTx = await fundCampaign.connect(campaignOwner).completeMilestone(0);
    await completeTx.wait();
    console.log("Milestone completed");
    
    // 5. Verify the milestone was completed
    const milestone = await fundCampaign.milestones(0);
    console.log("Milestone completion status:", milestone.isCompleted);
    expect(milestone.isCompleted).to.be.true;
    
    // 6. Try to withdraw more than the completed milestone (should fail)
    const withdrawAmount = ethers.parseEther("0.5"); // More than first milestone (0.4 ETH)
    console.log("Attempting to withdraw:", withdrawAmount.toString());
    await expect(
      fundCampaign.connect(campaignOwner).withdraw(withdrawAmount)
    ).to.be.revertedWith("FundCampaign: Cannot withdraw more than completed milestones");
    
    // 7. Withdraw only the completed milestone amount
    console.log("Withdrawing milestone amount:", milestoneAmounts[0].toString());
    const withdrawTx = await fundCampaign.connect(campaignOwner).withdraw(milestoneAmounts[0]);
    await withdrawTx.wait();
    console.log("Withdrawal of first milestone successful");
  });
});