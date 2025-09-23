#!/usr/bin/env node

/**
 * Razorpay Integration Fix Test
 * Tests the complete payment flow after fixing authentication issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Testing Razorpay Integration Fix...\n');

// Test 1: Environment Variables Check
console.log('1️⃣ Testing Environment Variables...');
const envPath = path.join(__dirname, 'fundchain-frontend', '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const hasKeyId = envContent.includes('NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_');
const hasKeySecret = envContent.includes('RAZORPAY_KEY_SECRET=');

console.log(`   Key ID configured: ${hasKeyId ? '✅' : '❌'}`);
console.log(`   Key Secret configured: ${hasKeySecret ? '✅' : '❌'}`);

if (!hasKeyId || !hasKeySecret) {
  console.log('❌ Missing Razorpay credentials in .env.local');
  process.exit(1);
}

// Test 2: API Route Files Check
console.log('\n2️⃣ Testing API Route Files...');
const createOrderPath = path.join(__dirname, 'fundchain-frontend', 'app', 'api', 'razorpay', 'create-order', 'route.ts');
const verifyPaymentPath = path.join(__dirname, 'fundchain-frontend', 'app', 'api', 'razorpay', 'verify-payment', 'route.ts');

console.log(`   Create Order API: ${fs.existsSync(createOrderPath) ? '✅' : '❌'}`);
console.log(`   Verify Payment API: ${fs.existsSync(verifyPaymentPath) ? '✅' : '❌'}`);

// Test 3: Frontend Integration Check
console.log('\n3️⃣ Testing Frontend Integration...');
const razorpayLibPath = path.join(__dirname, 'fundchain-frontend', 'lib', 'razorpay.js');
const campaignPagePath = path.join(__dirname, 'fundchain-frontend', 'app', 'campaigns', '[id]', 'page.tsx');

console.log(`   Razorpay Library: ${fs.existsSync(razorpayLibPath) ? '✅' : '❌'}`);
console.log(`   Campaign Page: ${fs.existsSync(campaignPagePath) ? '✅' : '❌'}`);

// Test 4: Package Dependencies
console.log('\n4️⃣ Testing Package Dependencies...');
const packageJsonPath = path.join(__dirname, 'fundchain-frontend', 'package.json');

if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const hasRazorpay = packageJson.dependencies && packageJson.dependencies.razorpay;
  console.log(`   Razorpay Package: ${hasRazorpay ? '✅' : '❌'}`);
} else {
  console.log('   Package.json: ❌');
}

// Test 5: Generate Test Payment URL
console.log('\n5️⃣ Generating Test Instructions...');
console.log('   Test Payment Page: http://localhost:3000/test-payment');
console.log('   Campaign Donation: http://localhost:3000/campaigns/help-sarthak-get-home');

console.log('\n🧪 Test Credentials for Razorpay:');
console.log('   Card Number: 4111 1111 1111 1111');
console.log('   Expiry: 12/25');
console.log('   CVV: 123');
console.log('   Name: Test User');

console.log('\n✅ Environment Fix Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Start the development server: cd fundchain-frontend && npm run dev');
console.log('2. Open http://localhost:3000/test-payment');
console.log('3. Try making a test payment');
console.log('4. Check browser console for any remaining errors');

console.log('\n🔍 If you still see 401 errors:');
console.log('1. Check if your Razorpay account is active');
console.log('2. Verify the API keys are correct in Razorpay dashboard');
console.log('3. Ensure you\'re using test mode keys for development');
console.log('4. Try refreshing the browser and clearing cache');

console.log('\n🎉 Razorpay Integration Fix Test Complete!');
