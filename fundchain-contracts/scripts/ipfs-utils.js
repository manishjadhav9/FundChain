const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// IPFS node configuration
const IPFS_API_URL = 'http://127.0.0.1:5001/api/v0';

// Function to check if IPFS node is running
async function checkIPFSConnection() {
  try {
    const response = await axios.post(`${IPFS_API_URL}/id`);
    console.log('IPFS node is running. ID:', response.data.ID);
    return true;
  } catch (error) {
    console.error('Error connecting to IPFS node:', error.message);
    return false;
  }
}

// Function to upload a file to IPFS
async function uploadFileToIPFS(filePath) {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    const response = await axios.post(`${IPFS_API_URL}/add`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    
    console.log('File uploaded to IPFS:', response.data);
    return response.data.Hash;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error.message);
    throw new Error(`Failed to upload file to IPFS: ${error.message}`);
  }
}

// Function to upload JSON data to IPFS
async function uploadJSONToIPFS(data) {
  try {
    const formData = new FormData();
    const jsonData = JSON.stringify(data);
    const buffer = Buffer.from(jsonData);
    
    formData.append('file', buffer, {
      filename: 'data.json',
      contentType: 'application/json',
    });
    
    const response = await axios.post(`${IPFS_API_URL}/add`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    console.log('JSON data uploaded to IPFS:', response.data);
    return response.data.Hash;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error.message);
    throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
  }
}

// Main function to test IPFS functionality
async function main() {
  // Check IPFS connection
  const isConnected = await checkIPFSConnection();
  if (!isConnected) {
    console.error('Please make sure your IPFS node is running at', IPFS_API_URL);
    process.exit(1);
  }
  
  // Create a test file
  const testFileName = 'test-file.txt';
  const testFilePath = path.join(__dirname, testFileName);
  fs.writeFileSync(testFilePath, 'This is a test file for IPFS upload.');
  
  try {
    // Upload test file
    console.log('Uploading test file to IPFS...');
    const fileHash = await uploadFileToIPFS(testFilePath);
    console.log('File uploaded successfully. IPFS hash:', fileHash);
    console.log('You can access it at:', `http://127.0.0.1:8080/ipfs/${fileHash}`);
    
    // Upload test JSON
    console.log('\nUploading test JSON to IPFS...');
    const jsonData = {
      name: 'Test Campaign',
      description: 'This is a test campaign for IPFS upload',
      date: new Date().toISOString(),
    };
    const jsonHash = await uploadJSONToIPFS(jsonData);
    console.log('JSON uploaded successfully. IPFS hash:', jsonHash);
    console.log('You can access it at:', `http://127.0.0.1:8080/ipfs/${jsonHash}`);
    
    // Clean up
    fs.unlinkSync(testFilePath);
    console.log('\nTest file removed.');
  } catch (error) {
    console.error('Error during IPFS upload test:', error.message);
  }
}

// Run the test if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  checkIPFSConnection,
  uploadFileToIPFS,
  uploadJSONToIPFS,
}; 