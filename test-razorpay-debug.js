#!/usr/bin/env node

/**
 * Debug script for Razorpay payment gateway issues
 */

console.log('🔧 Razorpay Payment Gateway Debug');
console.log('=================================\n');

const fs = require('fs');

// Test 1: Check if Razorpay SDK loading function is correct
function testRazorpaySDKFunction() {
  console.log('1️⃣ Testing Razorpay SDK Loading Function...');
  
  const razorpayFile = '/home/adwait/FundChain/fundchain-frontend/lib/razorpay.js';
  
  if (!fs.existsSync(razorpayFile)) {
    console.log('❌ Razorpay file not found');
    return false;
  }
  
  const content = fs.readFileSync(razorpayFile, 'utf8');
  
  // Check for proper SDK loading function
  if (content.includes('loadRazorpaySDK') && 
      content.includes('https://checkout.razorpay.com/v1/checkout.js') &&
      content.includes('window.Razorpay')) {
    console.log('✅ Razorpay SDK loading function is present');
    return true;
  } else {
    console.log('❌ Razorpay SDK loading function has issues');
    return false;
  }
}

// Test 2: Check processDonation function
function testProcessDonationFunction() {
  console.log('\n2️⃣ Testing processDonation Function...');
  
  const razorpayFile = '/home/adwait/FundChain/fundchain-frontend/lib/razorpay.js';
  const content = fs.readFileSync(razorpayFile, 'utf8');
  
  const requiredElements = [
    'processDonation',
    'loadRazorpaySDK',
    'window.Razorpay',
    'rzp.open()',
    'handler: async function'
  ];
  
  let allPresent = true;
  
  requiredElements.forEach(element => {
    if (content.includes(element)) {
      console.log(`✅ ${element}: Present`);
    } else {
      console.log(`❌ ${element}: Missing`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Test 3: Check environment variables
function testEnvironmentSetup() {
  console.log('\n3️⃣ Testing Environment Setup...');
  
  const envFile = '/home/adwait/FundChain/fundchain-frontend/.env.local';
  
  if (fs.existsSync(envFile)) {
    console.log('✅ .env.local file exists');
    
    const content = fs.readFileSync(envFile, 'utf8');
    
    if (content.includes('NEXT_PUBLIC_RAZORPAY_KEY_ID')) {
      console.log('✅ Razorpay key ID configured');
    } else {
      console.log('⚠️ Razorpay key ID not found in .env.local');
    }
    
    if (content.includes('rzp_test_RJuwxk8NAGp7Dc')) {
      console.log('✅ Test key ID is correct');
    } else {
      console.log('⚠️ Test key ID not found or incorrect');
    }
    
    return true;
  } else {
    console.log('❌ .env.local file not found');
    console.log('💡 Please copy .env.example to .env.local');
    return false;
  }
}

// Test 4: Generate debug HTML for testing
function generateDebugHTML() {
  console.log('\n4️⃣ Generating Debug HTML...');
  
  const debugHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Razorpay Debug Test</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { background: #f97316; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        .button:hover { background: #ea580c; }
        .status { margin: 20px 0; padding: 15px; border-radius: 5px; }
        .success { background: #d1fae5; color: #065f46; }
        .error { background: #fee2e2; color: #991b1b; }
        .info { background: #dbeafe; color: #1e40af; }
    </style>
</head>
<body>
    <h1>🔧 Razorpay Debug Test</h1>
    
    <div id="status" class="status info">
        Click the button below to test Razorpay payment gateway
    </div>
    
    <button class="button" onclick="testRazorpayPayment()">
        💳 Test Razorpay Payment
    </button>
    
    <h2>Debug Information</h2>
    <div id="debug-info"></div>
    
    <script>
        function updateStatus(message, type = 'info') {
            const statusDiv = document.getElementById('status');
            statusDiv.textContent = message;
            statusDiv.className = 'status ' + type;
        }
        
        function addDebugInfo(info) {
            const debugDiv = document.getElementById('debug-info');
            debugDiv.innerHTML += '<p>' + info + '</p>';
        }
        
        // Check if Razorpay is loaded
        window.addEventListener('load', function() {
            if (typeof Razorpay !== 'undefined') {
                addDebugInfo('✅ Razorpay SDK loaded successfully');
                updateStatus('Razorpay SDK is ready. Click the button to test payment.', 'success');
            } else {
                addDebugInfo('❌ Razorpay SDK not loaded');
                updateStatus('Error: Razorpay SDK failed to load', 'error');
            }
        });
        
        function testRazorpayPayment() {
            if (typeof Razorpay === 'undefined') {
                updateStatus('Error: Razorpay SDK not loaded', 'error');
                return;
            }
            
            updateStatus('Opening Razorpay payment gateway...', 'info');
            
            const options = {
                key: 'rzp_test_RJuwxk8NAGp7Dc',
                amount: 10000, // ₹100 in paise
                currency: 'INR',
                name: 'FundChain Debug Test',
                description: 'Test payment for debugging',
                handler: function (response) {
                    updateStatus('Payment successful! Payment ID: ' + response.razorpay_payment_id, 'success');
                    addDebugInfo('✅ Payment ID: ' + response.razorpay_payment_id);
                },
                prefill: {
                    name: 'Test User',
                    email: 'test@example.com',
                    contact: '9999999999'
                },
                theme: {
                    color: '#f97316'
                },
                modal: {
                    ondismiss: function() {
                        updateStatus('Payment cancelled by user', 'error');
                        addDebugInfo('⚠️ Payment was cancelled');
                    }
                }
            };
            
            try {
                const rzp = new Razorpay(options);
                rzp.open();
                addDebugInfo('🚀 Razorpay payment gateway opened');
            } catch (error) {
                updateStatus('Error opening payment gateway: ' + error.message, 'error');
                addDebugInfo('❌ Error: ' + error.message);
            }
        }
    </script>
</body>
</html>`;

  fs.writeFileSync('/home/adwait/FundChain/razorpay-debug.html', debugHTML);
  console.log('✅ Debug HTML created: /home/adwait/FundChain/razorpay-debug.html');
  console.log('🌐 Open this file in your browser to test Razorpay directly');
  
  return true;
}

// Test 5: Check campaign page integration
function testCampaignPageIntegration() {
  console.log('\n5️⃣ Testing Campaign Page Integration...');
  
  const pageFile = '/home/adwait/FundChain/fundchain-frontend/app/campaigns/[id]/page.tsx';
  
  if (!fs.existsSync(pageFile)) {
    console.log('❌ Campaign page not found');
    return false;
  }
  
  const content = fs.readFileSync(pageFile, 'utf8');
  
  const requiredElements = [
    'loadRazorpaySDK',
    'processDonation',
    'handleDonation',
    'setIsDonating',
    'console.log',
    'error handling'
  ];
  
  let allPresent = true;
  
  // Check for loadRazorpaySDK call
  if (content.includes('loadRazorpaySDK()')) {
    console.log('✅ loadRazorpaySDK call: Present');
  } else {
    console.log('❌ loadRazorpaySDK call: Missing');
    allPresent = false;
  }
  
  // Check for processDonation call
  if (content.includes('processDonation({')) {
    console.log('✅ processDonation call: Present');
  } else {
    console.log('❌ processDonation call: Missing');
    allPresent = false;
  }
  
  // Check for error handling
  if (content.includes('catch (error') && content.includes('console.error')) {
    console.log('✅ Error handling: Present');
  } else {
    console.log('❌ Error handling: Missing or incomplete');
    allPresent = false;
  }
  
  return allPresent;
}

// Main debug execution
async function runDebugTests() {
  console.log('Running Razorpay payment gateway debug tests...\n');
  
  const results = {
    sdkFunction: testRazorpaySDKFunction(),
    processDonation: testProcessDonationFunction(),
    environmentSetup: testEnvironmentSetup(),
    debugHTML: generateDebugHTML(),
    campaignIntegration: testCampaignPageIntegration()
  };
  
  console.log('\n📊 Debug Results Summary');
  console.log('========================');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  for (const [test, passed] of Object.entries(results)) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  }
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  console.log('\n🔧 Troubleshooting Steps:');
  console.log('========================');
  
  if (!results.environmentSetup) {
    console.log('1. ❌ Fix Environment Setup:');
    console.log('   - Ensure .env.local exists');
    console.log('   - Add NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RJuwxk8NAGp7Dc');
  }
  
  console.log('2. 🌐 Test Razorpay Directly:');
  console.log('   - Open: /home/adwait/FundChain/razorpay-debug.html');
  console.log('   - This will test Razorpay without Next.js');
  
  console.log('3. 🔍 Check Browser Console:');
  console.log('   - Open browser dev tools (F12)');
  console.log('   - Look for Razorpay loading errors');
  console.log('   - Check for JavaScript errors');
  
  console.log('4. 🚀 Restart Development Server:');
  console.log('   - Stop: Ctrl+C');
  console.log('   - Start: npm run dev');
  console.log('   - Clear browser cache');
  
  console.log('5. 💳 Test Payment Flow:');
  console.log('   - Go to campaign details page');
  console.log('   - Open browser console');
  console.log('   - Click "Donate Now"');
  console.log('   - Watch console for debug messages');
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All debug tests passed!');
    console.log('The issue might be browser-specific or network-related.');
  }
}

// Run the debug tests
runDebugTests().catch(console.error);
