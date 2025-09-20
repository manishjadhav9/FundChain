const fs = require('fs');
const path = require('path');

// Configure deployment addresses per network
const deployments = {
  localhost: {
    FundFactory: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", // Updated with actual deployed address
  },
  sepolia: {
    FundFactory: "", // Replace after deployment
  },
  mainnet: {
    FundFactory: "", // Replace after deployment
  }
};

// Export addresses for frontend
async function main() {
  const network = process.argv[2] || 'localhost';
  
  if (!deployments[network]) {
    console.error(`Network '${network}' not found in deployments.`);
    process.exit(1);
  }
  
  console.log(`Exporting contract addresses for '${network}' network...`);
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, '../exports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  // Create addresses file
  const addressOutput = {
    network,
    contracts: deployments[network],
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(outputDir, `${network}-addresses.json`),
    JSON.stringify(addressOutput, null, 2)
  );
  
  // Optional: Create a file to use in the frontend
  const frontendOutputDir = path.join(__dirname, '../../app/src/contracts');
  if (!fs.existsSync(frontendOutputDir)) {
    console.log(`Frontend directory not found: ${frontendOutputDir}`);
    console.log('Only writing to exports directory.');
  } else {
    fs.writeFileSync(
      path.join(frontendOutputDir, 'addresses.js'),
      `// Auto-generated on ${new Date().toISOString()}\n` +
      `// Network: ${network}\n` +
      `export const ContractAddresses = ${JSON.stringify(deployments[network], null, 2)};\n` +
      `export const NetworkName = "${network}";\n`
    );
    console.log(`Addresses exported to frontend directory.`);
  }
  
  console.log(`Contract addresses for '${network}' exported successfully.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
}); 