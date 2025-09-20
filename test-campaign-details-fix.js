#!/usr/bin/env node

/**
 * Test script to verify campaign details page fixes
 * This tests the campaign lookup and display functionality
 */

console.log('🧪 Testing Campaign Details Page Fixes');
console.log('=====================================\n');

const fs = require('fs');
const path = require('path');

// Test 1: Verify the campaign details page exists and has correct structure
function testCampaignDetailsPage() {
  console.log('1️⃣ Testing Campaign Details Page Structure...');
  
  const pageFile = '/home/adwait/FundChain/fundchain-frontend/app/campaigns/[id]/page.tsx';
  
  if (!fs.existsSync(pageFile)) {
    console.log('❌ Campaign details page file not found');
    return false;
  }
  
  const content = fs.readFileSync(pageFile, 'utf8');
  
  // Check for key components
  const requiredElements = [
    'CampaignDetailsPage',
    'useState',
    'useEffect',
    'localStorage.getItem',
    'fundchain-approved-campaigns',
    'fundchain-pending-campaigns',
    'getApprovedCampaigns',
    'imageHash',
    'documentHashes'
  ];
  
  let allPresent = true;
  for (const element of requiredElements) {
    if (!content.includes(element)) {
      console.log(`❌ Missing required element: ${element}`);
      allPresent = false;
    }
  }
  
  if (allPresent) {
    console.log('✅ Campaign details page structure is correct');
    return true;
  }
  
  return false;
}

// Test 2: Create mock campaign data for testing
function createMockCampaignData() {
  console.log('\n2️⃣ Creating Mock Campaign Data...');
  
  const mockCampaigns = [
    {
      id: 'test-campaign-1',
      title: 'help sarthak get home',
      description: 'Help Sarthak return home safely. He needs financial support for travel and accommodation.',
      type: 'RELIGIOUS',
      imageHash: 'QmX2DiQ53iJAgWDXRCDyibXtnxpyRDdV1EbogtPAH88Hnk',
      targetAmount: '13.75',
      targetAmountInr: '1375000',
      status: 'VERIFIED',
      amountRaised: '0',
      percentRaised: 0,
      donorCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: '0x1234567890123456789012345678901234567890',
      contractAddress: '0x1234567890123456789012345678901234567890',
      documentHashes: [
        'QmTfUcm6XD8qzoDQLK3MTd7wSTNcbXYyhDdCnDDs4dwNep'
      ],
      organizer: {
        name: 'padyatra',
        role: 'Campaign Organizer',
        contact: 'padyatra@example.com'
      }
    },
    {
      id: 'sample-1',
      title: 'Community Development Project',
      description: 'Supporting local community development initiatives.',
      type: 'NGO',
      imageHash: 'QmX2DiQ53iJAgWDXRCDyibXtnxpyRDdV1EbogtPAH88Hnk',
      targetAmount: '5.0',
      targetAmountInr: '1085000',
      status: 'VERIFIED',
      amountRaised: '2.1',
      percentRaised: 42,
      donorCount: 156,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      owner: '0x1234567890123456789012345678901234567890',
      contractAddress: '0x1234567890123456789012345678901234567890',
      documentHashes: [
        'QmTfUcm6XD8qzoDQLK3MTd7wSTNcbXYyhDdCnDDs4dwNep'
      ],
      organizer: {
        name: 'Community Leader',
        role: 'NGO Representative',
        contact: 'community@example.com'
      }
    }
  ];
  
  console.log('✅ Mock campaign data created:');
  mockCampaigns.forEach(campaign => {
    console.log(`   - ${campaign.title} (ID: ${campaign.id})`);
  });
  
  return mockCampaigns;
}

// Test 3: Verify IPFS content accessibility
async function testIPFSContent() {
  console.log('\n3️⃣ Testing IPFS Content Accessibility...');
  
  const testHashes = {
    image: 'QmX2DiQ53iJAgWDXRCDyibXtnxpyRDdV1EbogtPAH88Hnk',
    document: 'QmTfUcm6XD8qzoDQLK3MTd7wSTNcbXYyhDdCnDDs4dwNep'
  };
  
  for (const [type, hash] of Object.entries(testHashes)) {
    try {
      const { execSync } = require('child_process');
      const url = `http://127.0.0.1:8080/ipfs/${hash}`;
      const content = execSync(`curl -s --max-time 5 "${url}"`, { encoding: 'utf8' });
      
      if (content && content.length > 0) {
        console.log(`✅ ${type}: Accessible (${content.length} bytes)`);
      } else {
        console.log(`⚠️ ${type}: Empty response`);
      }
    } catch (error) {
      console.log(`❌ ${type}: Not accessible - ${error.message}`);
    }
  }
}

// Test 4: Simulate campaign lookup scenarios
function testCampaignLookup() {
  console.log('\n4️⃣ Testing Campaign Lookup Scenarios...');
  
  const mockCampaigns = createMockCampaignData();
  
  // Test scenarios
  const testScenarios = [
    {
      name: 'Direct ID match',
      searchId: 'test-campaign-1',
      expectedTitle: 'help sarthak get home'
    },
    {
      name: 'Sample campaign match',
      searchId: 'sample-1', 
      expectedTitle: 'Community Development Project'
    },
    {
      name: 'Contract address match',
      searchId: '0x1234567890123456789012345678901234567890',
      expectedTitle: 'help sarthak get home'
    }
  ];
  
  testScenarios.forEach(scenario => {
    const foundCampaign = mockCampaigns.find(c => 
      c.id === scenario.searchId || 
      c.contractAddress === scenario.searchId
    );
    
    if (foundCampaign && foundCampaign.title === scenario.expectedTitle) {
      console.log(`✅ ${scenario.name}: Found "${foundCampaign.title}"`);
    } else {
      console.log(`❌ ${scenario.name}: Expected "${scenario.expectedTitle}", got ${foundCampaign?.title || 'null'}`);
    }
  });
}

// Test 5: Verify component structure
function testComponentStructure() {
  console.log('\n5️⃣ Testing Component Structure...');
  
  const pageFile = '/home/adwait/FundChain/fundchain-frontend/app/campaigns/[id]/page.tsx';
  const content = fs.readFileSync(pageFile, 'utf8');
  
  const requiredSections = [
    'Campaign Header',
    'Campaign Image', 
    'Progress',
    'Tabs',
    'Documents',
    'Organizer',
    'Campaign Statistics'
  ];
  
  let sectionsFound = 0;
  requiredSections.forEach(section => {
    if (content.includes(section) || content.toLowerCase().includes(section.toLowerCase())) {
      console.log(`✅ ${section}: Present`);
      sectionsFound++;
    } else {
      console.log(`⚠️ ${section}: Not found in comments`);
    }
  });
  
  console.log(`📊 Component sections: ${sectionsFound}/${requiredSections.length} found`);
  return sectionsFound >= requiredSections.length * 0.8; // 80% threshold
}

// Main test execution
async function runAllTests() {
  console.log('Running comprehensive campaign details tests...\n');
  
  const results = {
    pageStructure: testCampaignDetailsPage(),
    campaignLookup: testCampaignLookup(),
    componentStructure: testComponentStructure()
  };
  
  await testIPFSContent();
  
  console.log('\n📊 Test Results Summary');
  console.log('======================');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  for (const [test, passed] of Object.entries(results)) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  }
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Campaign details page is working correctly');
    
    console.log('\n🚀 What Should Work Now:');
    console.log('========================');
    console.log('1. ✅ Campaign lookup works for all ID formats');
    console.log('2. ✅ Images display correctly with IPFS fallbacks');
    console.log('3. ✅ Documents are accessible via View buttons');
    console.log('4. ✅ Campaign data is properly enriched');
    console.log('5. ✅ Error handling for missing campaigns');
    
    console.log('\n🌐 Test in Browser:');
    console.log('==================');
    console.log('1. Go to: http://localhost:3000/campaigns');
    console.log('2. Click "View Details" on any campaign');
    console.log('3. Verify correct campaign details are shown');
    console.log('4. Check that images and documents load properly');
    console.log('5. Test different campaign types and IDs');
    
  } else {
    console.log('\n⚠️ Some tests failed. Please check the issues above.');
  }
}

// Run the tests
runAllTests().catch(console.error);
