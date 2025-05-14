const hre = require("hardhat");

async function main() {
  console.log("Deploying FundFactory contract...");
  
  // Deploy FundFactory contract
  const FundFactory = await hre.ethers.getContractFactory("FundFactory");
  const fundFactory = await FundFactory.deploy();

  await fundFactory.waitForDeployment();

  const fundFactoryAddress = await fundFactory.getAddress();
  console.log(`FundFactory deployed to: ${fundFactoryAddress}`);
  
  // Get network information
  const { name, chainId } = await hre.ethers.provider.getNetwork();
  console.log(`Network: ${name} (chainId: ${chainId})`);
  
  console.log("==================================================");
  console.log("Deployment complete!");
  console.log("==================================================");
  console.log(`FundFactory: ${fundFactoryAddress}`);
  console.log("==================================================");
  
  // If not on a local network, wait for verification
  if (chainId !== 31337 && chainId !== 1337) {
    console.log("Waiting for block confirmations...");
    // Wait for 6 blocks for confirmation
    console.log("Waiting for 6 block confirmations...");
    await new Promise(r => setTimeout(r, 60000)); // Wait 1 minute
    
    // Verify contract
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: fundFactoryAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan!");
    } catch (error) {
      console.log("Error verifying contract:", error);
    }
  }
  
  // Update the export-addresses.js file with the new contract address
  console.log("Updating contract addresses in export-addresses.js...");
  try {
    const fs = require('fs');
    const path = require('path');
    const exportAddressesPath = path.join(__dirname, 'export-addresses.js');
    
    let content = fs.readFileSync(exportAddressesPath, 'utf8');
    
    // Get network name
    let networkName = 'localhost';
    if (chainId === 11155111) networkName = 'sepolia';
    if (chainId === 1) networkName = 'mainnet';
    
    // Find and replace the address for the current network
    const regex = new RegExp(`${networkName}:\\s*{[^}]*FundFactory:\\s*"[^"]*"`, 'g');
    const replacement = `${networkName}: {
    FundFactory: "${fundFactoryAddress}"`;
    
    content = content.replace(regex, replacement);
    
    fs.writeFileSync(exportAddressesPath, content);
    console.log(`Updated ${networkName} FundFactory address to ${fundFactoryAddress}`);
  } catch (error) {
    console.log("Error updating export-addresses.js:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 