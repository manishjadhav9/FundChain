#!/usr/bin/env node

/**
 * Debug script to test order creation directly
 */

const fetch = require('node-fetch');

async function testOrderCreation() {
  console.log('🔍 Testing Razorpay Order Creation API');
  console.log('=====================================\n');

  try {
    // Test data
    const testPayload = {
      amount: 10000, // ₹100 in paise
      currency: 'INR',
      receipt: `test_${Date.now()}`,
      notes: {
        test: 'true'
      }
    };

    console.log('📤 Sending request to create order...');
    console.log('Payload:', testPayload);

    const response = await fetch('http://localhost:3000/api/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log('\n📥 Response received:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    const responseData = await response.json();
    console.log('Response Data:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('\n✅ Order creation successful!');
      console.log('Order ID:', responseData.order_id);
    } else {
      console.log('\n❌ Order creation failed!');
      console.log('Error:', responseData.error);
      console.log('Details:', responseData.details);
      
      // Provide specific troubleshooting based on error
      if (responseData.details?.includes('environment')) {
        console.log('\n🔧 Fix: Check environment variables in .env.local');
      } else if (responseData.details?.includes('key_id')) {
        console.log('\n🔧 Fix: Verify Razorpay key_id and key_secret');
      } else if (responseData.details?.includes('network')) {
        console.log('\n🔧 Fix: Check network connectivity to Razorpay');
      }
    }

  } catch (error) {
    console.error('\n💥 Request failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Fix: Make sure development server is running');
      console.log('Run: cd fundchain-frontend && pnpm run dev');
    } else if (error.message.includes('fetch')) {
      console.log('\n🔧 Fix: Install node-fetch if missing');
      console.log('Run: npm install node-fetch');
    }
  }
}

// Test server connectivity first
async function testServerConnection() {
  try {
    console.log('🌐 Testing server connection...');
    const response = await fetch('http://localhost:3000');
    console.log('✅ Server is running on localhost:3000');
    return true;
  } catch (error) {
    console.log('❌ Server is not running on localhost:3000');
    console.log('💡 Start server: cd fundchain-frontend && pnpm run dev');
    return false;
  }
}

async function main() {
  const serverRunning = await testServerConnection();
  
  if (serverRunning) {
    console.log('');
    await testOrderCreation();
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Check server console for detailed error logs');
  console.log('2. Verify .env.local has correct Razorpay keys');
  console.log('3. Ensure razorpay package is installed');
  console.log('4. Try the fallback payment method if server fails');
}

main().catch(console.error);
