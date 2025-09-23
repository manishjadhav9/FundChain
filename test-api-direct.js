#!/usr/bin/env node

/**
 * Direct API test script to test Razorpay order creation
 */

const fetch = require('node-fetch');

console.log('🧪 Direct API Test');
console.log('==================\n');

async function testCreateOrder() {
  try {
    console.log('1️⃣ Testing order creation API...');
    
    const testData = {
      amount: 10000, // ₹100 in paise
      currency: 'INR',
      receipt: `test_receipt_${Date.now()}`,
      notes: {
        test: 'true',
        campaign_id: 'test-campaign'
      }
    };
    
    console.log('📤 Sending request with data:', testData);
    
    const response = await fetch('http://localhost:3000/api/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers));
    
    const responseData = await response.json();
    console.log('📥 Response data:', responseData);
    
    if (response.ok) {
      console.log('✅ Order creation successful!');
      return responseData;
    } else {
      console.log('❌ Order creation failed!');
      return null;
    }
    
  } catch (error) {
    console.error('❌ API test error:', error.message);
    return null;
  }
}

async function testServerConnection() {
  try {
    console.log('🔍 Testing server connection...');
    
    const response = await fetch('http://localhost:3000/api/health', {
      method: 'GET'
    });
    
    if (response.status === 404) {
      console.log('⚠️ Health endpoint not found (expected)');
      console.log('✅ Server is running on port 3000');
      return true;
    } else {
      console.log('✅ Server responded with status:', response.status);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    console.log('💡 Make sure the development server is running:');
    console.log('   cd fundchain-frontend && pnpm run dev');
    return false;
  }
}

async function runTests() {
  console.log('Starting API tests...\n');
  
  // Test 1: Server connection
  const serverRunning = await testServerConnection();
  
  if (!serverRunning) {
    console.log('\n🛑 Cannot proceed - server is not running');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Order creation
  const orderResult = await testCreateOrder();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Summary
  console.log('📊 Test Summary:');
  console.log('===============');
  console.log(`Server Connection: ${serverRunning ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Order Creation: ${orderResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (orderResult) {
    console.log('\n🎉 All tests passed! The API is working correctly.');
    console.log('\n🔧 If you\'re still getting errors in the frontend:');
    console.log('1. Check browser console for detailed error messages');
    console.log('2. Ensure the frontend is making requests to the correct URL');
    console.log('3. Check network tab in browser dev tools');
    console.log('4. Try refreshing the page and clearing cache');
  } else {
    console.log('\n⚠️ API test failed. Check the server logs for details.');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check server console for error messages');
    console.log('2. Verify environment variables are loaded correctly');
    console.log('3. Ensure Razorpay package is installed properly');
    console.log('4. Check if there are any network/firewall issues');
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testCreateOrder, testServerConnection };
