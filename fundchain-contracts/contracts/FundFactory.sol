// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./FundCampaign.sol";

/**
 * @title FundFactory
 * @dev Factory contract to deploy and manage campaign contracts
 */
contract FundFactory {
    // Events
    event CampaignCreated(address campaignAddress, address owner, string title, uint256 targetAmount);
    event CampaignVerified(address campaignAddress, address admin, bool verified);
    
    // State variables
    address public admin;
    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isCampaign;
    address[] public campaigns;
    
    // Modifiers
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "FundFactory: Caller is not admin");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        isAdmin[msg.sender] = true;
    }
    
    /**
     * @dev Add another admin
     * @param _admin Address of the new admin
     */
    function addAdmin(address _admin) external onlyAdmin {
        require(_admin != address(0), "FundFactory: Invalid admin address");
        isAdmin[_admin] = true;
    }
    
    /**
     * @dev Remove an admin
     * @param _admin Address of the admin to remove
     */
    function removeAdmin(address _admin) external onlyAdmin {
        require(_admin != admin, "FundFactory: Cannot remove primary admin");
        isAdmin[_admin] = false;
    }
    
    /**
     * @dev Create a new campaign
     * @param _title Title of the campaign
     * @param _description Description of the campaign
     * @param _targetAmount Total target amount for the campaign
     * @param _campaignType Type of campaign (MEDICAL, RELIGIOUS, etc.)
     * @param _imageHash IPFS hash of the campaign image
     * @param _documentHashes Array of IPFS hashes for supporting documents
     * @param _milestoneTitles Array of milestone titles
     * @param _milestoneDescriptions Array of milestone descriptions
     * @param _milestoneAmounts Array of milestone amounts
     */
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        string memory _campaignType,
        string memory _imageHash,
        string[] memory _documentHashes,
        string[] memory _milestoneTitles,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneAmounts
    ) external returns (address) {
        // Validation
        require(bytes(_title).length > 0, "FundFactory: Title cannot be empty");
        require(bytes(_description).length > 0, "FundFactory: Description cannot be empty");
        require(_targetAmount > 0, "FundFactory: Target amount must be greater than zero");
        require(_milestoneTitles.length > 0, "FundFactory: At least one milestone required");
        require(
            _milestoneTitles.length == _milestoneDescriptions.length && 
            _milestoneTitles.length == _milestoneAmounts.length,
            "FundFactory: Milestone arrays length mismatch"
        );
        
        // Calculate sum of milestone amounts to ensure it equals target amount
        uint256 totalMilestoneAmount;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            totalMilestoneAmount += _milestoneAmounts[i];
        }
        require(totalMilestoneAmount == _targetAmount, "FundFactory: Sum of milestone amounts must equal target amount");
        
        // Create new campaign contract
        FundCampaign newCampaign = new FundCampaign(
            msg.sender,
            address(this),
            _title,
            _description,
            _targetAmount,
            _campaignType,
            _imageHash,
            _documentHashes
        );
        
        // Add milestones
        for (uint256 i = 0; i < _milestoneTitles.length; i++) {
            newCampaign.addMilestone(_milestoneTitles[i], _milestoneDescriptions[i], _milestoneAmounts[i]);
        }
        
        // Transfer ownership to the owner (campaign creator)
        newCampaign.transferOwnership(msg.sender);
        
        // Register the campaign
        address campaignAddress = address(newCampaign);
        isCampaign[campaignAddress] = true;
        campaigns.push(campaignAddress);
        
        emit CampaignCreated(campaignAddress, msg.sender, _title, _targetAmount);
        
        return campaignAddress;
    }
    
    /**
     * @dev Verify a campaign
     * @param _campaignAddress Address of the campaign to verify
     */
    function verifyCampaign(address _campaignAddress) external onlyAdmin {
        require(isCampaign[_campaignAddress], "FundFactory: Not a registered campaign");
        
        FundCampaign campaign = FundCampaign(_campaignAddress);
        campaign.verify();
        
        emit CampaignVerified(_campaignAddress, msg.sender, true);
    }
    
    /**
     * @dev Get all campaigns
     * @return Array of campaign addresses
     */
    function getAllCampaigns() external view returns (address[] memory) {
        return campaigns;
    }
    
    /**
     * @dev Get campaign count
     * @return Number of campaigns
     */
    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }
} 