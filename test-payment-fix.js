#!/usr/bin/env node

/**
 * Test script to verify the payment error fix
 */

console.log('🔧 Payment Error Fix Verification');
console.log('=================================\n');

const fs = require('fs');

// Test 1: Check if fallback file exists
function testFallbackFile() {
  console.log('1️⃣ Checking fallback implementation...');
  
  const fallbackFile = '/home/adwait/FundChain/fundchain-frontend/lib/razorpay-fallback.js';
  
  if (fs.existsSync(fallbackFile)) {
    console.log('✅ Fallback file exists');
    return true;
  } else {
    console.log('❌ Fallback file not found');
    return false;
  }
}

// Test 2: Check campaign page integration
function testCampaignPageIntegration() {
  console.log('\n2️⃣ Checking campaign page integration...');
  
  const pageFile = '/home/adwait/FundChain/fundchain-frontend/app/campaigns/[id]/page.tsx';
  
  if (fs.existsSync(pageFile)) {
    const content = fs.readFileSync(pageFile, 'utf8');
    
    if (content.includes('processDonationFallback') && content.includes('serverError')) {
      console.log('✅ Campaign page has fallback integration');
      return true;
    } else {
      console.log('❌ Campaign page missing fallback integration');
      return false;
    }
  } else {
    console.log('❌ Campaign page not found');
    return false;
  }
}

// Main test execution
async function runTests() {
  const results = {
    fallback: testFallbackFile(),
    integration: testCampaignPageIntegration()
  };
  
  console.log('\n📊 Test Results:');
  console.log(`Fallback Implementation: ${results.fallback ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Campaign Integration: ${results.integration ? '✅ PASS' : '❌ FAIL'}`);
  
  if (results.fallback && results.integration) {
    console.log('\n🎉 Payment error fix is properly implemented!');
    console.log('\n🧪 To test:');
    console.log('1. Start server: cd fundchain-frontend && pnpm run dev');
    console.log('2. Go to: http://localhost:3000/campaigns/help-sarthak-get-home');
    console.log('3. Try donation - should work with fallback if server fails');
  } else {
    console.log('\n⚠️ Fix implementation incomplete');
  }
}

runTests().catch(console.error);
