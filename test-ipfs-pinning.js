#!/usr/bin/env node

/**
 * Test script for IPFS pinning functionality
 * This script tests various IPFS pinning scenarios
 */

console.log('🧪 Testing IPFS Pinning Setup...\n');

// Mock fetch for Node.js environment
const fetch = require('node-fetch');
global.fetch = fetch;

// Test IPFS connection
async function testIPFSConnection() {
  console.log('📡 Testing IPFS Connection...');
  
  try {
    // Test local IPFS API
    const response = await fetch('http://127.0.0.1:5001/api/v0/id', {
      method: 'POST',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Local IPFS node is running');
      console.log(`   Node ID: ${data.ID}`);
      console.log(`   Agent Version: ${data.AgentVersion}`);
      return true;
    } else {
      console.log('❌ Local IPFS node not responding');
      return false;
    }
  } catch (error) {
    console.log('❌ Local IPFS node not available:', error.message);
    return false;
  }
}

// Test IPFS Gateway
async function testIPFSGateway() {
  console.log('\n🌐 Testing IPFS Gateway...');
  
  // Test with a known hash (IPFS logo)
  const testHash = 'QmTZRVmhNi6AAuW2XwLykCyJZVcXDK2xE6oA5KG6vfbqCZ';
  const gateways = [
    'http://127.0.0.1:8080/ipfs',
    'https://gateway.ipfs.io/ipfs',
    'https://cloudflare-ipfs.com/ipfs',
    'https://ipfs.io/ipfs'
  ];
  
  for (const gateway of gateways) {
    try {
      const url = `${gateway}/${testHash}`;
      console.log(`🔄 Testing: ${url}`);
      
      const response = await fetch(url, {
        method: 'HEAD',
        timeout: 8000
      });
      
      if (response.ok) {
        console.log(`✅ Gateway working: ${gateway}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      } else {
        console.log(`⚠️ Gateway returned ${response.status}: ${gateway}`);
      }
    } catch (error) {
      console.log(`❌ Gateway failed: ${gateway} - ${error.message}`);
    }
  }
}

// Test pinning commands
async function testPinningCommands() {
  console.log('\n📌 Testing Pinning Commands...');
  
  const testHash = 'QmTZRVmhNi6AAuW2XwLykCyJZVcXDK2xE6oA5KG6vfbqCZ';
  
  try {
    // Test pin add
    console.log(`🔄 Attempting to pin: ${testHash}`);
    const pinResponse = await fetch(`http://127.0.0.1:5001/api/v0/pin/add?arg=${testHash}`, {
      method: 'POST',
      timeout: 15000
    });
    
    if (pinResponse.ok) {
      const pinData = await pinResponse.json();
      console.log('✅ Successfully pinned hash');
      console.log(`   Pins: ${pinData.Pins ? pinData.Pins.join(', ') : 'N/A'}`);
    } else {
      console.log(`⚠️ Pin request returned: ${pinResponse.status}`);
    }
    
    // Test pin list
    console.log('🔄 Checking pin status...');
    const listResponse = await fetch(`http://127.0.0.1:5001/api/v0/pin/ls?arg=${testHash}`, {
      method: 'POST',
      timeout: 10000
    });
    
    if (listResponse.ok) {
      const listData = await listResponse.json();
      const isPinned = listData.Keys && Object.keys(listData.Keys).length > 0;
      console.log(`✅ Pin status check complete`);
      console.log(`   Is Pinned: ${isPinned}`);
      if (isPinned) {
        console.log(`   Pin Type: ${Object.values(listData.Keys)[0].Type}`);
      }
    } else {
      console.log(`⚠️ Pin list request returned: ${listResponse.status}`);
    }
    
  } catch (error) {
    console.log('❌ Pinning test failed:', error.message);
  }
}

// Test environment variables for pinning services
function testPinningServiceConfig() {
  console.log('\n🔑 Testing Pinning Service Configuration...');
  
  const services = {
    'Pinata': {
      apiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY,
      secretKey: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY
    },
    'Web3.Storage': {
      token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN
    },
    'NFT.Storage': {
      token: process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN
    }
  };
  
  for (const [serviceName, config] of Object.entries(services)) {
    console.log(`🔍 ${serviceName}:`);
    
    if (serviceName === 'Pinata') {
      if (config.apiKey && config.secretKey) {
        console.log('   ✅ API Key and Secret Key configured');
        console.log(`   📝 API Key: ${config.apiKey.substring(0, 8)}...`);
      } else {
        console.log('   ❌ API Key or Secret Key missing');
        console.log('   💡 Set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY');
      }
    } else {
      if (config.token) {
        console.log('   ✅ Token configured');
        console.log(`   📝 Token: ${config.token.substring(0, 8)}...`);
      } else {
        console.log('   ❌ Token missing');
        console.log(`   💡 Set NEXT_PUBLIC_${serviceName.toUpperCase().replace('.', '_')}_TOKEN`);
      }
    }
  }
}

// Test pinning service APIs
async function testPinningServiceAPIs() {
  console.log('\n🌐 Testing Pinning Service APIs...');
  
  // Test Pinata authentication
  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const pinataSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
  
  if (pinataApiKey && pinataSecretKey) {
    try {
      console.log('🔄 Testing Pinata authentication...');
      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers: {
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretKey
        },
        timeout: 10000
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Pinata authentication successful');
        console.log(`   Message: ${data.message}`);
      } else {
        console.log(`❌ Pinata authentication failed: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Pinata API test failed:', error.message);
    }
  } else {
    console.log('⚠️ Pinata credentials not configured, skipping API test');
  }
  
  // Test Web3.Storage
  const web3Token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;
  
  if (web3Token) {
    try {
      console.log('🔄 Testing Web3.Storage authentication...');
      const response = await fetch('https://api.web3.storage/user/uploads', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${web3Token}`
        },
        timeout: 10000
      });
      
      if (response.ok) {
        console.log('✅ Web3.Storage authentication successful');
      } else {
        console.log(`❌ Web3.Storage authentication failed: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Web3.Storage API test failed:', error.message);
    }
  } else {
    console.log('⚠️ Web3.Storage token not configured, skipping API test');
  }
}

// Generate setup recommendations
function generateRecommendations() {
  console.log('\n💡 Setup Recommendations:');
  console.log('========================');
  
  console.log('\n🏠 For Local Development:');
  console.log('1. Run: ./setup-ipfs-node.sh');
  console.log('2. Verify: systemctl status ipfs');
  console.log('3. Test: curl http://127.0.0.1:5001/api/v0/id');
  
  console.log('\n☁️ For Production (Choose one or more):');
  console.log('1. Pinata (Paid, reliable):');
  console.log('   - Sign up: https://pinata.cloud');
  console.log('   - Get API keys and add to .env.local');
  console.log('   - Set: NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY');
  
  console.log('\n2. Web3.Storage (Free):');
  console.log('   - Sign up: https://web3.storage');
  console.log('   - Get token and add to .env.local');
  console.log('   - Set: NEXT_PUBLIC_WEB3_STORAGE_TOKEN');
  
  console.log('\n3. NFT.Storage (Free for NFTs):');
  console.log('   - Sign up: https://nft.storage');
  console.log('   - Get token and add to .env.local');
  console.log('   - Set: NEXT_PUBLIC_NFT_STORAGE_TOKEN');
  
  console.log('\n🔧 Manual Pinning Commands:');
  console.log('- Pin hash: ipfs pin add QmYourHashHere');
  console.log('- Check pins: ipfs pin ls');
  console.log('- Remove pin: ipfs pin rm QmYourHashHere');
  console.log('- Cleanup: ipfs repo gc');
}

// Main test function
async function runTests() {
  console.log('🎯 IPFS Pinning Test Suite');
  console.log('==========================\n');
  
  // Test basic IPFS functionality
  const ipfsRunning = await testIPFSConnection();
  
  if (ipfsRunning) {
    await testIPFSGateway();
    await testPinningCommands();
  }
  
  // Test pinning service configuration
  testPinningServiceConfig();
  
  // Test pinning service APIs
  await testPinningServiceAPIs();
  
  // Generate recommendations
  generateRecommendations();
  
  console.log('\n🎉 IPFS Pinning Test Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Follow the recommendations above');
  console.log('2. Configure your preferred pinning method');
  console.log('3. Test document upload in your application');
  console.log('4. Verify documents are accessible via multiple gateways');
}

// Handle environment variables in Node.js
if (typeof process !== 'undefined' && process.env) {
  // Load environment variables from .env.local if available
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    // dotenv not available, continue without it
  }
}

// Run the tests
runTests().catch(console.error);
