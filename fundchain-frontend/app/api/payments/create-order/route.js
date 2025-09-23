import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RJuwxk8NAGp7Dc',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'HS05RbxkPCgFoXE10NO27psh',
})

export async function POST(request) {
  try {
    const { amount, currency = 'INR', campaignId, campaignTitle } = await request.json()

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `receipt_${campaignId}_${Date.now()}`,
      notes: {
        campaign_id: campaignId,
        campaign_title: campaignTitle || 'FundChain Campaign',
        platform: 'fundchain'
      }
    }

    console.log('📝 Creating Razorpay order:', options)

    const order = await razorpay.orders.create(options)
    
    console.log('✅ Razorpay order created:', order.id)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RJuwxk8NAGp7Dc'
    })

  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment order',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
