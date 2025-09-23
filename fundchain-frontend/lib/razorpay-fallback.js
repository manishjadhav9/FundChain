/**
 * Fallback Razorpay integration without server-side order creation
 * Use this if the server-side API is having issues
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
 * Load Razorpay SDK
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
      console.error('❌ Razorpay SDK loading timeout');
      reject(new Error('Razorpay SDK loading timeout - possibly blocked by ad blocker'));
    }, 10000);
    
    script.onload = () => {
      clearTimeout(timeout);
      if (typeof window.Razorpay !== 'undefined') {
        console.log('✅ Razorpay SDK loaded successfully');
        resolve();
      } else {
        reject(new Error('Razorpay SDK loaded but not available'));
      }
    };
    
    script.onerror = (error) => {
      clearTimeout(timeout);
      console.error('❌ Failed to load Razorpay SDK - possibly blocked by ad blocker:', error);
      reject(new Error('Unable to load payment gateway. Please disable ad blocker and try again.'));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Simple donation flow without server-side order creation
 * This is a fallback method for testing
 */
export async function processDonationFallback({
  campaignId,
  campaignTitle,
  amountINR,
  donorName = 'Anonymous Donor',
  donorEmail = 'donor@example.com'
}) {
  try {
    console.log(`💰 Processing fallback donation of ₹${amountINR} for campaign: ${campaignTitle}`);
    
    const ethAmount = convertINRToETH(amountINR);
    console.log(`🔄 Converting ₹${amountINR} to ${ethAmount} ETH`);
    
    // Ensure Razorpay SDK is loaded
    await loadRazorpaySDK();
    console.log('✅ Razorpay SDK loaded, initializing payment...');
    
    // Validate amount
    const amountInPaise = Math.round(amountINR * 100);
    if (amountInPaise < 100) {
      throw new Error('Minimum donation amount is ₹1');
    }
    
    console.log(`💰 Payment amount: ₹${amountINR} = ${amountInPaise} paise`);
    
    return new Promise((resolve, reject) => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RJuwxk8NAGp7Dc',
        amount: amountInPaise,
        currency: 'INR',
        name: 'FundChain',
        description: `Donation for: ${campaignTitle}`,
        image: '/logo.png',
        handler: async function (response) {
          console.log('💰 Razorpay payment successful:', response);
          
          try {
            // Simulate server verification (for testing)
            console.log('🔄 Simulating payment verification...');
            
            // Generate mock transaction hash
            const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
            
            const result = {
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: `order_fallback_${Date.now()}`,
              transactionHash: mockTxHash,
              amountINR,
              ethAmount,
              campaignId,
              timestamp: new Date().toISOString(),
              message: 'Donation successful! (Fallback mode)'
            };
            
            console.log('✅ Fallback payment processing complete:', result);
            resolve(result);
            
          } catch (error) {
            console.error('❌ Fallback payment processing failed:', error);
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
          mode: 'fallback'
        },
        theme: {
          color: '#f97316'
        },
        modal: {
          ondismiss: function() {
            console.log('💸 Payment cancelled by user');
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      console.log('🚀 Opening Razorpay payment gateway (fallback mode)...');
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
    
  } catch (error) {
    console.error('❌ Fallback donation processing failed:', error);
    throw error;
  }
}
