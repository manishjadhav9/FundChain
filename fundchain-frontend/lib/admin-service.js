/**
 * Admin service for campaign verification requests
 */

// In a real application, this would use a database or API
// For now, we'll use localStorage to simulate persistence
const PENDING_CAMPAIGNS_KEY = 'fundchain-pending-campaigns';
const APPROVED_CAMPAIGNS_KEY = 'fundchain-approved-campaigns';
import { createCampaign, verifyCampaign as verifyOnBlockchain, registerCampaignForVerification } from './contracts';

/**
 * Send a campaign for admin verification
 * @param {Object} campaign - Campaign data to send for verification
 * @returns {Promise<boolean>} - Success status
 */
export async function sendCampaignForVerification(campaign) {
  try {
    console.log('Sending campaign for verification:', campaign);
    
    // Extract milestone data
    const milestoneTitles = campaign.milestones.map(m => m.title);
    const milestoneDescriptions = campaign.milestones.map(m => m.description);
    const milestoneAmounts = campaign.milestones.map(m => m.amount);
    
    // Register the campaign on the blockchain (donor pays gas fee)
    // This will open MetaMask and require confirmation
    console.log('Registering campaign on blockchain...');
    const contractAddress = await registerCampaignForVerification(
      campaign.title,
      campaign.description,
      campaign.targetAmount,
      campaign.campaignType,
      campaign.imageHash,
      campaign.documentHashes || [],
      milestoneTitles,
      milestoneDescriptions,
      milestoneAmounts
    );
    
    console.log('Campaign registered on blockchain with address:', contractAddress);
    
    // Get existing pending campaigns
    let pendingCampaigns = [];
    const storedData = localStorage.getItem(PENDING_CAMPAIGNS_KEY);
    
    if (storedData) {
      pendingCampaigns = JSON.parse(storedData);
    }
    
    // Add unique ID and status
    const campaignWithMeta = {
      ...campaign,
      id: contractAddress, // Use contract address as ID
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
      contractAddress // Store contract address
    };
    
    // Add to pending list
    pendingCampaigns.push(campaignWithMeta);
    
    // Save back to localStorage
    localStorage.setItem(PENDING_CAMPAIGNS_KEY, JSON.stringify(pendingCampaigns));
    
    console.log('Campaign saved to local storage with contract address:', contractAddress);
    
    return true;
  } catch (error) {
    console.error('Error sending campaign for verification:', error);
    throw error;
  }
}

/**
 * Get all pending campaigns for verification
 * @returns {Promise<Array>} - List of pending campaigns
 */
export async function getPendingCampaigns() {
  try {
    const storedData = localStorage.getItem(PENDING_CAMPAIGNS_KEY);
    
    if (!storedData) {
      return [];
    }
    
    return JSON.parse(storedData).filter(campaign => campaign.status === 'PENDING');
  } catch (error) {
    console.error('Error getting pending campaigns:', error);
    return [];
  }
}

/**
 * Get all approved campaigns
 * @returns {Promise<Array>} - List of approved campaigns
 */
export async function getApprovedCampaigns() {
  try {
    const storedData = localStorage.getItem(APPROVED_CAMPAIGNS_KEY);
    
    if (!storedData) {
      return [];
    }
    
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Error getting approved campaigns:', error);
    return [];
  }
}

/**
 * Verify a campaign
 * @param {string} campaignId - ID of campaign to verify
 * @returns {Promise<boolean>} - Success status
 */
export async function verifyCampaign(campaignId) {
  try {
    const storedData = localStorage.getItem(PENDING_CAMPAIGNS_KEY);
    
    if (!storedData) {
      return false;
    }
    
    const campaigns = JSON.parse(storedData);
    let campaignToVerify = campaigns.find(campaign => campaign.id === campaignId);
    
    if (!campaignToVerify) {
      throw new Error('Campaign not found');
    }
    
    console.log('Verifying campaign on blockchain:', campaignId);
    
    // For Ethereum address format IDs (contractAddress)
    if (campaignId.startsWith('0x') && campaignId.length === 42) {
      try {
        // Call local verification - no MetaMask popup or transaction fees for admin
        await verifyOnBlockchain(campaignId);
        console.log('Campaign marked as verified (no network fee required)');
      } catch (blockchainError) {
        console.error('Error during verification process:', blockchainError);
        // Continue with the local verification despite any errors
        console.warn('Proceeding with local verification');
      }
    } else {
      console.warn('Campaign ID is not a valid contract address, proceeding with local verification only');
    }
    
    // Update status in pending campaigns
    let approvedCampaign = null;
    const updatedCampaigns = campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        approvedCampaign = {
          ...campaign,
          status: 'VERIFIED',
          verifiedAt: new Date().toISOString()
        };
        return approvedCampaign;
      }
      return campaign;
    });
    
    // Save updated pending campaigns
    localStorage.setItem(PENDING_CAMPAIGNS_KEY, JSON.stringify(updatedCampaigns));
    
    // If campaign was found and approved, add to approved campaigns list
    if (approvedCampaign) {
      // Get existing approved campaigns
      let approvedCampaigns = [];
      const approvedData = localStorage.getItem(APPROVED_CAMPAIGNS_KEY);
      
      if (approvedData) {
        approvedCampaigns = JSON.parse(approvedData);
      }
      
      // Add approved campaign with display data for the campaigns page
      approvedCampaigns.push({
        id: approvedCampaign.id,
        title: approvedCampaign.title,
        description: approvedCampaign.description,
        type: approvedCampaign.campaignType,
        organizer: approvedCampaign.organizer,
        imageHash: approvedCampaign.imageHash,
        targetAmount: approvedCampaign.targetAmount,
        targetAmountInr: approvedCampaign.targetAmountInr, 
        status: 'VERIFIED',
        amountRaised: 0,  // Start with 0 raised
        percentRaised: 0, // 0% raised initially
        donorCount: 0,    // No donors initially
        verifiedAt: approvedCampaign.verifiedAt,
        documentHashes: approvedCampaign.documentHashes || [],
        milestones: approvedCampaign.milestones || [],
        contractAddress: approvedCampaign.contractAddress || approvedCampaign.id
      });
      
      // Save updated approved campaigns
      localStorage.setItem(APPROVED_CAMPAIGNS_KEY, JSON.stringify(approvedCampaigns));
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying campaign:', error);
    throw error;
  }
}

/**
 * Reject a campaign
 * @param {string} campaignId - ID of campaign to reject
 * @param {string} reason - Reason for rejection
 * @returns {Promise<boolean>} - Success status
 */
export async function rejectCampaign(campaignId, reason = '') {
  try {
    const storedData = localStorage.getItem(PENDING_CAMPAIGNS_KEY);
    
    if (!storedData) {
      return false;
    }
    
    const campaigns = JSON.parse(storedData);
    const updatedCampaigns = campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        return {
          ...campaign,
          status: 'REJECTED',
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason
        };
      }
      return campaign;
    });
    
    localStorage.setItem(PENDING_CAMPAIGNS_KEY, JSON.stringify(updatedCampaigns));
    return true;
  } catch (error) {
    console.error('Error rejecting campaign:', error);
    throw error;
  }
} 