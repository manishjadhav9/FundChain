# FundChain Deployment Guide

This guide explains how to deploy the FundChain contracts to various networks.

## Prerequisites

1. Node.js and npm installed
2. Access to an Ethereum wallet with ETH (for gas fees)
3. API keys for the network provider (e.g., Infura, Alchemy)
4. Etherscan API key (for contract verification)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your network settings in hardhat.config.js:
   ```javascript
   // Update these values in hardhat.config.js
   sepolia: {
     url: "https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY", // Replace with your Infura API key
     accounts: ["0xYOUR_PRIVATE_KEY_HERE"], // Replace with your private key
     chainId: 11155111,
   }
   ```

3. Replace the placeholder values with your actual private key and API keys.

## Deploying to Local Network

1. Start a local Hardhat node:
   ```bash
   npx hardhat node
   ```

2. Deploy the contracts:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

## Deploying to Testnet (Sepolia)

1. Make sure your wallet has enough Sepolia ETH for gas fees.

2. Deploy the contracts:
   ```bash
   npx hardhat run scripts/deploy-production.js --network sepolia
   ```

3. The script will automatically attempt to verify the contract on Etherscan.

## Deploying to Mainnet

1. Make sure your wallet has enough ETH for gas fees.

2. Deploy the contracts:
   ```bash
   npx hardhat run scripts/deploy-production.js --network mainnet
   ```

3. The script will automatically attempt to verify the contract on Etherscan.

## Post-Deployment

After deploying the contracts, you'll need to:

1. Note the FundFactory contract address printed in the console.
2. Update the contract addresses in `scripts/export-addresses.js` for the deployed network.
3. Run the export scripts to generate files for your frontend:
   ```bash
   # Update contract addresses in scripts/export-addresses.js first
   node scripts/export-addresses.js sepolia
   node scripts/export-abis.js
   ```
4. For the first campaign, the deployer address will be the admin.
5. You can add additional admins using the `addAdmin` function in the FundFactory contract.

## Export Scripts

The project includes two helpful scripts for integrating with the frontend:

1. `export-addresses.js` - Exports contract addresses for the specified network
   ```bash
   node scripts/export-addresses.js sepolia
   ```

2. `export-abis.js` - Exports contract ABIs
   ```bash
   node scripts/export-abis.js
   ```

These scripts will generate files in the `exports` directory and attempt to copy them to your frontend project at `../app/src/contracts/` if that directory exists.

## Contract Verification

The deployment script tries to automatically verify the contract on Etherscan. If verification fails, you can manually verify the contract:

```bash
npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
```

Replace `sepolia` with the appropriate network and `<DEPLOYED_CONTRACT_ADDRESS>` with your deployed contract address.

## Interacting with Deployed Contracts

You can interact with the deployed contracts using:

1. The Hardhat console:
   ```bash
   npx hardhat console --network sepolia
   ```

2. Scripts:
   ```javascript
   const { ethers } = require("hardhat");
   
   async function main() {
     const FundFactory = await ethers.getContractAt("FundFactory", "<DEPLOYED_CONTRACT_ADDRESS>");
     // Add an admin
     await FundFactory.addAdmin("<ADMIN_ADDRESS>");
   }
   
   main().catch(console.error);
   ```

3. Your frontend application.