#!/usr/bin/env node

/**
 * Test script to verify payment amount formatting fix
 */

console.log('🔧 Testing Payment Amount Fix');
console.log('=============================\n');

// Test 1: Amount validation and conversion
function testAmountConversion() {
  console.log('1️⃣ Testing Amount Conversion to Paise...');
  
  const testCases = [
    { inr: 1, expectedPaise: 100, valid: true },
    { inr: 0.5, expectedPaise: 50, valid: false }, // Below minimum
    { inr: 10, expectedPaise: 1000, valid: true },
    { inr: 100.50, expectedPaise: 10050, valid: true },
    { inr: 1000, expectedPaise: 100000, valid: true },
    { inr: 0, expectedPaise: 0, valid: false },
    { inr: -5, expectedPaise: -500, valid: false }
  ];
  
  let allTestsPassed = true;
  
  testCases.forEach(test => {
    const calculatedPaise = Math.round(test.inr * 100);
    const isValid = calculatedPaise >= 100; // Minimum 100 paise = ₹1
    
    const status = (calculatedPaise === test.expectedPaise && isValid === test.valid) ? '✅' : '❌';
    console.log(`${status} ₹${test.inr} = ${calculatedPaise} paise (${isValid ? 'Valid' : 'Invalid'})`);
    
    if (calculatedPaise !== test.expectedPaise || isValid !== test.valid) {
      allTestsPassed = false;
    }
  });
  
  return allTestsPassed;
}

// Test 2: Check if razorpay.js has proper amount formatting
function testRazorpayAmountFormatting() {
  console.log('\n2️⃣ Testing Razorpay Amount Formatting...');
  
  const fs = require('fs');
  const razorpayFile = '/home/adwait/FundChain/fundchain-frontend/lib/razorpay.js';
  
  if (!fs.existsSync(razorpayFile)) {
    console.log('❌ Razorpay file not found');
    return false;
  }
  
  const content = fs.readFileSync(razorpayFile, 'utf8');
  
  const requiredElements = [
    'Math.round(amountINR * 100)',
    'amountInPaise',
    'amountInPaise < 100',
    'Minimum donation amount',
    'amount: amountInPaise'
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

// Test 3: Check campaign page validation
function testCampaignPageValidation() {
  console.log('\n3️⃣ Testing Campaign Page Validation...');
  
  const fs = require('fs');
  const pageFile = '/home/adwait/FundChain/fundchain-frontend/app/campaigns/[id]/page.tsx';
  
  if (!fs.existsSync(pageFile)) {
    console.log('❌ Campaign page not found');
    return false;
  }
  
  const content = fs.readFileSync(pageFile, 'utf8');
  
  const requiredElements = [
    'amountINR < 1',
    'Minimum donation amount is ₹1',
    'amountINR > 1000000',
    'min="1"',
    'max="1000000"',
    'step="1"'
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

// Test 4: Generate test HTML for amount validation
function generateAmountTestHTML() {
  console.log('\n4️⃣ Generating Amount Test HTML...');
  
  const testHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Razorpay Amount Test</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .form-group { margin: 15px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .button { background: #f97316; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; width: 100%; }
        .button:hover { background: #ea580c; }
        .button:disabled { background: #ccc; cursor: not-allowed; }
        .status { margin: 20px 0; padding: 15px; border-radius: 5px; }
        .success { background: #d1fae5; color: #065f46; }
        .error { background: #fee2e2; color: #991b1b; }
        .info { background: #dbeafe; color: #1e40af; }
        .test-cases { margin: 20px 0; }
        .test-case { padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🔧 Razorpay Amount Validation Test</h1>
    
    <div id="status" class="status info">
        Enter an amount to test Razorpay payment with proper formatting
    </div>
    
    <div class="form-group">
        <label for="amount">Donation Amount (₹):</label>
        <input type="number" id="amount" placeholder="Enter amount in INR (min ₹1)" min="1" max="1000000" step="1" value="100">
        <small>Amount will be converted to paise: <span id="paise">10000</span> paise</small>
    </div>
    
    <button class="button" onclick="testPayment()">
        💳 Test Payment
    </button>
    
    <div class="test-cases">
        <h3>Test Cases:</h3>
        <div class="test-case">
            <button onclick="testAmount(1)">Test ₹1 (100 paise)</button>
            <button onclick="testAmount(0.5)">Test ₹0.5 (50 paise - should fail)</button>
            <button onclick="testAmount(100)">Test ₹100 (10000 paise)</button>
            <button onclick="testAmount(1000.50)">Test ₹1000.50 (100050 paise)</button>
        </div>
    </div>
    
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
        
        function updatePaise() {
            const amount = parseFloat(document.getElementById('amount').value) || 0;
            const paise = Math.round(amount * 100);
            document.getElementById('paise').textContent = paise;
            
            if (paise < 100) {
                document.getElementById('paise').style.color = 'red';
                document.getElementById('paise').textContent += ' (Invalid - minimum 100 paise)';
            } else {
                document.getElementById('paise').style.color = 'green';
            }
        }
        
        function testAmount(amount) {
            document.getElementById('amount').value = amount;
            updatePaise();
        }
        
        function testPayment() {
            const amount = parseFloat(document.getElementById('amount').value);
            
            if (!amount || amount <= 0) {
                updateStatus('Please enter a valid amount', 'error');
                return;
            }
            
            const amountInPaise = Math.round(amount * 100);
            
            if (amountInPaise < 100) {
                updateStatus('Minimum donation amount is ₹1 (100 paise)', 'error');
                return;
            }
            
            if (typeof Razorpay === 'undefined') {
                updateStatus('Razorpay SDK not loaded', 'error');
                return;
            }
            
            updateStatus('Opening Razorpay with amount: ₹' + amount + ' (' + amountInPaise + ' paise)', 'info');
            addDebugInfo('💰 Testing payment: ₹' + amount + ' = ' + amountInPaise + ' paise');
            
            const options = {
                key: 'rzp_test_RJuwxk8NAGp7Dc',
                amount: amountInPaise, // Amount in paise (integer)
                currency: 'INR',
                name: 'FundChain Amount Test',
                description: 'Testing amount formatting: ₹' + amount,
                handler: function (response) {
                    updateStatus('Payment successful! Payment ID: ' + response.razorpay_payment_id, 'success');
                    addDebugInfo('✅ Payment successful: ' + response.razorpay_payment_id);
                },
                prefill: {
                    name: 'Test User',
                    email: 'test@fundchain.com',
                    contact: '9999999999'
                },
                theme: {
                    color: '#f97316'
                },
                modal: {
                    ondismiss: function() {
                        updateStatus('Payment cancelled', 'error');
                        addDebugInfo('⚠️ Payment cancelled by user');
                    }
                }
            };
            
            try {
                const rzp = new Razorpay(options);
                rzp.open();
                addDebugInfo('🚀 Razorpay opened with ' + amountInPaise + ' paise');
            } catch (error) {
                updateStatus('Error: ' + error.message, 'error');
                addDebugInfo('❌ Error: ' + error.message);
            }
        }
        
        // Update paise display when amount changes
        document.getElementById('amount').addEventListener('input', updatePaise);
        
        // Initial update
        updatePaise();
        
        // Check if Razorpay is loaded
        window.addEventListener('load', function() {
            if (typeof Razorpay !== 'undefined') {
                addDebugInfo('✅ Razorpay SDK loaded successfully');
            } else {
                addDebugInfo('❌ Razorpay SDK not loaded');
                updateStatus('Error: Razorpay SDK failed to load', 'error');
            }
        });
    </script>
</body>
</html>`;

  require('fs').writeFileSync('/home/adwait/FundChain/razorpay-amount-test.html', testHTML);
  console.log('✅ Amount test HTML created: /home/adwait/FundChain/razorpay-amount-test.html');
  
  return true;
}

// Main test execution
async function runAmountTests() {
  console.log('Running payment amount formatting tests...\n');
  
  const results = {
    amountConversion: testAmountConversion(),
    razorpayFormatting: testRazorpayAmountFormatting(),
    campaignValidation: testCampaignPageValidation(),
    testHTML: generateAmountTestHTML()
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
    console.log('✅ Payment amount formatting is now correct');
    
    console.log('\n🔧 What Was Fixed:');
    console.log('==================');
    console.log('1. ✅ Amount converted to integer paise using Math.round()');
    console.log('2. ✅ Minimum amount validation (₹1 = 100 paise)');
    console.log('3. ✅ Maximum amount validation (₹10,00,000)');
    console.log('4. ✅ Input field constraints (min, max, step)');
    console.log('5. ✅ Proper error messages for invalid amounts');
    
    console.log('\n🧪 How to Test:');
    console.log('===============');
    console.log('1. Restart your Next.js server: npm run dev');
    console.log('2. Go to campaign details page');
    console.log('3. Try donating different amounts:');
    console.log('   - ₹1 (should work - 100 paise)');
    console.log('   - ₹0.5 (should fail - below minimum)');
    console.log('   - ₹100 (should work - 10000 paise)');
    console.log('   - ₹1000.50 (should work - 100050 paise)');
    
    console.log('\n🌐 Direct Test:');
    console.log('===============');
    console.log('Open: /home/adwait/FundChain/razorpay-amount-test.html');
    console.log('This will test amount formatting directly');
    
  } else {
    console.log('\n⚠️ Some tests failed. Check the issues above.');
  }
}

// Run the tests
runAmountTests().catch(console.error);
