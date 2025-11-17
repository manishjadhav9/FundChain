/**
 * Direct Razorpay integration without server-side order creation
 * This bypasses the "Failed to create order" issue entirely
 */

// ETH to INR conversion rate
const ETH_TO_INR_RATE = 217000; // 1 ETH = ₹2,17,000

/**
 * Convert INR amount to ETH
 */
export function convertINRToETH(inrAmount) {
  const ethAmount = inrAmount / ETH_TO_INR_RATE;
  return ethAmount.toFixed(6);
}

/**
 * Convert ETH amount to INR
 */
export function convertETHToINR(ethAmount) {
  return Math.round(ethAmount * ETH_TO_INR_RATE);
}

/**
 * Load Razorpay SDK with enhanced error handling
 */
export function loadRazorpaySDK() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined') {
      console.log('✅ Razorpay SDK already loaded');
      resolve();
      return;
    }

    if (typeof window === 'undefined') {
      reject(new Error('Razorpay SDK can only be loaded in browser environment'));
      return;
    }

    console.log('🔄 Loading Razorpay SDK...');
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.defer = true;
    
    const timeout = setTimeout(() => {
      console.error('❌ Razorpay SDK loading timeout (10s)');
      reject(new Error('Razorpay SDK loading timeout - possibly blocked by ad blocker'));
    }, 10000);
    
    script.onload = () => {
      clearTimeout(timeout);
      if (typeof window.Razorpay !== 'undefined') {
        console.log('✅ Razorpay SDK loaded successfully');
        resolve();
      } else {
        console.error('❌ Razorpay SDK loaded but window.Razorpay is undefined');
        reject(new Error('Razorpay SDK loaded but not available'));
      }
    };
    
    script.onerror = (error) => {
      clearTimeout(timeout);
      console.error('❌ Failed to load Razorpay SDK:', error);
      reject(new Error(
        'Unable to load payment gateway. This might be due to:\n\n' +
        '1. Ad blocker blocking Razorpay\n' +
        '2. Network connectivity issues\n' +
        '3. Firewall or security software\n\n' +
        'Please try:\n' +
        '- Disable ad blocker for this site\n' +
        '- Use incognito/private browsing mode\n' +
        '- Try a different browser'
      ));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Direct donation processing WITH server-side order creation
 * This method creates a proper Razorpay order first
 */
export async function processDonationDirect({
  campaignId,
  campaignTitle,
  amountINR,
  donorName = 'Anonymous Donor',
  donorEmail = 'donor@example.com'
}) {
  try {
    console.log(`💰 Processing donation of ₹${amountINR} for campaign: ${campaignTitle}`);
    
    const ethAmount = convertINRToETH(amountINR);
    console.log(`🔄 Converting ₹${amountINR} to ${ethAmount} ETH`);
    
    // Ensure Razorpay SDK is loaded
    await loadRazorpaySDK();
    console.log('✅ Razorpay SDK loaded');
    
    // Validate amount
    const amountInPaise = Math.round(amountINR * 100);
    if (amountInPaise < 100) {
      throw new Error('Minimum donation amount is ₹1');
    }
    
    console.log(`💰 Payment amount: ₹${amountINR} = ${amountInPaise} paise`);
    
    // Create Razorpay order via API
    console.log('📝 Creating Razorpay order...');
    const orderResponse = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountINR,
        currency: 'INR',
        campaignId,
        campaignTitle
      })
    });
    
    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(errorData.error || 'Failed to create payment order');
    }
    
    const orderData = await orderResponse.json();
    console.log('✅ Razorpay order created:', orderData.orderId);
    
    return new Promise((resolve, reject) => {
      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RUE7U75NdjxIGM',
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'FundChain',
        description: `Donation for: ${campaignTitle}`,
        image: '/logo.png',
        handler: async function (response) {
          console.log('💰 Razorpay payment successful:', response);
          
          try {
            // Generate transaction details
            console.log('🔄 Processing payment completion...');
            
            // Generate mock transaction hash for blockchain simulation
            const mockTxHash = '0x' + Array.from({length: 64}, () => 
              Math.floor(Math.random() * 16).toString(16)
            ).join('');
            
            const result = {
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id || orderData.orderId,
              signature: response.razorpay_signature,
              transactionHash: mockTxHash,
              amountINR,
              ethAmount,
              campaignId,
              timestamp: new Date().toISOString(),
              message: 'Donation successful!',
              method: 'razorpay'
            };
            
            console.log('✅ Direct payment processing complete:', result);
            resolve(result);
            
          } catch (error) {
            console.error('❌ Direct payment processing failed:', error);
            reject(error);
          }
        },
        prefill: {
          name: donorName,
          email: donorEmail,
          contact: '9999999999'
        },
        notes: {
          campaign_id: campaignId,
          platform: 'fundchain',
          method: 'direct',
          timestamp: new Date().toISOString()
        },
        theme: {
          color: '#f97316' // Orange theme matching FundChain
        },
        modal: {
          ondismiss: function() {
            console.log('💸 Payment cancelled by user');
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      console.log('🚀 Opening Razorpay payment gateway (direct mode)...');
      
      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (razorpayError) {
        console.error('❌ Failed to open Razorpay:', razorpayError);
        reject(new Error('Failed to open payment gateway. Please try again.'));
      }
    });
    
  } catch (error) {
    console.error('❌ Direct donation processing failed:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('ad blocker') || error.message.includes('blocked')) {
      throw new Error(
        'Payment gateway is blocked by ad blocker or browser extension. ' +
        'Please disable your ad blocker and try again, or use incognito mode.'
      );
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      throw new Error(
        'Network connection issue. Please check your internet connection and try again.'
      );
    } else {
      throw error;
    }
  }
}
