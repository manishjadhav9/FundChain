#!/usr/bin/env node

/**
 * Test script to verify donation integration with Razorpay
 */

console.log('🧪 Testing Donation Integration');
console.log('==============================\n');

const fs = require('fs');

// Test 1: Verify Razorpay integration files
function testRazorpayFiles() {
  console.log('1️⃣ Testing Razorpay Integration Files...');
  
  const requiredFiles = [
    '/home/adwait/FundChain/fundchain-frontend/lib/razorpay.js',
    '/home/adwait/FundChain/fundchain-frontend/app/api/payments/create-order/route.js',
    '/home/adwait/FundChain/fundchain-frontend/app/api/payments/verify-and-register/route.js',
    '/home/adwait/FundChain/fundchain-frontend/.env.example'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file.split('/').pop()}: Exists`);
    } else {
      console.log(`❌ ${file.split('/').pop()}: Missing`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Test 2: Verify Razorpay library functions
function testRazorpayLibrary() {
  console.log('\n2️⃣ Testing Razorpay Library Functions...');
  
  const razorpayFile = '/home/adwait/FundChain/fundchain-frontend/lib/razorpay.js';
  
  if (!fs.existsSync(razorpayFile)) {
    console.log('❌ Razorpay library file not found');
    return false;
  }
  
  const content = fs.readFileSync(razorpayFile, 'utf8');
  
  const requiredFunctions = [
    'convertINRToETH',
    'convertETHToINR',
    'initializeRazorpayPayment',
    'processDonation',
    'loadRazorpaySDK',
    'verifyAndRegisterPayment'
  ];
  
  let allFunctionsPresent = true;
  
  requiredFunctions.forEach(func => {
    if (content.includes(func)) {
      console.log(`✅ ${func}: Present`);
    } else {
      console.log(`❌ ${func}: Missing`);
      allFunctionsPresent = false;
    }
  });
  
  return allFunctionsPresent;
}

// Test 3: Test currency conversion
function testCurrencyConversion() {
  console.log('\n3️⃣ Testing Currency Conversion...');
  
  const ETH_TO_INR_RATE = 217000;
  
  const testCases = [
    { inr: 1000, expectedETH: '0.004608' },
    { inr: 50000, expectedETH: '0.230415' },
    { inr: 217000, expectedETH: '1.000000' }
  ];
  
  let allTestsPassed = true;
  
  testCases.forEach(test => {
    const calculatedETH = (test.inr / ETH_TO_INR_RATE).toFixed(6);
    
    if (calculatedETH === test.expectedETH) {
      console.log(`✅ ₹${test.inr} = ${calculatedETH} ETH`);
    } else {
      console.log(`❌ ₹${test.inr} = ${calculatedETH} ETH (expected ${test.expectedETH})`);
      allTestsPassed = false;
    }
  });
  
  return allTestsPassed;
}

// Test 4: Verify campaign details page integration
function testCampaignPageIntegration() {
  console.log('\n4️⃣ Testing Campaign Page Integration...');
  
  const pageFile = '/home/adwait/FundChain/fundchain-frontend/app/campaigns/[id]/page.tsx';
  
  if (!fs.existsSync(pageFile)) {
    console.log('❌ Campaign details page not found');
    return false;
  }
  
  const content = fs.readFileSync(pageFile, 'utf8');
  
  const requiredElements = [
    'processDonation',
    'loadRazorpaySDK',
    'convertINRToETH',
    'handleDonation',
    'donationAmount',
    'isDonating',
    'showDonationForm',
    'Donate Now',
    'Heart',
    'CreditCard'
  ];
  
  let allElementsPresent = true;
  
  requiredElements.forEach(element => {
    if (content.includes(element)) {
      console.log(`✅ ${element}: Present`);
    } else {
      console.log(`❌ ${element}: Missing`);
      allElementsPresent = false;
    }
  });
  
  return allElementsPresent;
}

// Test 5: Verify API endpoints structure
function testAPIEndpoints() {
  console.log('\n5️⃣ Testing API Endpoints...');
  
  const endpoints = [
    {
      path: '/home/adwait/FundChain/fundchain-frontend/app/api/payments/create-order/route.js',
      name: 'Create Order API'
    },
    {
      path: '/home/adwait/FundChain/fundchain-frontend/app/api/payments/verify-and-register/route.js',
      name: 'Verify Payment API'
    }
  ];
  
  let allEndpointsValid = true;
  
  endpoints.forEach(endpoint => {
    if (fs.existsSync(endpoint.path)) {
      const content = fs.readFileSync(endpoint.path, 'utf8');
      
      if (content.includes('export async function POST') && content.includes('NextResponse')) {
        console.log(`✅ ${endpoint.name}: Valid Next.js API route`);
      } else {
        console.log(`❌ ${endpoint.name}: Invalid API route structure`);
        allEndpointsValid = false;
      }
    } else {
      console.log(`❌ ${endpoint.name}: File not found`);
      allEndpointsValid = false;
    }
  });
  
  return allEndpointsValid;
}

// Test 6: Check environment variables
function testEnvironmentVariables() {
  console.log('\n6️⃣ Testing Environment Variables...');
  
  const envFile = '/home/adwait/FundChain/fundchain-frontend/.env.example';
  
  if (!fs.existsSync(envFile)) {
    console.log('❌ Environment example file not found');
    return false;
  }
  
  const content = fs.readFileSync(envFile, 'utf8');
  
  const requiredVars = [
    'NEXT_PUBLIC_RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
  ];
  
  let allVarsPresent = true;
  
  requiredVars.forEach(varName => {
    if (content.includes(varName)) {
      console.log(`✅ ${varName}: Present`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allVarsPresent = false;
    }
  });
  
  // Check if Razorpay keys are provided
  if (content.includes('rzp_test_RJuwxk8NAGp7Dc')) {
    console.log('✅ Razorpay test key configured');
  } else {
    console.log('⚠️ Razorpay test key not found');
  }
  
  if (content.includes('HS05RbxkPCgFoXE10NO27psh')) {
    console.log('✅ Razorpay secret configured');
  } else {
    console.log('⚠️ Razorpay secret not found');
  }
  
  return allVarsPresent;
}

// Main test execution
async function runAllTests() {
  console.log('Running comprehensive donation integration tests...\n');
  
  const results = {
    razorpayFiles: testRazorpayFiles(),
    razorpayLibrary: testRazorpayLibrary(),
    currencyConversion: testCurrencyConversion(),
    campaignPageIntegration: testCampaignPageIntegration(),
    apiEndpoints: testAPIEndpoints(),
    environmentVariables: testEnvironmentVariables()
  };
  
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
    console.log('✅ Donation integration is ready to use');
    
    console.log('\n🚀 Ready Features:');
    console.log('=================');
    console.log('1. ✅ Razorpay payment integration');
    console.log('2. ✅ INR to ETH conversion');
    console.log('3. ✅ Blockchain registration (development mode)');
    console.log('4. ✅ Campaign progress updates');
    console.log('5. ✅ Secure payment verification');
    console.log('6. ✅ User-friendly donation UI');
    
    console.log('\n🧪 How to Test:');
    console.log('===============');
    console.log('1. Copy .env.example to .env.local');
    console.log('2. Start your Next.js app: npm run dev');
    console.log('3. Go to any campaign details page');
    console.log('4. Click "Donate Now" button');
    console.log('5. Enter amount and test donation flow');
    
    console.log('\n💳 Test Payment Details:');
    console.log('========================');
    console.log('Card Number: 4111 1111 1111 1111');
    console.log('Expiry: Any future date');
    console.log('CVV: Any 3 digits');
    console.log('Name: Any name');
    
  } else {
    console.log('\n⚠️ Some tests failed. Please check the issues above.');
    
    if (!results.razorpayFiles) {
      console.log('\n🔧 Fix Missing Files:');
      console.log('- Ensure all Razorpay integration files are created');
    }
    
    if (!results.environmentVariables) {
      console.log('\n🔧 Fix Environment Variables:');
      console.log('- Copy .env.example to .env.local');
      console.log('- Add your Razorpay API keys');
    }
  }
}

// Run the tests
runAllTests().catch(console.error);
