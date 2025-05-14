const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FundChain", function () {
  let fundFactory;
  let owner;
  let admin;
  let donor;
  let campaignOwner;

  const title = "Medical Campaign";
  const description = "Help fund medical expenses";
  const targetAmount = ethers.parseEther("1"); // 1 ETH
  const campaignType = "MEDICAL";
  const imageHash = "QmImageHash";
  const documentHashes = ["QmDocHash1", "QmDocHash2"];
  const milestoneTitles = ["Initial Tests", "Treatment"];
  const milestoneDescriptions = ["Initial diagnosis", "Complete treatment"];
  const milestoneAmounts = [ethers.parseEther("0.4"), ethers.parseEther("0.6")];

  beforeEach(async function () {
    // Get signers
    [owner, admin, donor, campaignOwner] = await ethers.getSigners();

    // Deploy FundFactory
    const FundFactory = await ethers.getContractFactory("FundFactory");
    fundFactory = await FundFactory.deploy();
    await fundFactory.waitForDeployment();

    // Add admin
    await fundFactory.addAdmin(admin.address);
  });

  describe("FundFactory", function () {
    it("Should set the right owner", async function () {
      expect(await fundFactory.admin()).to.equal(owner.address);
    });

    it("Should add an admin", async function () {
      expect(await fundFactory.isAdmin(admin.address)).to.equal(true);
    });

    it("Should create a campaign", async function () {
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

      expect(event).to.not.be.undefined;
      const campaignAddress = event.args[0];
      expect(await fundFactory.isCampaign(campaignAddress)).to.equal(true);
    });

    it("Should verify a campaign", async function () {
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

      const campaignAddress = event.args[0];
      const fundCampaign = await ethers.getContractAt("FundCampaign", campaignAddress);
      
      // Verify the campaign
      await fundFactory.connect(admin).verifyCampaign(campaignAddress);
      const status = (await fundCampaign.status()).toString();
      expect(status).to.equal("1"); // Status.VERIFIED = 1
    });
  });

  describe("FundCampaign", function () {
    let fundCampaign;
    let campaignAddress;
    
    beforeEach(async function () {
      // Create a new campaign for each test
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

      campaignAddress = event.args[0];
      fundCampaign = await ethers.getContractAt("FundCampaign", campaignAddress);
      
      // Verify the campaign
      await fundFactory.connect(admin).verifyCampaign(campaignAddress);
    });

    it("Should have the correct owner", async function () {
      expect(await fundCampaign.owner()).to.equal(campaignOwner.address);
    });

    it("Should have the correct details", async function () {
      expect(await fundCampaign.title()).to.equal(title);
      expect(await fundCampaign.description()).to.equal(description);
      expect(await fundCampaign.targetAmount()).to.equal(targetAmount);
      expect(await fundCampaign.campaignType()).to.equal(campaignType);
    });

    it("Should have the correct milestones", async function () {
      expect(await fundCampaign.getMilestoneCount()).to.equal(2);
      
      const milestone1 = await fundCampaign.milestones(0);
      expect(milestone1.title).to.equal(milestoneTitles[0]);
      expect(milestone1.amount).to.equal(milestoneAmounts[0]);
      
      const milestone2 = await fundCampaign.milestones(1);
      expect(milestone2.title).to.equal(milestoneTitles[1]);
      expect(milestone2.amount).to.equal(milestoneAmounts[1]);
    });

    it("Should accept donations", async function () {
      const donationAmount = ethers.parseEther("0.5");
      await fundCampaign.connect(donor).donate({ value: donationAmount });
      
      expect(await fundCampaign.amountRaised()).to.equal(donationAmount);
      expect(await fundCampaign.donations(donor.address)).to.equal(donationAmount);
      expect(await fundCampaign.donorsCount()).to.equal(1);
    });

    it("Should complete milestones", async function () {
      // Make a donation but not full amount to avoid auto-closing
      await fundCampaign.connect(donor).donate({ value: ethers.parseEther("0.5") });
      
      // Complete the first milestone
      await fundCampaign.connect(campaignOwner).completeMilestone(0);
      
      const milestone = await fundCampaign.milestones(0);
      expect(milestone.isCompleted).to.equal(true);
    });

    it("Should allow withdrawal after milestone completion", async function () {
      // Make a donation to cover the first milestone
      await fundCampaign.connect(donor).donate({ value: milestoneAmounts[0] });
      
      // Complete the first milestone
      await fundCampaign.connect(campaignOwner).completeMilestone(0);
      
      // Check balance before withdrawal
      const initialBalance = await ethers.provider.getBalance(campaignOwner.address);
      
      // Withdraw funds
      await fundCampaign.connect(campaignOwner).withdraw(milestoneAmounts[0]);
      
      // Check campaign balance
      expect(await ethers.provider.getBalance(campaignAddress)).to.equal(0);
      
      // Check campaign owner's balance increased (minus gas fees)
      const finalBalance = await ethers.provider.getBalance(campaignOwner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should prevent withdrawal for incomplete milestones", async function () {
      // Make a donation less than target to avoid auto-closing
      const donationAmount = ethers.parseEther("0.9");
      await fundCampaign.connect(donor).donate({ value: donationAmount });
      
      // Complete only the first milestone (0.4 ETH)
      await fundCampaign.connect(campaignOwner).completeMilestone(0);
      
      // Verify the milestone was completed
      const milestone = await fundCampaign.milestones(0);
      expect(milestone.isCompleted).to.equal(true);
      
      // Try to withdraw more than completed milestone amount (should fail)
      const withdrawAmount = ethers.parseEther("0.5"); // More than first milestone (0.4 ETH)
      await expect(
        fundCampaign.connect(campaignOwner).withdraw(withdrawAmount)
      ).to.be.revertedWith("FundCampaign: Cannot withdraw more than completed milestones");
      
      // Should be able to withdraw just the completed milestone amount
      await fundCampaign.connect(campaignOwner).withdraw(milestoneAmounts[0]);
    });
    
    it("Should close campaign when fully funded", async function () {
      // Make a donation of the full target amount
      await fundCampaign.connect(donor).donate({ value: targetAmount });
      
      // Campaign should be closed
      const status = (await fundCampaign.status()).toString();
      expect(status).to.equal("2"); // Status.CLOSED = 2
    });
  });
}); 