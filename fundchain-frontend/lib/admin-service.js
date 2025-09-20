/**
 * Admin service for campaign verification requests
 */

// In a real application, this would use a database or API
// For now, we'll use localStorage to simulate persistence
const PENDING_CAMPAIGNS_KEY = 'fundchain-pending-campaigns';
const APPROVED_CAMPAIGNS_KEY = 'fundchain-approved-campaigns';
import { createCampaign, verifyCampaign as verifyOnBlockchain, registerCampaignForVerification, getAllCampaigns } from './contracts';

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
    
    let contractAddress;
    
    // Try to register the campaign on the blockchain
    try {
      console.log('Attempting to register campaign on blockchain...');
      contractAddress = await registerCampaignForVerification(
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
      console.log('✅ Campaign registered on blockchain with address:', contractAddress);
    } catch (blockchainError) {
      console.warn('⚠️ Blockchain registration failed, using mock address:', blockchainError.message);
      // Generate a unique mock address for development
      contractAddress = `0x${Date.now().toString(16).padStart(40, '0')}`;
    }
    
    // Get existing pending campaigns
    let pendingCampaigns = [];
    const storedData = localStorage.getItem(PENDING_CAMPAIGNS_KEY);
    
    if (storedData) {
      try {
        pendingCampaigns = JSON.parse(storedData);
      } catch (e) {
        console.warn('Failed to parse pending campaigns, starting fresh');
        pendingCampaigns = [];
      }
    }
    
    // Add unique ID and status
    const campaignWithMeta = {
      ...campaign,
      id: contractAddress, // Use contract address as ID
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
      contractAddress, // Store contract address
      // Add default values for display
      amountRaised: "0",
      percentRaised: 0,
      donorCount: 0
    };
    
    // Add to pending list
    pendingCampaigns.push(campaignWithMeta);
    
    // Save back to localStorage
    try {
      localStorage.setItem(PENDING_CAMPAIGNS_KEY, JSON.stringify(pendingCampaigns));
      console.log('💾 Campaign saved to pending list with ID:', contractAddress);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    
    // For development, auto-verify the campaign after a short delay
    setTimeout(async () => {
      try {
        console.log('🔄 Auto-verifying campaign for development...');
        await verifyCampaign(contractAddress);
        console.log('✅ Campaign auto-verified successfully');
      } catch (e) {
        console.warn('Auto-verification failed:', e.message);
      }
    }, 2000);
    
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
 * Get all approved campaigns (from blockchain + localStorage)
 * @returns {Promise<Array>} - List of approved campaigns
 */
export async function getApprovedCampaigns() {
  try {
    console.log('📋 Loading approved campaigns...');
    
    // Get campaigns from localStorage first (for development)
    let localCampaigns = [];
    try {
      const storedData = localStorage.getItem(APPROVED_CAMPAIGNS_KEY);
      if (storedData) {
        localCampaigns = JSON.parse(storedData);
        console.log(`📦 Found ${localCampaigns.length} campaigns in localStorage`);
      }
    } catch (localError) {
      console.warn('Failed to fetch from localStorage:', localError.message);
    }
    
    // Get campaigns from blockchain (if available)
    let blockchainCampaigns = [];
    try {
      const allCampaigns = await getAllCampaigns();
      // Only show verified campaigns in the public view
      blockchainCampaigns = allCampaigns.filter(campaign => campaign.status === 'VERIFIED');
      console.log(`⛓️ Found ${blockchainCampaigns.length} verified campaigns on blockchain`);
    } catch (blockchainError) {
      console.warn('⚠️ Failed to fetch from blockchain:', blockchainError.message);
      blockchainCampaigns = []; // Ensure it's an array
    }
    
    // Combine campaigns (localStorage takes priority for development)
    const allCampaigns = [...localCampaigns];
    
    // Add blockchain campaigns that aren't already in local data
    blockchainCampaigns.forEach(blockchainCampaign => {
      const exists = allCampaigns.find(lc => lc.id === blockchainCampaign.id);
      if (!exists) {
        allCampaigns.push(blockchainCampaign);
      }
    });
    
    // Add some sample campaigns if no campaigns exist (for development)
    if (allCampaigns.length === 0) {
      console.log('📝 No campaigns found, adding sample campaigns for development');
      const sampleCampaigns = createSampleCampaigns();
      
      // Save sample campaigns to localStorage
      try {
        localStorage.setItem(APPROVED_CAMPAIGNS_KEY, JSON.stringify(sampleCampaigns));
        console.log('💾 Sample campaigns saved to localStorage');
      } catch (e) {
        console.warn('Failed to save sample campaigns:', e.message);
      }
      
      allCampaigns.push(...sampleCampaigns);
    }
    
    console.log(`📊 Total campaigns to display: ${allCampaigns.length}`);
    return allCampaigns;
    
  } catch (error) {
    console.warn('⚠️ Error getting approved campaigns:', error.message);
    // Return sample campaigns as fallback
    return createSampleCampaigns();
  }
}

// Helper function to create sample campaigns for development
function createSampleCampaigns() {
  return [
    {
      id: 'sample-1',
      title: 'Community Development Project',
      description: 'Building better infrastructure for rural communities. This project aims to improve access to clean water, electricity, and internet connectivity for underserved areas.',
      type: 'ngo',
      imageHash: 'QmX2DiQ53iJAgWDXRCDyibXtnxpyRDdV1EbogtPAH88Hnk', // Real IPFS hash
      documentHashes: ['QmTfUcm6XD8qzoDQLK3MTd7wSTNcbXYyhDdCnDDs4dwNep'], // Real IPFS hash
      targetAmount: '5.0',
      targetAmountInr: '415000',
      raisedAmount: '2.1',
      raisedAmountInr: '174300',
      donorCount: 23,
      status: 'VERIFIED',
      owner: '0x1234567890123456789012345678901234567890',
      createdAt: 'August 22, 2025',
      lastUpdated: 'September 16, 2025',
      milestones: [
        {
          id: 1,
          title: 'Initial Setup',
          description: 'Setting up project infrastructure and team',
          amount: '1.5',
          isCompleted: true
        },
        {
          id: 2,
          title: 'Community Outreach',
          description: 'Engaging with local communities and stakeholders',
          amount: '2.0',
          isCompleted: false
        },
        {
          id: 3,
          title: 'Implementation',
          description: 'Building and deploying the infrastructure',
          amount: '1.5',
          isCompleted: false
        }
      ],
      organizer: {
        name: 'Community Development NGO',
        role: 'Non-Profit Organization',
        contact: 'contact@communityngo.org'
      }
    },
    {
      id: "sample-2",
      title: "Rebuild Shiva Temple After Earthquake",
      description: "The historic Shiva Temple in Uttarakhand was severely damaged in the recent earthquake. Help us rebuild this 500-year-old cultural heritage. This temple is not just a religious site but also a significant cultural monument.",
      type: "RELIGIOUS",
      imageHash: "QmV2i4yCqbW9jpzG9o9GpShJ6VtbTVECcLjSgpWccVq7G6",
      targetAmount: "2.7",
      targetAmountInr: "750000",
      status: "VERIFIED",
      amountRaised: "1.0",
      percentRaised: 38,
      donorCount: 320,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      owner: "0x2345678901234567890123456789012345678901",
      contractAddress: "0x2345678901234567890123456789012345678901"
    },
    {
      id: "sample-3",
      title: "Education for 100 Rural Girls",
      description: "Support the education of 100 girls from rural villages in Bihar. This includes school fees, books, uniforms, and transportation for one year. Education is the key to breaking the cycle of poverty in these communities.",
      type: "EDUCATION",
      imageHash: "QmPLB9yo8mQmSvK6WcXCsz7L1ZCajEoZJ9LRppAuH2Gy57",
      targetAmount: "3.1",
      targetAmountInr: "850000",
      status: "VERIFIED",
      amountRaised: "2.6",
      percentRaised: 85,
      donorCount: 275,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      owner: "0x3456789012345678901234567890123456789012",
      contractAddress: "0x3456789012345678901234567890123456789012"
    }
  ];
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
      const approvedCampaignForDisplay = {
        id: approvedCampaign.id,
        title: approvedCampaign.title,
        description: approvedCampaign.description,
        type: approvedCampaign.campaignType,
        organizer: approvedCampaign.organizer,
        imageHash: approvedCampaign.imageHash,
        targetAmount: approvedCampaign.targetAmount,
        targetAmountInr: approvedCampaign.targetAmountInr, 
        status: 'VERIFIED',
        amountRaised: approvedCampaign.amountRaised || "0",  // Start with 0 raised
        percentRaised: approvedCampaign.percentRaised || 0, // 0% raised initially
        donorCount: approvedCampaign.donorCount || 0,    // No donors initially
        verifiedAt: approvedCampaign.verifiedAt,
        createdAt: approvedCampaign.submittedAt || new Date().toISOString(),
        updatedAt: approvedCampaign.verifiedAt || new Date().toISOString(),
        documentHashes: approvedCampaign.documentHashes || [],
        milestones: approvedCampaign.milestones || [],
        contractAddress: approvedCampaign.contractAddress || approvedCampaign.id,
        owner: approvedCampaign.contractAddress || approvedCampaign.id
      };
      
      approvedCampaigns.push(approvedCampaignForDisplay);
      
      // Save updated approved campaigns
      try {
        localStorage.setItem(APPROVED_CAMPAIGNS_KEY, JSON.stringify(approvedCampaigns));
        console.log('💾 Campaign added to approved list and saved to localStorage');
      } catch (e) {
        console.error('Failed to save approved campaigns to localStorage:', e);
      }
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