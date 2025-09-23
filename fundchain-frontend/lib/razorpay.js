/**
 * Razorpay Payment Integration for FundChain
 * Handles INR payments with ETH conversion and blockchain registration
 */

// ETH to INR conversion rate (you can make this dynamic by fetching from an API)
const ETH_TO_INR_RATE = 217000; // 1 ETH = ₹2,17,000 (approximate)

/**
 * Convert INR amount to ETH
 * @param {number} inrAmount - Amount in INR
 * @returns {string} - Amount in ETH as string
 */
export function convertINRToETH(inrAmount) {
  const ethAmount = inrAmount / ETH_TO_INR_RATE;
  return ethAmount.toFixed(6); // Return with 6 decimal places
}

/**
 * Convert ETH amount to INR
 * @param {number} ethAmount - Amount in ETH
 * @returns {number} - Amount in INR
 */
export function convertETHToINR(ethAmount) {
  return Math.round(ethAmount * ETH_TO_INR_RATE);
}

/**
 * Initialize Razorpay payment
 * @param {Object} options - Payment options
 * @returns {Promise} - Razorpay payment promise
 */
export function initializeRazorpayPayment({
  amount, // Amount in INR (paise)
  campaignId,
  campaignTitle,
  donorEmail = 'donor@example.com',
  donorName = 'Anonymous Donor',
  onSuccess,
  onFailure
}) {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is loaded
    if (typeof window.Razorpay === 'undefined') {
      reject(new Error('Razorpay SDK not loaded. Please include the Razorpay script.'));
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RJuwxk8NAGp7Dc', // Your Razorpay Key ID
      amount: amount, // Amount in paise
      currency: 'INR',
      name: 'FundChain',
      description: `Donation for: ${campaignTitle}`,
      image: '/logo.png', // Your logo
      order_id: '', // Will be generated from backend
      handler: async function (response) {
        console.log('💰 Razorpay payment successful:', response);
        
        try {
          // Verify payment and register on blockchain
          const result = await verifyAndRegisterPayment({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            campaignId,
            amount: amount / 100, // Convert paise to rupees
            ethAmount: convertINRToETH(amount / 100)
          });
          
          if (onSuccess) {
            onSuccess(result);
          }
          resolve(result);
        } catch (error) {
          console.error('❌ Payment verification failed:', error);
          if (onFailure) {
            onFailure(error);
          }
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
        platform: 'fundchain'
      },
      theme: {
        color: '#f97316' // Orange theme to match FundChain
      },
      modal: {
        ondismiss: function() {
          console.log('💸 Payment cancelled by user');
          if (onFailure) {
            onFailure(new Error('Payment cancelled by user'));
          }
          reject(new Error('Payment cancelled by user'));
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  });
}

/**
 * Create Razorpay order (to be called from backend)
 * @param {Object} orderData - Order creation data
 * @returns {Promise} - Order creation response
 */
export async function createRazorpayOrder(orderData) {
  try {
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    throw error;
  }
}

/**
 * Verify payment and register on blockchain
 * @param {Object} paymentData - Payment verification data
 * @returns {Promise} - Verification and blockchain registration result
 */
export async function verifyAndRegisterPayment(paymentData) {
  try {
    console.log('🔍 Verifying payment and registering on blockchain...');
    
    const response = await fetch('/api/payments/verify-and-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      throw new Error(`Payment verification failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Payment verified and registered on blockchain:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    throw error;
  }
}

/**
 * Complete donation flow with server-side order creation and verification
 * @param {Object} donationData - Donation data
 * @returns {Promise} - Donation result
 */
export async function processDonation({
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
    
    // Step 1: Ensure Razorpay SDK is loaded
    console.log('🔄 Loading Razorpay SDK...');
    
    try {
      await loadRazorpaySDK();
      console.log('✅ Razorpay SDK loaded successfully');
    } catch (sdkError) {
      console.error('❌ Razorpay SDK loading failed:', sdkError.message);
      throw new Error(
        'Payment gateway is currently unavailable. ' +
        'This is likely due to an ad blocker or browser extension. ' +
        'Please disable your ad blocker and try again, or use incognito mode.'
      );
    }
    
    // Step 2: Create order on server
    console.log('🔄 Creating payment order...');
    const amountInPaise = Math.round(amountINR * 100);
    
    const orderResponse = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `donation_${campaignId}_${Date.now()}`,
        notes: {
          campaign_id: campaignId,
          campaign_title: campaignTitle,
          donor_name: donorName,
          donor_email: donorEmail,
          amount_inr: amountINR,
          eth_equivalent: ethAmount
        }
      })
    });
    
    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(errorData.error || 'Failed to create payment order');
    }
    
    const orderData = await orderResponse.json();
    console.log('✅ Payment order created:', orderData.order_id);
    
    // Step 3: Initialize Razorpay payment with order
    return new Promise((resolve, reject) => {
      console.log(`💰 Payment amount: ₹${amountINR} = ${amountInPaise} paise`);
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RJuwxk8NAGp7Dc',
        amount: orderData.amount, // Amount from server order
        currency: orderData.currency,
        name: 'FundChain',
        description: `Donation for: ${campaignTitle}`,
        order_id: orderData.order_id, // Order ID from server
        image: '/logo.png',
        handler: async function (response) {
          console.log('💰 Razorpay payment successful:', response);
          
          try {
            // Step 4: Verify payment on server
            console.log('🔄 Verifying payment...');
            
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                campaign_id: campaignId,
                amount_inr: amountINR
              })
            });
            
            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              throw new Error(errorData.error || 'Payment verification failed');
            }
            
            const verifyData = await verifyResponse.json();
            console.log('✅ Payment verified successfully:', verifyData);
            
            const result = {
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              transactionHash: verifyData.transaction_hash,
              amountINR,
              ethAmount,
              campaignId,
              timestamp: verifyData.timestamp,
              message: 'Donation successful and verified!'
            };
            
            resolve(result);
          } catch (error) {
            console.error('❌ Payment verification failed:', error);
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
          platform: 'fundchain'
        },
        theme: {
          color: '#f97316' // Orange theme
        },
        modal: {
          ondismiss: function() {
            console.log('💸 Payment cancelled by user');
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      console.log('🚀 Opening Razorpay payment gateway with order:', orderData.order_id);
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
    
  } catch (error) {
    console.error('❌ Donation processing failed:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('order')) {
      throw new Error('Failed to create payment order. Please try again.');
    } else if (error.message.includes('verification')) {
      throw new Error('Payment completed but verification failed. Please contact support.');
    } else {
      throw error;
    }
  }
}

/**
 * Load Razorpay SDK dynamically with fallback handling
 * @returns {Promise} - Promise that resolves when SDK is loaded
 */
export function loadRazorpaySDK() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined') {
      console.log('✅ Razorpay SDK already loaded');
      resolve();
      return;
    }

    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      reject(new Error('Razorpay SDK can only be loaded in browser environment'));
      return;
    }

    console.log('🔄 Loading Razorpay SDK...');
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.defer = true;
    
    // Set a timeout for loading
    const timeout = setTimeout(() => {
      console.error('❌ Razorpay SDK loading timeout');
      reject(new Error('Razorpay SDK loading timeout - possibly blocked by ad blocker'));
    }, 10000); // 10 second timeout
    
    // Add success handler
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
    
    // Add error handler
    script.onerror = (error) => {
      clearTimeout(timeout);
      console.error('❌ Failed to load Razorpay SDK - possibly blocked by ad blocker:', error);
      
      // Provide user-friendly error message
      const errorMsg = 'Unable to load payment gateway. This might be due to:\n\n' +
        '1. Ad blocker or browser extension blocking Razorpay\n' +
        '2. Network connectivity issues\n' +
        '3. Firewall or security software\n\n' +
        'Please try:\n' +
        '- Disable ad blocker for this site\n' +
        '- Use incognito/private browsing mode\n' +
        '- Try a different browser';
      
      reject(new Error(errorMsg));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Get current ETH to INR rate (you can implement API call here)
 * @returns {Promise<number>} - Current ETH to INR rate
 */
export async function getCurrentETHRate() {
  try {
    // You can implement actual API call to get live rates
    // For now, returning static rate
    return ETH_TO_INR_RATE;
  } catch (error) {
    console.warn('⚠️ Failed to fetch live ETH rate, using default:', ETH_TO_INR_RATE);
    return ETH_TO_INR_RATE;
  }
}
