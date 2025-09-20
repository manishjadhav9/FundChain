#!/usr/bin/env node

/**
 * Create test campaigns in localStorage for testing the details page
 */

console.log('🏗️ Creating Test Campaigns for Details Page Testing');
console.log('==================================================\n');

// Create the test campaign that matches what the user showed in the screenshot
const testCampaigns = [
  {
    id: 'help-sarthak-get-home',
    title: 'help sarthak get home',
    description: 'Help Sarthak return home safely. He needs financial support for travel and accommodation expenses. This campaign aims to raise funds for his journey back home.',
    type: 'RELIGIOUS',
    imageHash: 'QmX2DiQ53iJAgWDXRCDyibXtnxpyRDdV1EbogtPAH88Hnk',
    imageCid: 'QmX2DiQ53iJAgWDXRCDyibXtnxpyRDdV1EbogtPAH88Hnk',
    targetAmount: '13.75',
    targetAmountInr: '1375000',
    status: 'VERIFIED',
    amountRaised: '0',
    raisedAmount: '0',
    raisedAmountInr: '0',
    percentRaised: 0,
    donorCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    owner: '0x1234567890123456789012345678901234567890',
    contractAddress: '0x1234567890123456789012345678901234567890',
    documentHashes: [
      'QmTfUcm6XD8qzoDQLK3MTd7wSTNcbXYyhDdCnDDs4dwNep'
    ],
    documentCids: [
      'QmTfUcm6XD8qzoDQLK3MTd7wSTNcbXYyhDdCnDDs4dwNep'
    ],
    organizer: {
      name: 'padyatra',
      role: 'Campaign Organizer',
      contact: 'padyatra@example.com'
    },
    organizerName: 'padyatra',
    organizerRole: 'Campaign Organizer',
    organizerContact: 'padyatra@example.com'
  },
  {
    id: 'sample-1',
    title: 'Community Development Project',
    description: 'Supporting local community development initiatives and infrastructure improvements.',
    type: 'NGO',
    imageHash: 'QmX2DiQ53iJAgWDXRCDyibXtnxpyRDdV1EbogtPAH88Hnk',
    imageCid: 'QmX2DiQ53iJAgWDXRCDyibXtnxpyRDdV1EbogtPAH88Hnk',
    targetAmount: '5.0',
    targetAmountInr: '1085000',
    status: 'VERIFIED',
    amountRaised: '2.1',
    raisedAmount: '2.1',
    raisedAmountInr: '455700',
    percentRaised: 42,
    donorCount: 156,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    verifiedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    owner: '0x2345678901234567890123456789012345678901',
    contractAddress: '0x2345678901234567890123456789012345678901',
    documentHashes: [
      'QmTfUcm6XD8qzoDQLK3MTd7wSTNcbXYyhDdCnDDs4dwNep'
    ],
    documentCids: [
      'QmTfUcm6XD8qzoDQLK3MTd7wSTNcbXYyhDdCnDDs4dwNep'
    ],
    organizer: {
      name: 'Community Leader',
      role: 'NGO Representative',
      contact: 'community@example.com'
    },
    organizerName: 'Community Leader',
    organizerRole: 'NGO Representative',
    organizerContact: 'community@example.com'
  }
];

console.log('📝 Test campaigns created:');
testCampaigns.forEach((campaign, index) => {
  console.log(`${index + 1}. ${campaign.title}`);
  console.log(`   ID: ${campaign.id}`);
  console.log(`   Type: ${campaign.type}`);
  console.log(`   Status: ${campaign.status}`);
  console.log(`   Image: ${campaign.imageHash}`);
  console.log(`   Documents: ${campaign.documentHashes.length} files`);
  console.log('');
});

console.log('✅ Test campaigns ready for localStorage injection');
console.log('\n💡 Instructions:');
console.log('================');
console.log('1. Open your browser developer tools');
console.log('2. Go to Console tab');
console.log('3. Paste the following code to add test campaigns:');
console.log('');
console.log('localStorage.setItem("fundchain-approved-campaigns", JSON.stringify(' + JSON.stringify(testCampaigns, null, 2) + '));');
console.log('');
console.log('4. Refresh the page and test the campaign details');
console.log('');
console.log('🔗 Test URLs:');
console.log('=============');
console.log('- http://localhost:3000/campaigns/help-sarthak-get-home');
console.log('- http://localhost:3000/campaigns/sample-1');
console.log('');
console.log('📋 Expected Results:');
console.log('===================');
console.log('✅ Campaign title and description should display correctly');
console.log('✅ Campaign image should load from IPFS');
console.log('✅ Documents tab should show 1 document with View button');
console.log('✅ Organizer tab should show organizer information');
console.log('✅ Progress bar should show correct percentage');
console.log('✅ Campaign statistics should be accurate');

// Also create a simple HTML file for easy testing
const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>FundChain Test Campaign Setup</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .campaign { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .button { background: #f97316; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        .button:hover { background: #ea580c; }
        pre { background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🧪 FundChain Campaign Details Test Setup</h1>
    
    <h2>📋 Test Campaigns</h2>
    ${testCampaigns.map(campaign => `
    <div class="campaign">
        <h3>${campaign.title}</h3>
        <p><strong>ID:</strong> ${campaign.id}</p>
        <p><strong>Type:</strong> ${campaign.type}</p>
        <p><strong>Status:</strong> ${campaign.status}</p>
        <p><strong>Organizer:</strong> ${campaign.organizer.name}</p>
        <p><strong>Target:</strong> ₹${campaign.targetAmountInr}</p>
    </div>
    `).join('')}
    
    <h2>🚀 Setup Instructions</h2>
    <ol>
        <li>Click the button below to add test campaigns to localStorage</li>
        <li>Go to <a href="http://localhost:3000/campaigns" target="_blank">http://localhost:3000/campaigns</a></li>
        <li>Click "View Details" on any campaign</li>
        <li>Verify that the correct campaign details are shown</li>
    </ol>
    
    <button class="button" onclick="setupTestCampaigns()">
        🏗️ Setup Test Campaigns
    </button>
    
    <h2>🔗 Direct Test Links</h2>
    <ul>
        <li><a href="http://localhost:3000/campaigns/help-sarthak-get-home" target="_blank">help sarthak get home</a></li>
        <li><a href="http://localhost:3000/campaigns/sample-1" target="_blank">Community Development Project</a></li>
    </ul>
    
    <h2>📝 localStorage Code</h2>
    <p>If the button doesn't work, copy and paste this code in your browser console:</p>
    <pre id="localStorageCode">localStorage.setItem("fundchain-approved-campaigns", JSON.stringify(${JSON.stringify(testCampaigns, null, 2)}));</pre>
    
    <script>
        function setupTestCampaigns() {
            const campaigns = ${JSON.stringify(testCampaigns)};
            localStorage.setItem("fundchain-approved-campaigns", JSON.stringify(campaigns));
            alert("✅ Test campaigns added to localStorage!\\n\\nNow go to http://localhost:3000/campaigns and test the View Details buttons.");
        }
        
        // Auto-setup on page load
        window.addEventListener('load', function() {
            console.log('🧪 FundChain Test Setup Ready');
            console.log('Click the setup button to add test campaigns to localStorage');
        });
    </script>
</body>
</html>`;

require('fs').writeFileSync('/home/adwait/FundChain/test-campaigns-setup.html', htmlContent);
console.log('📄 Created test setup page: /home/adwait/FundChain/test-campaigns-setup.html');
console.log('🌐 Open this file in your browser for easy setup!');
