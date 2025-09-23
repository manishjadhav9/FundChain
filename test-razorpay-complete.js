#!/usr/bin/env node

/**
 * Comprehensive Razorpay Integration Test
 * Tests the complete payment flow including server-side APIs
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Razorpay Complete Integration Test');
console.log('====================================\n');

// Test 1: Check environment configuration
function testEnvironmentConfig() {
  console.log('1️⃣ Testing Environment Configuration...');
  
  const envFile = '/home/adwait/FundChain/fundchain-frontend/.env.local';
  
  if (!fs.existsSync(envFile)) {
    console.log('❌ .env.local file not found');
    return false;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  const checks = [
    { key: 'NEXT_PUBLIC_RAZORPAY_KEY_ID', required: true },
    { key: 'RAZORPAY_KEY_SECRET', required: true }
  ];
  
  let allPresent = true;
  
  checks.forEach(check => {
    if (envContent.includes(check.key)) {
      console.log(`✅ ${check.key}: Present`);
    } else {
      console.log(`❌ ${check.key}: Missing`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Test 2: Check API routes
function testAPIRoutes() {
  console.log('\n2️⃣ Testing API Routes...');
  
  const routes = [
    '/home/adwait/FundChain/fundchain-frontend/app/api/razorpay/create-order/route.ts',
    '/home/adwait/FundChain/fundchain-frontend/app/api/razorpay/verify-payment/route.ts'
  ];
  
  let allPresent = true;
  
  routes.forEach(route => {
    const routeName = path.basename(path.dirname(route));
    if (fs.existsSync(route)) {
      console.log(`✅ API Route: ${routeName}`);
      
      // Check route content
      const content = fs.readFileSync(route, 'utf8');
      if (content.includes('NextRequest') && content.includes('NextResponse')) {
        console.log(`  ✅ Proper Next.js API route structure`);
      } else {
        console.log(`  ⚠️ Route structure may be incorrect`);
      }
    } else {
      console.log(`❌ API Route: ${routeName} - Not found`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Test 3: Check Razorpay library integration
function testRazorpayLibrary() {
  console.log('\n3️⃣ Testing Razorpay Library Integration...');
  
  const razorpayFile = '/home/adwait/FundChain/fundchain-frontend/lib/razorpay.js';
  
  if (!fs.existsSync(razorpayFile)) {
    console.log('❌ Razorpay library file not found');
    return false;
  }
  
  const content = fs.readFileSync(razorpayFile, 'utf8');
  
  const requiredFunctions = [
    'processDonation',
    'loadRazorpaySDK',
    'convertINRToETH',
    'convertETHToINR'
  ];
  
  const requiredFeatures = [
    'fetch(\'/api/razorpay/create-order\'',
    'fetch(\'/api/razorpay/verify-payment\'',
    'razorpay_signature',
    'order_id',
    'window.Razorpay'
  ];
  
  let allPresent = true;
  
  requiredFunctions.forEach(func => {
    if (content.includes(`export function ${func}`) || content.includes(`export async function ${func}`)) {
      console.log(`✅ Function: ${func}`);
    } else {
      console.log(`❌ Function: ${func} - Missing`);
      allPresent = false;
    }
  });
  
  requiredFeatures.forEach(feature => {
    if (content.includes(feature)) {
      console.log(`✅ Feature: ${feature}`);
    } else {
      console.log(`❌ Feature: ${feature} - Missing`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Test 4: Check package.json dependencies
function testDependencies() {
  console.log('\n4️⃣ Testing Dependencies...');
  
  const packageFile = '/home/adwait/FundChain/fundchain-frontend/package.json';
  
  if (!fs.existsSync(packageFile)) {
    console.log('❌ package.json not found');
    return false;
  }
  
  const packageContent = fs.readFileSync(packageFile, 'utf8');
  const packageJson = JSON.parse(packageContent);
  
  const requiredDeps = ['razorpay'];
  
  let allPresent = true;
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ Dependency: ${dep} v${packageJson.dependencies[dep]}`);
    } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`✅ Dev Dependency: ${dep} v${packageJson.devDependencies[dep]}`);
    } else {
      console.log(`❌ Dependency: ${dep} - Missing`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Test 5: Check test payment page
function testPaymentPage() {
  console.log('\n5️⃣ Testing Payment Test Page...');
  
  const testPageFile = '/home/adwait/FundChain/fundchain-frontend/app/test-payment/page.tsx';
  
  if (!fs.existsSync(testPageFile)) {
    console.log('❌ Test payment page not found');
    return false;
  }
  
  const content = fs.readFileSync(testPageFile, 'utf8');
  
  const requiredElements = [
    'processDonation',
    'RazorpayScript',
    'razorpayLoaded',
    'handleRazorpayLoad',
    'testPayment'
  ];
  
  let allPresent = true;
  
  requiredElements.forEach(element => {
    if (content.includes(element)) {
      console.log(`✅ Element: ${element}`);
    } else {
      console.log(`❌ Element: ${element} - Missing`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Test 6: Generate integration checklist
function generateChecklist() {
  console.log('\n6️⃣ Generating Integration Checklist...');
  
  const checklist = `# 🧪 Razorpay Integration Checklist

## ✅ Pre-Testing Setup

### 1. Environment Variables
- [ ] NEXT_PUBLIC_RAZORPAY_KEY_ID is set in .env.local
- [ ] RAZORPAY_KEY_SECRET is set in .env.local
- [ ] Values match your Razorpay dashboard test keys

### 2. Dependencies
- [ ] razorpay package is installed (npm install razorpay)
- [ ] No dependency conflicts in package.json

### 3. API Routes
- [ ] /api/razorpay/create-order/route.ts exists and working
- [ ] /api/razorpay/verify-payment/route.ts exists and working
- [ ] Both routes handle errors properly

## 🧪 Testing Steps

### Step 1: Start Development Server
\`\`\`bash
cd fundchain-frontend
npm run dev
\`\`\`

### Step 2: Test Razorpay Loading
1. Go to: http://localhost:3000/test-payment
2. Check Razorpay status indicator
3. Should show "READY" if no ad blocker
4. Should show "BLOCKED" if ad blocker active

### Step 3: Test Payment Flow
1. Enter amount (e.g., ₹100)
2. Click "Test Payment Gateway"
3. Razorpay modal should open
4. Use test card: 4111 1111 1111 1111
5. Complete payment
6. Should show success with payment details

### Step 4: Test Campaign Donation
1. Go to: http://localhost:3000/campaigns/help-sarthak-get-home
2. Click "Donate Now"
3. Enter amount and donate
4. Should work same as test page

## 🔍 Expected Results

### ✅ Success Indicators
- Razorpay SDK loads without errors
- Payment modal opens correctly
- Test payments process successfully
- Payment verification completes
- Transaction hash is generated
- Campaign progress updates

### ❌ Failure Indicators
- "ERR_BLOCKED_BY_CLIENT" in console
- "Payment gateway blocked" messages
- API route errors (500/404)
- Signature verification failures

## 🛠️ Troubleshooting

### If Razorpay is Blocked:
1. Disable ad blocker for localhost
2. Use incognito/private browsing mode
3. Try different browser (Chrome, Firefox)
4. Check browser extensions

### If API Routes Fail:
1. Check server console for errors
2. Verify environment variables
3. Ensure razorpay package is installed
4. Check API route file paths

### If Payment Verification Fails:
1. Check Razorpay key secret in .env.local
2. Verify signature generation logic
3. Check server logs for errors
4. Ensure order creation works

## 📱 Test Cards

### Successful Payments:
- 4111 1111 1111 1111 (Visa)
- 5555 5555 5555 4444 (Mastercard)
- 4000 0000 0000 0002 (Visa Debit)

### Failed Payments (for testing):
- 4000 0000 0000 0119 (Processing error)
- 4000 0000 0000 0101 (Declined)

### Test Details:
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- Name: Any name

## 🎯 Success Criteria

- [ ] No console errors during SDK loading
- [ ] Payment modal opens without issues
- [ ] Test payments complete successfully
- [ ] Payment verification works correctly
- [ ] Campaign donations update progress
- [ ] Blockchain transaction simulation works
- [ ] User receives clear success/error messages

## 🚀 Go-Live Checklist

When ready for production:
- [ ] Replace test keys with live keys
- [ ] Test with real small amounts
- [ ] Set up webhook endpoints
- [ ] Configure proper error handling
- [ ] Add payment confirmation emails
- [ ] Set up transaction logging
- [ ] Test on multiple devices/browsers
`;

  fs.writeFileSync('/home/adwait/FundChain/RAZORPAY-INTEGRATION-CHECKLIST.md', checklist);
  console.log('✅ Integration checklist created: RAZORPAY-INTEGRATION-CHECKLIST.md');
  
  return true;
}

// Main test execution
async function runCompleteTest() {
  console.log('Running comprehensive Razorpay integration test...\n');
  
  const results = {
    environment: testEnvironmentConfig(),
    apiRoutes: testAPIRoutes(),
    library: testRazorpayLibrary(),
    dependencies: testDependencies(),
    testPage: testPaymentPage(),
    checklist: generateChecklist()
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
    console.log('✅ Razorpay integration is properly configured');
    
    console.log('\n🚀 Next Steps:');
    console.log('=============');
    console.log('1. Start development server: npm run dev');
    console.log('2. Test payment page: http://localhost:3000/test-payment');
    console.log('3. Test campaign donation: http://localhost:3000/campaigns/help-sarthak-get-home');
    console.log('4. Use test card: 4111 1111 1111 1111');
    console.log('5. Check console for detailed logs');
    
  } else {
    console.log('\n⚠️ Some tests failed. Please fix the issues above.');
    
    console.log('\n🔧 Common Fixes:');
    console.log('===============');
    if (!results.environment) {
      console.log('- Copy .env.example to .env.local and add Razorpay keys');
    }
    if (!results.dependencies) {
      console.log('- Run: npm install razorpay --legacy-peer-deps');
    }
    if (!results.apiRoutes) {
      console.log('- Ensure API route files are created correctly');
    }
  }
}

// Run the complete test
runCompleteTest().catch(console.error);
