// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FundCampaign
 * @dev Individual campaign contract that handles milestones and verification
 */
contract FundCampaign {
    // Events
    event DonationReceived(address donor, uint256 amount);
    event MilestoneAdded(uint256 milestoneId, string title, uint256 amount);
    event MilestoneCompleted(uint256 milestoneId);
    event CampaignVerified(bool verified);
    event FundsWithdrawn(address recipient, uint256 amount);
    
    // Campaign status enum
    enum Status { OPEN, VERIFIED, CLOSED }
    
    // Milestone struct
    struct Milestone {
        string title;
        string description;
        uint256 amount;
        bool isCompleted;
    }
    
    // State variables
    address public owner;
    address public factory;
    string public title;
    string public description;
    string public campaignType;
    uint256 public targetAmount;
    uint256 public amountRaised;
    uint256 public donorsCount;
    string public imageHash;
    string[] public documentHashes;
    Status public status;
    uint256 public createdAt;
    uint256 public updatedAt;
    
    // Milestones
    Milestone[] public milestones;
    mapping(address => uint256) public donations;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "FundCampaign: Caller is not the owner");
        _;
    }
    
    modifier onlyFactory() {
        require(msg.sender == factory, "FundCampaign: Caller is not the factory");
        _;
    }
    
    modifier campaignActive() {
        require(status != Status.CLOSED, "FundCampaign: Campaign is closed");
        _;
    }
    
    /**
     * @dev Constructor
     * @param _owner Address of the campaign owner
     * @param _factory Address of the factory contract
     * @param _title Campaign title
     * @param _description Campaign description
     * @param _targetAmount Campaign target amount
     * @param _campaignType Campaign type (MEDICAL, RELIGIOUS, etc.)
     * @param _imageHash IPFS hash of the campaign image
     * @param _documentHashes Array of IPFS hashes for supporting documents
     */
    constructor(
        address _owner,
        address _factory,
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        string memory _campaignType,
        string memory _imageHash,
        string[] memory _documentHashes
    ) {
        owner = _owner;
        factory = _factory;
        title = _title;
        description = _description;
        targetAmount = _targetAmount;
        campaignType = _campaignType;
        imageHash = _imageHash;
        documentHashes = _documentHashes;
        status = Status.OPEN;
        createdAt = block.timestamp;
        updatedAt = block.timestamp;
    }
    
    /**
     * @dev Transfer ownership to a new owner
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyFactory {
        require(_newOwner != address(0), "FundCampaign: New owner is the zero address");
        owner = _newOwner;
        updatedAt = block.timestamp;
    }
    
    /**
     * @dev Add a milestone to the campaign
     * @param _title Milestone title
     * @param _description Milestone description
     * @param _amount Milestone amount
     */
    function addMilestone(
        string memory _title,
        string memory _description,
        uint256 _amount
    ) external onlyFactory {
        require(bytes(_title).length > 0, "FundCampaign: Title cannot be empty");
        require(_amount > 0, "FundCampaign: Amount must be greater than zero");
        
        uint256 milestoneId = milestones.length;
        milestones.push(Milestone({
            title: _title,
            description: _description,
            amount: _amount,
            isCompleted: false
        }));
        
        emit MilestoneAdded(milestoneId, _title, _amount);
        updatedAt = block.timestamp;
    }
    
    /**
     * @dev Verify the campaign
     */
    function verify() external onlyFactory {
        status = Status.VERIFIED;
        updatedAt = block.timestamp;
        
        emit CampaignVerified(true);
    }
    
    /**
     * @dev Make a donation to the campaign
     */
    function donate() external payable campaignActive {
        require(status == Status.VERIFIED, "FundCampaign: Campaign not verified");
        require(msg.value > 0, "FundCampaign: Donation amount must be greater than zero");
        require(amountRaised + msg.value <= targetAmount, "FundCampaign: Donation exceeds target amount");
        
        // Update donor count if first time donation
        if (donations[msg.sender] == 0) {
            donorsCount++;
        }
        
        // Update donation amount
        donations[msg.sender] += msg.value;
        amountRaised += msg.value;
        updatedAt = block.timestamp;
        
        emit DonationReceived(msg.sender, msg.value);
        
        // Check if campaign is fully funded
        if (amountRaised == targetAmount) {
            status = Status.CLOSED;
        }
    }
    
    /**
     * @dev Complete a milestone
     * @param _milestoneId ID of the milestone to complete
     */
    function completeMilestone(uint256 _milestoneId) external onlyOwner {
        require(_milestoneId < milestones.length, "FundCampaign: Invalid milestone ID");
        require(status == Status.VERIFIED, "FundCampaign: Campaign not verified");
        require(!milestones[_milestoneId].isCompleted, "FundCampaign: Milestone already completed");
        
        milestones[_milestoneId].isCompleted = true;
        updatedAt = block.timestamp;
        
        emit MilestoneCompleted(_milestoneId);
    }
    
    /**
     * @dev Withdraw funds to the owner
     * @param _amount Amount to withdraw
     */
    function withdraw(uint256 _amount) external onlyOwner {
        require(_amount > 0 && _amount <= address(this).balance, "FundCampaign: Invalid amount");
        require(status == Status.VERIFIED, "FundCampaign: Campaign not verified");
        
        // Calculate how much can be withdrawn based on completed milestones
        uint256 completedAmount;
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].isCompleted) {
                completedAmount += milestones[i].amount;
            }
        }
        
        // Calculate amount already withdrawn (amountRaised - current balance)
        uint256 withdrawnAmount = amountRaised - address(this).balance;
        
        // Ensure enough milestone completion to allow withdrawal
        require(withdrawnAmount + _amount <= completedAmount, "FundCampaign: Cannot withdraw more than completed milestones");
        
        // Transfer funds
        payable(owner).transfer(_amount);
        updatedAt = block.timestamp;
        
        emit FundsWithdrawn(owner, _amount);
    }
    
    /**
     * @dev Close the campaign
     */
    function closeCampaign() external onlyOwner {
        status = Status.CLOSED;
        updatedAt = block.timestamp;
    }
    
    /**
     * @dev Get campaign details
     * @return _title Campaign title
     * @return _description Campaign description
     * @return _targetAmount Target amount
     * @return _amountRaised Amount raised
     * @return _donorsCount Donors count
     * @return _status Status
     * @return _createdAt Creation timestamp
     * @return _updatedAt Update timestamp
     */
    function getCampaignDetails() external view returns (
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        uint256 _amountRaised,
        uint256 _donorsCount,
        Status _status,
        uint256 _createdAt,
        uint256 _updatedAt
    ) {
        return (
            title,
            description,
            targetAmount,
            amountRaised,
            donorsCount,
            status,
            createdAt,
            updatedAt
        );
    }
    
    /**
     * @dev Get milestone count
     * @return Number of milestones
     */
    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }
    
    /**
     * @dev Get milestone details
     * @param _milestoneId ID of the milestone
     * @return _title Milestone title
     * @return _description Milestone description
     * @return _amount Milestone amount
     * @return _isCompleted Completion status
     */
    function getMilestoneDetails(uint256 _milestoneId) external view returns (
        string memory _title,
        string memory _description,
        uint256 _amount,
        bool _isCompleted
    ) {
        require(_milestoneId < milestones.length, "FundCampaign: Invalid milestone ID");
        Milestone storage milestone = milestones[_milestoneId];
        return (
            milestone.title,
            milestone.description,
            milestone.amount,
            milestone.isCompleted
        );
    }
    
    /**
     * @dev Get document hashes
     * @return Array of document hashes
     */
    function getDocumentHashes() external view returns (string[] memory) {
        return documentHashes;
    }
} 