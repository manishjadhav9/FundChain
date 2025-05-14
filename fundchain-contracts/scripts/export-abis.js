const fs = require('fs');
const path = require('path');

// Contracts to export ABIs for
const contracts = [
  "FundFactory",
  "FundCampaign"
];

async function main() {
  console.log("Exporting contract ABIs...");
  
  // Create output directories if they don't exist
  const outputDir = path.join(__dirname, '../exports/abis');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Optional: Check for frontend directory
  const frontendOutputDir = path.join(__dirname, '../../app/src/contracts/abis');
  let frontendDirExists = false;
  
  if (!fs.existsSync(frontendOutputDir)) {
    console.log(`Frontend ABI directory not found: ${frontendOutputDir}`);
  } else {
    frontendDirExists = true;
  }
  
  // Export each contract ABI
  for (const contractName of contracts) {
    try {
      const artifactPath = path.join(
        __dirname, 
        `../artifacts/contracts/${contractName}.sol/${contractName}.json`
      );
      
      if (!fs.existsSync(artifactPath)) {
        console.log(`Artifact not found for ${contractName}. Make sure the contract is compiled.`);
        continue;
      }
      
      const artifact = require(artifactPath);
      const abi = artifact.abi;
      
      // Write to exports directory
      fs.writeFileSync(
        path.join(outputDir, `${contractName}.json`),
        JSON.stringify(abi, null, 2)
      );
      
      // Write to frontend directory if it exists
      if (frontendDirExists) {
        fs.writeFileSync(
          path.join(frontendOutputDir, `${contractName}.json`),
          JSON.stringify(abi, null, 2)
        );
      }
      
      console.log(`Exported ABI for ${contractName}`);
    } catch (error) {
      console.error(`Error exporting ABI for ${contractName}:`, error);
    }
  }
  
  // Create index.js for frontend
  if (frontendDirExists) {
    let indexContent = "// Auto-generated ABI exports\n\n";
    
    for (const contractName of contracts) {
      indexContent += `import ${contractName}Abi from './${contractName}.json';\n`;
    }
    
    indexContent += "\nexport {\n";
    contracts.forEach(contractName => {
      indexContent += `  ${contractName}Abi,\n`;
    });
    indexContent += "};\n";
    
    fs.writeFileSync(
      path.join(frontendOutputDir, "index.js"),
      indexContent
    );
    
    console.log("Created ABI index.js for frontend");
  }
  
  console.log("ABI export complete!");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
}); 