import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  console.log('🧪 Test Razorpay API called')
  
  try {
    // Test environment variables
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    
    console.log('Environment check:')
    console.log('- Key ID exists:', !!keyId)
    console.log('- Key Secret exists:', !!keySecret)
    console.log('- Key ID value:', keyId ? keyId.substring(0, 10) + '...' : 'MISSING')
    
    // Test Razorpay import
    let razorpayImported = false
    try {
      const Razorpay = require('razorpay')
      razorpayImported = true
      console.log('- Razorpay import: SUCCESS')
      
      // Test Razorpay initialization
      if (keyId && keySecret) {
        const instance = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        })
        console.log('- Razorpay instance: SUCCESS')
        
        return NextResponse.json({
          success: true,
          message: 'Razorpay is properly configured',
          checks: {
            keyId: !!keyId,
            keySecret: !!keySecret,
            razorpayImport: true,
            razorpayInstance: true
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          message: 'Missing environment variables',
          checks: {
            keyId: !!keyId,
            keySecret: !!keySecret,
            razorpayImport: true,
            razorpayInstance: false
          }
        })
      }
      
    } catch (importError: any) {
      console.log('- Razorpay import: FAILED', importError.message)
      
      return NextResponse.json({
        success: false,
        message: 'Razorpay import failed',
        error: importError.message,
        checks: {
          keyId: !!keyId,
          keySecret: !!keySecret,
          razorpayImport: false,
          razorpayInstance: false
        }
      })
    }
    
  } catch (error: any) {
    console.error('🔥 Test API error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('🧪 Test order creation called')
  
  try {
    const Razorpay = require('razorpay')
    
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    
    if (!keyId || !keySecret) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: `Key ID: ${!!keyId}, Key Secret: ${!!keySecret}`
      }, { status: 500 })
    }
    
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
    
    const body = await request.json()
    const { amount = 10000 } = body
    
    const options = {
      amount: Math.round(amount),
      currency: 'INR',
      receipt: `test_${Date.now()}`,
    }
    
    console.log('Creating test order with options:', options)
    
    const order = await razorpay.orders.create(options)
    
    console.log('✅ Test order created:', order.id)
    
    return NextResponse.json({
      success: true,
      message: 'Test order created successfully',
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    })
    
  } catch (error: any) {
    console.error('🔥 Test order creation failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Test order creation failed',
      details: error.message,
      code: error.code
    }, { status: 500 })
  }
}
