// Direct IPFS Test - does not rely on any libraries, just raw fetch to test connection

// IPFS details from ipfs.txt
const IPFS_API = 'http://127.0.0.1:5001/api/v0';
const PEER_ID = '12D3KooWNp5JabhQdHbeapJwxdQYwD2J7NV21pr84tv4GFghUeF7';

async function testIpfsConnection() {
  console.log('===== Direct IPFS Connection Test =====');
  console.log(`Testing connection to IPFS node at ${IPFS_API}`);
  
  try {
    // Simple ID call to test connection
    const response = await fetch(`${IPFS_API}/id`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('\n✅ SUCCESS: Connected to IPFS node');
    console.log(`Node ID: ${data.ID}`);
    console.log(`Agent Version: ${data.AgentVersion}`);
    
    // Check if the peer ID matches what we expect
    if (data.ID === PEER_ID) {
      console.log('\n✅ Peer ID matches expected value from ipfs.txt');
    } else {
      console.log(`\n⚠️ Warning: Peer ID ${data.ID} does not match expected value ${PEER_ID}`);
      console.log('This could indicate you are connected to a different IPFS node than expected.');
    }
    
    return data;
  } catch (error) {
    console.error('\n❌ ERROR: Failed to connect to IPFS node');
    console.error(`Error details: ${error.message}`);
    console.log('\nPlease check that:');
    console.log('1. IPFS daemon is running (ipfs daemon or IPFS Desktop)');
    console.log('2. IPFS API is accessible at http://127.0.0.1:5001');
    console.log('3. CORS is properly configured for the API');
    return null;
  }
}

// This function will run in browser
testIpfsConnection()
  .then((result) => {
    if (result) {
      console.log('\n===== Test completed successfully =====');
      console.log('Your IPFS connection is working correctly!');
    } else {
      console.log('\n===== Test failed =====');
      console.log('Please fix the IPFS connection issues before proceeding.');
    }
  })
  .catch((error) => {
    console.error('\nUnexpected error during test:', error);
  }); 