#!/usr/bin/env node

/**
 * IPFS Setup Script
 * 
 * This script helps configure IPFS for the FundChain application.
 * It checks if IPFS is running and configures CORS settings.
 */

const { exec } = require('child_process');
const fetch = require('node-fetch');
const chalk = require('chalk');

const IPFS_API = 'http://127.0.0.1:5001/api/v0';

// Check if IPFS is running
async function checkIpfsRunning() {
  try {
    const response = await fetch(`${IPFS_API}/id`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      return { running: false, error: `HTTP error: ${response.status}` };
    }
    
    const data = await response.json();
    return { running: true, id: data.ID, version: data.AgentVersion };
  } catch (error) {
    return { running: false, error: error.message };
  }
}

// Execute IPFS command
function execIpfsCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

// Configure CORS settings
async function configureCors() {
  try {
    console.log(chalk.yellow('Configuring IPFS CORS settings...'));
    
    // Set comprehensive CORS headers for better browser compatibility
    await execIpfsCommand(`ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'`);
    await execIpfsCommand(`ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST", "PUT", "DELETE", "OPTIONS"]'`);
    await execIpfsCommand(`ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization", "X-Requested-With", "Range", "Content-Type"]'`);
    await execIpfsCommand(`ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers '["Location", "WWW-Authenticate"]'`);
    await execIpfsCommand(`ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'`);
    
    console.log(chalk.green('✓ CORS settings configured successfully'));
    console.log(chalk.yellow('Please restart your IPFS node for the changes to take effect'));
    console.log(chalk.gray('  ipfs shutdown'));
    console.log(chalk.gray('  ipfs daemon'));
    
    return true;
  } catch (error) {
    console.error(chalk.red('✗ Error configuring CORS settings:'), error.message);
    console.log(chalk.yellow('Try running the following commands manually:'));
    console.log(chalk.gray(`
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST", "PUT", "DELETE", "OPTIONS"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization", "X-Requested-With", "Range", "Content-Type"]'
ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers '["Location", "WWW-Authenticate"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
    `));
    return false;
  }
}

// Attempt to restart IPFS daemon
async function restartIpfs() {
  console.log(chalk.yellow('Attempting to restart IPFS daemon...'));
  
  try {
    // Shutdown IPFS
    await execIpfsCommand('ipfs shutdown');
    console.log(chalk.green('✓ IPFS shutdown successful'));
    
    // Small delay to ensure proper shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start IPFS daemon
    console.log(chalk.yellow('Starting IPFS daemon...'));
    console.log(chalk.gray('This will run in a separate process. You may need to start it manually if this fails.'));
    
    // Start the daemon in the background
    exec('ipfs daemon', (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red('✗ Failed to start IPFS daemon:'), error.message);
      }
    });
    
    // Give some time for the daemon to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if the daemon is running
    const status = await checkIpfsRunning();
    if (status.running) {
      console.log(chalk.green('✓ IPFS daemon started successfully'));
      return true;
    } else {
      console.log(chalk.yellow('! IPFS daemon might not have started. Please start it manually.'));
      return false;
    }
  } catch (error) {
    console.error(chalk.red('✗ Error restarting IPFS:'), error.message);
    console.log(chalk.yellow('Please restart IPFS manually:'));
    console.log(chalk.gray('  ipfs daemon'));
    return false;
  }
}

// Check CORS configuration
async function checkCorsConfig() {
  try {
    console.log(chalk.yellow('Checking IPFS CORS configuration...'));
    
    const config = await execIpfsCommand('ipfs config API.HTTPHeaders');
    
    // Check if all required CORS headers are present
    const hasOrigin = config.includes('Access-Control-Allow-Origin');
    const hasMethods = config.includes('Access-Control-Allow-Methods');
    const hasHeaders = config.includes('Access-Control-Allow-Headers');
    const hasCredentials = config.includes('Access-Control-Allow-Credentials');
    
    const isConfigured = hasOrigin && hasMethods && hasHeaders && hasCredentials;
    
    if (isConfigured) {
      console.log(chalk.green('✓ CORS is properly configured'));
    } else {
      console.log(chalk.yellow('! CORS configuration is incomplete'));
      console.log(chalk.gray('Current configuration:'));
      console.log(config);
    }
    
    return isConfigured;
  } catch (error) {
    console.error(chalk.red('Error checking CORS configuration:'), error.message);
    return false;
  }
}

// Test the IPFS API with a simple add operation
async function testIpfsAdd() {
  console.log(chalk.yellow('Testing IPFS upload capability...'));
  
  try {
    // Create a simple form with a text file
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', Buffer.from('FundChain IPFS test'), { filename: 'test.txt' });
    
    // Upload to IPFS
    const response = await fetch(`${IPFS_API}/add?pin=true`, {
      method: 'POST',
      body: form
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(chalk.green(`✓ Upload test successful! CID: ${data.Hash}`));
    return true;
  } catch (error) {
    console.error(chalk.red('✗ Upload test failed:'), error.message);
    console.log(chalk.yellow('This may indicate a CORS or network issue.'));
    return false;
  }
}

// Main function
async function main() {
  console.log(chalk.cyan('=== FundChain IPFS Setup ==='));
  
  // Check if IPFS is running
  console.log(chalk.yellow('Checking if IPFS is running...'));
  const ipfsStatus = await checkIpfsRunning();
  
  if (!ipfsStatus.running) {
    console.error(chalk.red(`✗ IPFS is not running: ${ipfsStatus.error}`));
    console.log(chalk.yellow('Please start IPFS first:'));
    console.log(chalk.gray('  ipfs daemon'));
    return;
  }
  
  console.log(chalk.green(`✓ IPFS is running (Node ID: ${ipfsStatus.id})`));
  console.log(chalk.gray(`  Version: ${ipfsStatus.version}`));
  
  // Check CORS configuration
  const corsConfigured = await checkCorsConfig();
  
  // Configure CORS if needed
  let corsUpdated = false;
  if (!corsConfigured) {
    console.log(chalk.yellow('CORS needs to be configured.'));
    corsUpdated = await configureCors();
  }
  
  // Restart IPFS if CORS was updated
  if (corsUpdated) {
    await restartIpfs();
  }
  
  // Test the upload functionality
  await testIpfsAdd();
  
  console.log(chalk.cyan('\n=== Setup Complete ==='));
  console.log(chalk.yellow('Next Steps:'));
  console.log('1. Navigate to http://localhost:3000/ipfs-test to verify connection');
  console.log('2. Try creating a campaign with image upload');
  console.log('3. If you have issues, check the browser console for error messages');
}

// Handle errors in the main function
main().catch(error => {
  console.error(chalk.red('Critical Error:'), error);
  process.exit(1);
}); 