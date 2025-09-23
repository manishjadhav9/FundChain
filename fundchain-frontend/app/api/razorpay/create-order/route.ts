import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

// Validate environment variables
if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
  console.error('❌ NEXT_PUBLIC_RAZORPAY_KEY_ID is not set in environment variables')
}
if (!process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ RAZORPAY_KEY_SECRET is not set in environment variables')
}

// Initialize Razorpay instance
let razorpay: Razorpay | null = null

try {
  razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })
  console.log('✅ Razorpay instance initialized successfully')
} catch (error) {
  console.error('❌ Failed to initialize Razorpay:', error)
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Received order creation request')
    
    // Check if Razorpay is initialized
    if (!razorpay) {
      console.error('❌ Razorpay instance not initialized')
      return NextResponse.json(
        { 
          error: 'Payment gateway not configured',
          details: 'Razorpay instance initialization failed. Check environment variables.'
        },
        { status: 500 }
      )
    }
    
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Missing Razorpay environment variables')
      return NextResponse.json(
        { 
          error: 'Payment gateway configuration error',
          details: 'Missing required environment variables'
        },
        { status: 500 }
      )
    }
    
    const body = await request.json()
    console.log('📋 Request body:', { ...body, notes: '...' }) // Don't log sensitive notes
    
    const { amount, currency = 'INR', receipt, notes } = body

    // Validate required fields
    if (!amount || amount < 100) {
      console.log('❌ Invalid amount:', amount)
      return NextResponse.json(
        { error: 'Amount is required and must be at least 100 paise (₹1)' },
        { status: 400 }
      )
    }

    // Create order options
    const options = {
      amount: Math.round(amount), // Amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    }

    console.log('🔄 Creating Razorpay order with options:', {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt
    })

    // Create order using Razorpay API
    const order = await razorpay.orders.create(options)

    console.log('✅ Razorpay order created successfully:', {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    })

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    })
  } catch (error: any) {
    console.error('❌ Error creating Razorpay order:', {
      message: error.message,
      code: error.code,
      description: error.description,
      source: error.source,
      step: error.step,
      reason: error.reason,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
    
    // Provide specific error messages based on error type
    let errorMessage = 'Failed to create order'
    let errorDetails = error.message || 'Unknown error occurred'
    
    if (error.code === 'BAD_REQUEST_ERROR') {
      errorMessage = 'Invalid request parameters'
      errorDetails = error.description || 'Please check the payment amount and try again'
    } else if (error.code === 'GATEWAY_ERROR') {
      errorMessage = 'Payment gateway error'
      errorDetails = 'Please try again in a few moments'
    } else if (error.code === 'SERVER_ERROR') {
      errorMessage = 'Server error'
      errorDetails = 'Please try again later'
    } else if (error.message?.includes('key_id')) {
      errorMessage = 'Configuration error'
      errorDetails = 'Payment gateway configuration issue'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    )
  }
}
