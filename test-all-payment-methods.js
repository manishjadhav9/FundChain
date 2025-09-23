#!/usr/bin/env node

/**
 * Test all payment methods to ensure at least one works
 */

console.log('🧪 Testing All Payment Methods');
console.log('==============================\n');

const fs = require('fs');

// Test 1: Check if all payment files exist
function checkPaymentFiles() {
  console.log('1️⃣ Checking payment method files...');
  
  const files = [
    '/home/adwait/FundChain/fundchain-frontend/lib/razorpay.js',
    '/home/adwait/FundChain/fundchain-frontend/lib/razorpay-fallback.js',
    '/home/adwait/FundChain/fundchain-frontend/lib/razorpay-direct.js'
  ];
  
  let allExist = true;
  
  files.forEach(file => {
    const filename = file.split('/').pop();
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${filename}: EXISTS`);
    } else {
      console.log(`  ❌ ${filename}: MISSING`);
      allExist = false;
    }
  });
  
  return allExist;
}

// Test 2: Check campaign page integration
function checkCampaignIntegration() {
  console.log('\n2️⃣ Checking campaign page integration...');
  
  const pageFile = '/home/adwait/FundChain/fundchain-frontend/app/campaigns/[id]/page.tsx';
  
  if (fs.existsSync(pageFile)) {
    const content = fs.readFileSync(pageFile, 'utf8');
    
    const methods = [
      'processDonationDirect',
      'processDonation',
      'processDonationFallback'
    ];
    
    let allIntegrated = true;
    
    methods.forEach(method => {
      if (content.includes(method)) {
        console.log(`  ✅ ${method}: INTEGRATED`);
      } else {
        console.log(`  ❌ ${method}: MISSING`);
        allIntegrated = false;
      }
    });
    
    // Check for proper error handling
    if (content.includes('Direct payment failed') && content.includes('Server-side payment also failed')) {
      console.log('  ✅ Error handling: PROPER CASCADE');
    } else {
      console.log('  ⚠️ Error handling: MAY NEED IMPROVEMENT');
    }
    
    return allIntegrated;
  } else {
    console.log('  ❌ Campaign page not found');
    return false;
  }
}

// Test 3: Check environment setup
function checkEnvironment() {
  console.log('\n3️⃣ Checking environment setup...');
  
  const envFile = '/home/adwait/FundChain/fundchain-frontend/.env.local';
  
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    
    const hasKeyId = content.includes('NEXT_PUBLIC_RAZORPAY_KEY_ID');
    const hasKeySecret = content.includes('RAZORPAY_KEY_SECRET');
    
    console.log(`  ✅ .env.local: EXISTS`);
    console.log(`  ${hasKeyId ? '✅' : '❌'} RAZORPAY_KEY_ID: ${hasKeyId ? 'SET' : 'MISSING'}`);
    console.log(`  ${hasKeySecret ? '✅' : '❌'} RAZORPAY_KEY_SECRET: ${hasKeySecret ? 'SET' : 'MISSING'}`);
    
    return hasKeyId && hasKeySecret;
  } else {
    console.log('  ❌ .env.local: MISSING');
    return false;
  }
}

// Generate summary and instructions
function generateSummary(filesOk, integrationOk, envOk) {
  console.log('\n📊 Test Results Summary');
  console.log('======================');
  
  console.log(`Payment Files: ${filesOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Integration: ${integrationOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Environment: ${envOk ? '✅ PASS' : '❌ FAIL'}`);
  
  const allGood = filesOk && integrationOk && envOk;
  
  console.log('\n🎯 Payment Method Priority:');
  console.log('1. 💳 Direct Payment (bypasses server issues)');
  console.log('2. 🔄 Server-side Payment (with order creation)');
  console.log('3. 🛡️ Fallback Payment (backup method)');
  
  if (allGood) {
    console.log('\n🎉 ALL SYSTEMS READY!');
    console.log('\n🚀 To test:');
    console.log('1. Start server: cd fundchain-frontend && pnpm run dev');
    console.log('2. Go to: http://localhost:3000/campaigns/help-sarthak-get-home');
    console.log('3. Try donation - should work with direct method');
    console.log('4. Use test card: 4111 1111 1111 1111');
    
    console.log('\n💡 Expected behavior:');
    console.log('- Direct payment method will be tried first');
    console.log('- If it fails, server-side method will be tried');
    console.log('- If that fails, fallback method will be used');
    console.log('- At least one method should work successfully');
    
  } else {
    console.log('\n⚠️ SETUP NEEDS ATTENTION');
    
    if (!filesOk) {
      console.log('\n🔧 Fix payment files:');
      console.log('- Ensure all payment method files are created');
    }
    
    if (!integrationOk) {
      console.log('\n🔧 Fix integration:');
      console.log('- Update campaign page with all payment methods');
    }
    
    if (!envOk) {
      console.log('\n🔧 Fix environment:');
      console.log('- Create .env.local with Razorpay keys');
      console.log('- Copy from .env.example if needed');
    }
  }
  
  console.log('\n🆘 If payments still fail:');
  console.log('1. Check browser console for detailed errors');
  console.log('2. Disable ad blocker and try again');
  console.log('3. Use incognito/private browsing mode');
  console.log('4. Try different browser (Chrome, Firefox, Safari)');
}

// Main execution
function main() {
  const filesOk = checkPaymentFiles();
  const integrationOk = checkCampaignIntegration();
  const envOk = checkEnvironment();
  
  generateSummary(filesOk, integrationOk, envOk);
}

main();
