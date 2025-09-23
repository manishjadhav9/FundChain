#!/usr/bin/env node

/**
 * Simple test to check Razorpay configuration
 */

const fetch = require('node-fetch');

async function testRazorpayConfig() {
  console.log('🧪 Testing Razorpay Configuration');
  console.log('=================================\n');

  try {
    // Test 1: Check configuration
    console.log('1️⃣ Testing Razorpay configuration...');
    
    const configResponse = await fetch('http://localhost:3000/api/test-razorpay');
    const configData = await configResponse.json();
    
    console.log('Configuration result:', configData);
    
    if (configData.success) {
      console.log('✅ Razorpay is properly configured');
    } else {
      console.log('❌ Razorpay configuration issue:', configData.message);
      return false;
    }
    
    // Test 2: Try creating a test order
    console.log('\n2️⃣ Testing order creation...');
    
    const orderResponse = await fetch('http://localhost:3000/api/test-razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: 10000 })
    });
    
    const orderData = await orderResponse.json();
    
    console.log('Order creation result:', orderData);
    
    if (orderData.success) {
      console.log('✅ Test order created successfully!');
      console.log('Order ID:', orderData.order_id);
      return true;
    } else {
      console.log('❌ Test order creation failed:', orderData.error);
      console.log('Details:', orderData.details);
      return false;
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Solution: Start the development server');
      console.log('cd fundchain-frontend && pnpm run dev');
    }
    
    return false;
  }
}

async function main() {
  const success = await testRazorpayConfig();
  
  console.log('\n' + '='.repeat(50));
  
  if (success) {
    console.log('🎉 Razorpay is working correctly!');
    console.log('\n💡 If you\'re still getting "Failed to create order":');
    console.log('1. Check browser console for detailed errors');
    console.log('2. Clear browser cache and refresh');
    console.log('3. Try the fallback payment method');
  } else {
    console.log('⚠️ Razorpay configuration needs attention');
    console.log('\n🔧 Common fixes:');
    console.log('1. Check .env.local file exists and has correct keys');
    console.log('2. Restart development server after env changes');
    console.log('3. Verify Razorpay keys are valid test keys');
  }
}

main().catch(console.error);
