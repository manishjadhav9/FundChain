import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { ethers } from 'ethers'

// Razorpay key secret for signature verification
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'HS05RbxkPCgFoXE10NO27psh'

// ETH conversion rate
const ETH_TO_INR_RATE = 217000

/**
 * Verify Razorpay payment signature
 */
function verifyRazorpaySignature(orderId, paymentId, signature) {
  const body = orderId + '|' + paymentId
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex')
  
  return expectedSignature === signature
}

/**
 * Convert INR to ETH
 */
function convertINRToETH(inrAmount) {
  return (inrAmount / ETH_TO_INR_RATE).toFixed(6)
}

/**
 * Register donation on blockchain (mock implementation for development)
 */
async function registerDonationOnBlockchain(donationData) {
  try {
    console.log('🔗 Registering donation on blockchain:', donationData)
    
    // For development, simulate blockchain transaction
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Development mode: Simulating blockchain registration...')
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate mock transaction hash
      const mockTxHash = '0x' + crypto.randomBytes(32).toString('hex')
      
      return {
        transactionHash: mockTxHash,
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
        gasUsed: '21000',
        status: 'success'
      }
    }
    
    // Production blockchain integration would go here
    // You would use your smart contract to register the donation
    
    throw new Error('Blockchain integration not implemented for production')
    
  } catch (error) {
    console.error('❌ Blockchain registration failed:', error)
    throw error
  }
}

/**
 * Update campaign data after successful donation
 */
async function updateCampaignData(campaignId, donationAmount, ethAmount) {
  try {
    console.log(`📊 Updating campaign ${campaignId} with donation of ₹${donationAmount} (${ethAmount} ETH)`)
    
    // In a real application, you would update your database here
    // For now, we'll just log the update
    
    return {
      campaignId,
      newDonationAmount: donationAmount,
      newETHAmount: ethAmount,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('❌ Failed to update campaign data:', error)
    throw error
  }
}

export async function POST(request) {
  try {
    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      campaignId,
      amount, // Amount in INR
      ethAmount
    } = await request.json()

    console.log('🔍 Verifying payment:', {
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      campaignId,
      amount
    })

    // Validate required fields
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      )
    }

    if (!campaignId || !amount) {
      return NextResponse.json(
        { error: 'Missing campaign or amount data' },
        { status: 400 }
      )
    }

    // Verify Razorpay signature
    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    )

    if (!isValidSignature) {
      console.error('❌ Invalid Razorpay signature')
      return NextResponse.json(
        { error: 'Payment verification failed - invalid signature' },
        { status: 400 }
      )
    }

    console.log('✅ Razorpay signature verified successfully')

    // Convert amount to ETH if not provided
    const finalETHAmount = ethAmount || convertINRToETH(amount)

    // Register donation on blockchain
    let blockchainResult
    try {
      blockchainResult = await registerDonationOnBlockchain({
        campaignId,
        amountINR: amount,
        ethAmount: finalETHAmount,
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId
      })
      
      console.log('✅ Blockchain registration successful:', blockchainResult.transactionHash)
    } catch (blockchainError) {
      console.error('⚠️ Blockchain registration failed, but payment is valid:', blockchainError.message)
      
      // Even if blockchain fails, we can still record the payment
      blockchainResult = {
        transactionHash: 'pending_' + Date.now(),
        status: 'pending',
        error: blockchainError.message
      }
    }

    // Update campaign data
    const campaignUpdate = await updateCampaignData(campaignId, amount, finalETHAmount)

    // Prepare response
    const response = {
      success: true,
      paymentVerified: true,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      campaignId,
      amountINR: amount,
      ethAmount: finalETHAmount,
      transactionHash: blockchainResult.transactionHash,
      blockchainStatus: blockchainResult.status,
      timestamp: new Date().toISOString(),
      campaignUpdate
    }

    console.log('🎉 Payment verification and registration completed:', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error in payment verification:', error)
    
    return NextResponse.json(
      {
        error: 'Payment verification failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}
