# FundChain Smart Contracts Deployment Guide

This guide will walk you through the process of testing and deploying the FundChain smart contracts locally using Hardhat.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- [MetaMask](https://metamask.io/) browser extension (for interacting with the deployed contracts)

## Step 0: Project Setup

1. Clone the repository (if you haven't already):
   ```bash
   git clone https://github.com/your-username/fundchain.git
   cd fundchain
   ```

2. Navigate to the contracts directory:
   ```bash
   cd fundchain-contracts
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Step 1: Configure the Local Network

1. Ensure your Hardhat configuration is set up for local development in the `hardhat.config.js` file:

```javascript
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    }
  },
  paths: {
    artifacts: "./artifacts",
    sources: "./contracts",
    cache: "./cache",
    tests: "./test"
  }
};
```

## Step 2: Compile the Smart Contracts

Compile the smart contracts to generate the necessary artifacts:

```bash
npx hardhat compile
```

This will create an `artifacts` directory containing the compiled contracts.

## Step 3: Run Tests

Run the test suite to verify that the contracts are functioning correctly:

```bash
npx hardhat test
```

You should see output indicating that all tests have passed. The tests verify:
- Factory contract deployment
- Campaign creation
- Campaign verification
- Donation functionality
- Milestone completion
- Fund withdrawal based on milestones

## Step 4: Start a Local Blockchain

Start a local Hardhat blockchain node:

```bash
npx hardhat node
```

This will start a local Ethereum network and create several test accounts with pre-funded ETH.

Keep this terminal window open as it shows the blockchain logs.

## Step 5: Deploy the Contracts Locally

Open a new terminal window, navigate to the fundchain-contracts directory, and deploy the contracts to the local network:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This will:
1. Deploy the FundFactory contract
2. Create a test campaign
3. Verify the test campaign
4. Output the contract addresses to the console

You should see output similar to:
```
FundFactory deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Deployer address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Creating test campaign...
Test campaign created at address: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
Verifying test campaign...
Test campaign verified!
```

**Make note of the FundFactory contract address as you'll need it for the frontend integration.**

## Step 6: Update Frontend Contract Address

Update the FundFactory contract address in your frontend application:

1. Create a `.env.local` file in the fundchain-frontend directory:
   ```bash
   cd ../fundchain-frontend
   echo "NEXT_PUBLIC_FUND_FACTORY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3" > .env.local
   ```

   Replace the address with the actual deployed FundFactory address from Step 5.

## Step 7: Configure MetaMask for Local Development

To interact with your local blockchain through the frontend:

1. Open MetaMask in your browser
2. Add a new network with the following details:
   - Network Name: Hardhat Local
   - New RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

3. Import one of the test accounts generated by Hardhat:
   - In the Hardhat node terminal, copy one of the private keys
   - In MetaMask, click on your account icon → Import Account
   - Paste the private key and click "Import"

## Step 8: Run the Frontend Application

Start the frontend application:

```bash
npm run dev
```

Access the application at http://localhost:3000 and you should be able to:
- Create campaigns (which will be stored on the local blockchain)
- Upload images and documents to IPFS (ensure your local IPFS node is running)
- Verify campaigns (with an admin account)
- Donate to verified campaigns
- Complete milestones and withdraw funds

## Step 9: Interacting with the Contract via Hardhat Console

For debugging or testing purposes, you can interact with the deployed contracts via the Hardhat console:

```bash
npx hardhat console --network localhost
```

Example commands:
```javascript
// Get the factory contract
const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Your deployed address
const FundFactory = await ethers.getContractFactory("FundFactory");
const factory = await FundFactory.attach(factoryAddress);

// Get campaign count
const count = await factory.getCampaignCount();
console.log("Campaign count:", count.toString());

// Get all campaigns
const campaigns = await factory.getAllCampaigns();
console.log("Campaign addresses:", campaigns);

// Get a campaign
const campaignAddress = campaigns[0];
const FundCampaign = await ethers.getContractFactory("FundCampaign");
const campaign = await FundCampaign.attach(campaignAddress);

// Get campaign details
const title = await campaign.title();
const status = await campaign.status();
console.log("Campaign title:", title);
console.log("Campaign status:", status);

// Make a donation
const [signer] = await ethers.getSigners();
await campaign.connect(signer).donate({ value: ethers.parseEther("0.1") });
```

## Troubleshooting

### IPFS Connection Issues

Ensure your local IPFS node is running. You can check its status with:

```bash
ipfs id
```

If not running, start it with:

```bash
ipfs daemon
```

### MetaMask Transaction Errors

If transactions fail in MetaMask:
- Ensure you're connected to the correct network (Hardhat Local)
- Check that you have enough ETH in your account
- Reset your account in MetaMask (Settings → Advanced → Reset Account) if transactions are stuck

### Smart Contract Deployment Issues

If deployment fails:
- Ensure the Hardhat node is running
- Check for compilation errors
- Verify that the contract addresses in your frontend match the actual deployed addresses

## Deployment to a Testnet

When you're ready to deploy to a public testnet like Sepolia or Goerli:

1. Add the network configuration to `hardhat.config.js`
2. Create a `.env` file with your private key and API endpoints
3. Deploy using:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

Remember to update the contract addresses in your frontend application after deploying to a testnet. 