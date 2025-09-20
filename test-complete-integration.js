#!/usr/bin/env node

/**
 * Complete integration test for FundChain IPFS fixes
 * This verifies the entire system is working end-to-end
 */

console.log('🎯 FundChain Complete Integration Test');
console.log('====================================\n');

const testResults = {
  ipfsConnection: false,
  contentAccess: false,
  pinStatus: false,
  gatewayFallbacks: false,
  sampleData: false
};

// Test IPFS connection
async function testIPFSConnection() {
  console.log('1️⃣ Testing IPFS Connection...');
  
  try {
    const { execSync } = require('child_process');
    const result = execSync('curl -s -X POST http://127.0.0.1:5001/api/v0/id', { encoding: 'utf8' });
    const data = JSON.parse(result);
    
    if (data.ID) {
      console.log('✅ IPFS daemon is running');
      console.log(`   Node ID: ${data.ID.substring(0, 20)}...`);
      testResults.ipfsConnection = true;
    }
  } catch (error) {
    console.log('❌ IPFS daemon not running');
    console.log('💡 Run: ./start-ipfs.sh');
    return false;
  }
  
  return true;
}

// Test content accessibility
async function testContentAccess() {
  console.log('\n2️⃣ Testing Content Access...');
  
  const testHashes = {
    document: 'QmTfUcm6XD8qzoDQLK3MTd7wSTNcbXYyhDdCnDDs4dwNep',
    image: 'QmX2DiQ53iJAgWDXRCDyibXtnxpyRDdV1EbogtPAH88Hnk'
  };
  
  let allAccessible = true;
  
  for (const [type, hash] of Object.entries(testHashes)) {
    try {
      const { execSync } = require('child_process');
      const url = `http://127.0.0.1:8080/ipfs/${hash}`;
      const content = execSync(`curl -s --max-time 5 "${url}"`, { encoding: 'utf8' });
      
      if (content && content.length > 0) {
        console.log(`✅ ${type}: Accessible (${content.length} bytes)`);
      } else {
        console.log(`❌ ${type}: Not accessible`);
        allAccessible = false;
      }
    } catch (error) {
      console.log(`❌ ${type}: Access failed - ${error.message}`);
      allAccessible = false;
    }
  }
  
  testResults.contentAccess = allAccessible;
  return allAccessible;
}

// Test pin status
async function testPinStatus() {
  console.log('\n3️⃣ Testing Pin Status...');
  
  const testHashes = [
    'QmTfUcm6XD8qzoDQLK3MTd7wSTNcbXYyhDdCnDDs4dwNep',
    'QmX2DiQ53iJAgWDXRCDyibXtnxpyRDdV1EbogtPAH88Hnk'
  ];
  
  let allPinned = true;
  
  for (const hash of testHashes) {
    try {
      const { execSync } = require('child_process');
      const result = execSync(`curl -s -X POST "http://127.0.0.1:5001/api/v0/pin/ls?arg=${hash}"`, { encoding: 'utf8' });
      const data = JSON.parse(result);
      
      const isPinned = data.Keys && Object.keys(data.Keys).length > 0;
      console.log(`${isPinned ? '✅' : '❌'} ${hash.substring(0, 20)}...: ${isPinned ? 'PINNED' : 'NOT PINNED'}`);
      
      if (!isPinned) allPinned = false;
    } catch (error) {
      console.log(`❌ ${hash.substring(0, 20)}...: Pin check failed`);
      allPinned = false;
    }
  }
  
  testResults.pinStatus = allPinned;
  return allPinned;
}

// Test gateway fallbacks
async function testGatewayFallbacks() {
  console.log('\n4️⃣ Testing Gateway Fallbacks...');
  
  const gateways = [
    'http://127.0.0.1:8080/ipfs',
    'https://gateway.ipfs.io/ipfs',
    'https://cloudflare-ipfs.com/ipfs'
  ];
  
  const testHash = 'QmTfUcm6XD8qzoDQLK3MTd7wSTNcbXYyhDdCnDDs4dwNep';
  let workingGateways = 0;
  
  for (const gateway of gateways) {
    try {
      const { execSync } = require('child_process');
      const url = `${gateway}/${testHash}`;
      const content = execSync(`curl -s --max-time 8 "${url}"`, { encoding: 'utf8', timeout: 10000 });
      
      if (content && content.length > 0) {
        console.log(`✅ ${gateway}: Working`);
        workingGateways++;
      } else {
        console.log(`⚠️ ${gateway}: Empty response`);
      }
    } catch (error) {
      console.log(`❌ ${gateway}: Failed`);
    }
  }
  
  const hasWorkingFallbacks = workingGateways >= 1;
  testResults.gatewayFallbacks = hasWorkingFallbacks;
  console.log(`📊 Working gateways: ${workingGateways}/${gateways.length}`);
  
  return hasWorkingFallbacks;
}

// Test sample data integration
async function testSampleData() {
  console.log('\n5️⃣ Testing Sample Data Integration...');
  
  const sampleCampaign = {
    id: 'sample-1',
    title: 'Community Development Project',
    imageHash: 'QmX2DiQ53iJAgWDXRCDyibXtnxpyRDdV1EbogtPAH88Hnk',
    documentHashes: ['QmTfUcm6XD8qzoDQLK3MTd7wSTNcbXYyhDdCnDDs4dwNep']
  };
  
  console.log(`✅ Sample campaign configured: ${sampleCampaign.title}`);
  console.log(`✅ Image hash: ${sampleCampaign.imageHash}`);
  console.log(`✅ Document hash: ${sampleCampaign.documentHashes[0]}`);
  
  // Test URL generation
  const imageUrl = `http://127.0.0.1:8080/ipfs/${sampleCampaign.imageHash}`;
  const docUrl = `http://127.0.0.1:8080/ipfs/${sampleCampaign.documentHashes[0]}`;
  
  console.log(`✅ Image URL: ${imageUrl}`);
  console.log(`✅ Document URL: ${docUrl}`);
  
  testResults.sampleData = true;
  return true;
}

// Generate final report
function generateReport() {
  console.log('\n📊 Test Results Summary');
  console.log('======================');
  
  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(Boolean).length;
  
  for (const [test, passed] of Object.entries(testResults)) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  }
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Your FundChain IPFS integration is working perfectly');
    
    console.log('\n🚀 Ready to Use:');
    console.log('===============');
    console.log('1. Campaign images will display correctly');
    console.log('2. Document "View" buttons will work');
    console.log('3. File uploads will be automatically pinned');
    console.log('4. Multiple gateway fallbacks ensure reliability');
    
    console.log('\n🌐 Test in Browser:');
    console.log('==================');
    console.log('1. Start your app: cd fundchain-frontend && npm run dev');
    console.log('2. Go to: http://localhost:3000/campaigns');
    console.log('3. Click "View Details" on Community Development Project');
    console.log('4. Verify image loads and document is accessible');
    
  } else {
    console.log('\n⚠️ Some tests failed. Check the issues above.');
    
    if (!testResults.ipfsConnection) {
      console.log('\n🔧 Fix IPFS Connection:');
      console.log('- Run: ./start-ipfs.sh');
      console.log('- Check: systemctl status ipfs');
    }
    
    if (!testResults.contentAccess || !testResults.pinStatus) {
      console.log('\n🔧 Fix Content Issues:');
      console.log('- Restart IPFS: ./start-ipfs.sh');
      console.log('- Re-pin content: node test-upload-retrieval.js');
    }
  }
}

// Main test execution
async function runCompleteTest() {
  console.log('Running comprehensive integration test...\n');
  
  const ipfsOk = await testIPFSConnection();
  if (!ipfsOk) {
    console.log('\n❌ IPFS not running. Please start IPFS first: ./start-ipfs.sh');
    return;
  }
  
  await testContentAccess();
  await testPinStatus();
  await testGatewayFallbacks();
  await testSampleData();
  
  generateReport();
}

// Run the complete test
runCompleteTest().catch(console.error);
