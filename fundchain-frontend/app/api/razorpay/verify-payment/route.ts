import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      campaign_id,
      amount_inr 
    } = body

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification parameters' },
        { status: 400 }
      )
    }

    // Verify payment signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET!
    
    if (!key_secret) {
      console.error('Razorpay key secret not found in environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Generate expected signature
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    console.log('Payment verification:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      received_signature: razorpay_signature,
      generated_signature,
      signatures_match: generated_signature === razorpay_signature
    })

    // Verify signature
    if (generated_signature !== razorpay_signature) {
      console.error('Payment signature verification failed')
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment verification failed - invalid signature'
        },
        { status: 400 }
      )
    }

    // Payment verified successfully
    console.log('✅ Payment verified successfully:', razorpay_payment_id)

    // Here you can add logic to:
    // 1. Update campaign donation amount in database
    // 2. Record transaction in blockchain
    // 3. Send confirmation emails
    // 4. Update campaign statistics

    // For now, we'll simulate blockchain registration
    const mock_tx_hash = '0x' + crypto.randomBytes(32).toString('hex')

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      transaction_hash: mock_tx_hash,
      campaign_id,
      amount_inr,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error verifying payment:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Payment verification failed',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
