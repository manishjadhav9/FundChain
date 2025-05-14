#!/usr/bin/env node

/**
 * Simple IPFS Upload Test
 * 
 * This script tests a direct upload to IPFS with minimal dependencies
 * It helps identify if there are issues with the IPFS connection
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');

// IPFS API URL
const IPFS_API = 'http://127.0.0.1:5001/api/v0';
const IPFS_GATEWAY = 'http://127.0.0.1:8080/ipfs';

// Test file to upload (create a small test file)
const TEST_FILE_PATH = path.join(__dirname, 'test-file.txt');

// Create a test file if it doesn't exist
if (!fs.existsSync(TEST_FILE_PATH)) {
  fs.writeFileSync(TEST_FILE_PATH, 'This is a test file for IPFS upload from FundChain');
  console.log('Created test file:', TEST_FILE_PATH);
}

// Test basic IPFS connection
async function testConnection() {
  try {
    console.log('Testing connection to IPFS node...');
    const response = await fetch(`${IPFS_API}/id`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Successfully connected to IPFS node');
    console.log('Node ID:', data.ID);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to IPFS node:', error.message);
    console.log('Make sure your IPFS daemon is running.');
    return false;
  }
}

// Test file upload to IPFS
async function testUpload() {
  try {
    console.log('\nTesting file upload to IPFS...');
    console.log('Reading file:', TEST_FILE_PATH);
    
    const fileStream = fs.createReadStream(TEST_FILE_PATH);
    const formData = new FormData();
    formData.append('file', fileStream);
    
    console.log('Uploading file...');
    const response = await fetch(`${IPFS_API}/add`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ File uploaded successfully');
    console.log('File hash (CID):', data.Hash);
    console.log('File size:', data.Size, 'bytes');
    console.log('Gateway URL:', `${IPFS_GATEWAY}/${data.Hash}`);
    
    return data.Hash;
  } catch (error) {
    console.error('❌ Failed to upload file to IPFS:', error.message);
    console.log('Make sure your IPFS daemon is running and CORS is configured correctly.');
    return null;
  }
}

// Test fetch from IPFS
async function testFetch(hash) {
  if (!hash) return;
  
  try {
    console.log('\nTesting fetch from IPFS...');
    const gatewayURL = `${IPFS_GATEWAY}/${hash}`;
    console.log('Fetching from gateway:', gatewayURL);
    
    const response = await fetch(gatewayURL);
    
    if (!response.ok) {
      throw new Error(`Fetch failed with status: ${response.status}`);
    }
    
    const content = await response.text();
    console.log('✅ Content fetched successfully:');
    console.log('---');
    console.log(content);
    console.log('---');
  } catch (error) {
    console.error('❌ Failed to fetch from IPFS gateway:', error.message);
  }
}

// Main function
async function main() {
  console.log('=== IPFS Simple Test ===');
  
  // Test connection
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.log('\n❌ Cannot proceed with upload test because connection failed.');
    process.exit(1);
  }
  
  // Test upload
  const hash = await testUpload();
  
  if (hash) {
    // Test fetch
    await testFetch(hash);
    
    console.log('\n✅ All tests completed successfully!');
  } else {
    console.log('\n❌ Upload test failed, cannot proceed with fetch test.');
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 