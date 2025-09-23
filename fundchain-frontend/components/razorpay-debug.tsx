"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RazorpayDebug() {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  useEffect(() => {
    // Check if Razorpay is already loaded
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      setRazorpayLoaded(true)
      addDebugInfo('✅ Razorpay already loaded')
      return
    }

    // Load Razorpay SDK
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      setRazorpayLoaded(true)
      addDebugInfo('✅ Razorpay SDK loaded successfully')
    }
    script.onerror = () => {
      addDebugInfo('❌ Failed to load Razorpay SDK')
    }
    
    document.head.appendChild(script)
    addDebugInfo('🔄 Loading Razorpay SDK...')

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const testRazorpayPayment = () => {
    if (!razorpayLoaded) {
      addDebugInfo('❌ Razorpay not loaded yet')
      return
    }

    if (typeof window === 'undefined' || !(window as any).Razorpay) {
      addDebugInfo('❌ Razorpay not available on window object')
      return
    }

    addDebugInfo('🚀 Opening Razorpay payment gateway...')

    const options = {
      key: 'rzp_test_RJuwxk8NAGp7Dc',
      amount: 10000, // ₹100 in paise
      currency: 'INR',
      name: 'FundChain Debug Test',
      description: 'Test payment for debugging',
      handler: function (response: any) {
        addDebugInfo(`✅ Payment successful! ID: ${response.razorpay_payment_id}`)
      },
      prefill: {
        name: 'Debug User',
        email: 'debug@fundchain.com',
        contact: '9999999999'
      },
      theme: {
        color: '#f97316'
      },
      modal: {
        ondismiss: function() {
          addDebugInfo('⚠️ Payment cancelled by user')
        }
      }
    }

    try {
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
      addDebugInfo('📱 Razorpay modal opened')
    } catch (error: any) {
      addDebugInfo(`❌ Error opening Razorpay: ${error.message}`)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Razorpay Debug
          <span className={`text-xs px-2 py-1 rounded ${
            razorpayLoaded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {razorpayLoaded ? 'LOADED' : 'LOADING'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testRazorpayPayment}
          disabled={!razorpayLoaded}
          className="w-full"
        >
          💳 Test Razorpay Payment
        </Button>
        
        <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded text-xs">
          <div className="font-medium mb-2">Debug Log:</div>
          {debugInfo.length === 0 ? (
            <div className="text-gray-500">No debug info yet...</div>
          ) : (
            debugInfo.map((info, index) => (
              <div key={index} className="mb-1">{info}</div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
