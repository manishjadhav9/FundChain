"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { processDonation, convertINRToETH } from '@/lib/razorpay'
import RazorpayScript from '@/components/razorpay-script'

export default function TestPaymentPage() {
  const [amount, setAmount] = useState('100')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [razorpayError, setRazorpayError] = useState<string | null>(null)

  const handleRazorpayLoad = () => {
    setRazorpayLoaded(true)
    setRazorpayError(null)
    console.log('✅ Razorpay loaded for test page')
  }

  const handleRazorpayError = (error: Error) => {
    setRazorpayLoaded(false)
    setRazorpayError(error.message)
    console.error('❌ Razorpay loading error:', error.message)
  }

  const testPayment = async () => {
    if (!amount || parseFloat(amount) < 1) {
      setError('Please enter a valid amount (minimum ₹1)')
      return
    }

    if (!razorpayLoaded) {
      setError('Razorpay is not loaded. Please check for ad blockers.')
      return
    }

    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      console.log('🧪 Starting payment test...')
      
      const donationResult = await processDonation({
        campaignId: 'test-campaign-123',
        campaignTitle: 'Test Campaign for Payment Gateway',
        amountINR: parseFloat(amount),
        donorName: 'Test User',
        donorEmail: 'test@fundchain.com'
      })

      console.log('✅ Payment test successful:', donationResult)
      setResult(donationResult)
    } catch (err: any) {
      console.error('❌ Payment test failed:', err)
      setError(err.message || 'Payment test failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const ethAmount = amount ? convertINRToETH(parseFloat(amount)) : '0'

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Razorpay Payment Test</h1>
        <p className="text-muted-foreground">
          Test the complete Razorpay integration with server-side order creation and verification.
        </p>
      </div>

      {/* Razorpay Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Razorpay Status
            <span className={`text-xs px-2 py-1 rounded ${
              razorpayError 
                ? 'bg-red-100 text-red-800' 
                : razorpayLoaded 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}>
              {razorpayError ? 'BLOCKED' : razorpayLoaded ? 'READY' : 'LOADING'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {razorpayError ? (
            <div className="text-red-600">
              <p className="font-medium">❌ Razorpay Blocked</p>
              <p className="text-sm mt-1">{razorpayError}</p>
              <div className="mt-3 text-xs">
                <p><strong>Solutions:</strong></p>
                <ul className="list-disc list-inside mt-1">
                  <li>Disable ad blocker for this site</li>
                  <li>Use incognito/private browsing mode</li>
                  <li>Try a different browser</li>
                </ul>
              </div>
            </div>
          ) : razorpayLoaded ? (
            <p className="text-green-600">✅ Razorpay SDK loaded and ready for payments</p>
          ) : (
            <p className="text-yellow-600">🔄 Loading Razorpay SDK...</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Test Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>💳 Test Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in INR"
              min="1"
              max="100000"
              step="1"
            />
            {amount && (
              <p className="text-xs text-muted-foreground mt-1">
                ≈ {ethAmount} ETH
              </p>
            )}
          </div>

          <Button 
            onClick={testPayment}
            disabled={isProcessing || !razorpayLoaded || !amount}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border border-current border-t-transparent rounded-full" />
                Processing Payment...
              </>
            ) : (
              '💳 Test Payment Gateway'
            )}
          </Button>

          <div className="text-xs text-muted-foreground">
            <p><strong>Test Card Details:</strong></p>
            <p>Card: 4111 1111 1111 1111</p>
            <p>Expiry: Any future date</p>
            <p>CVV: Any 3 digits</p>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="pt-6">
            <div className="text-red-600">
              <p className="font-medium">❌ Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Result */}
      {result && (
        <Card className="mb-6 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Payment ID:</strong> {result.paymentId}</p>
              <p><strong>Order ID:</strong> {result.orderId}</p>
              <p><strong>Amount:</strong> ₹{result.amountINR}</p>
              <p><strong>ETH Equivalent:</strong> {result.ethAmount} ETH</p>
              <p><strong>Transaction Hash:</strong> {result.transactionHash}</p>
              <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}</p>
              <p><strong>Message:</strong> {result.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Flow */}
      <Card>
        <CardHeader>
          <CardTitle>🔄 Integration Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>1. SDK Loading:</strong> Load Razorpay checkout.js with ad blocker detection</p>
            <p><strong>2. Order Creation:</strong> Create order on server with proper amount validation</p>
            <p><strong>3. Payment Gateway:</strong> Open Razorpay modal with order details</p>
            <p><strong>4. Payment Processing:</strong> User completes payment with test card</p>
            <p><strong>5. Signature Verification:</strong> Verify payment signature on server</p>
            <p><strong>6. Blockchain Registration:</strong> Record transaction (simulated)</p>
          </div>
        </CardContent>
      </Card>

      {/* Razorpay Script Component */}
      <RazorpayScript 
        onLoad={handleRazorpayLoad}
        onError={handleRazorpayError}
      />
    </div>
  )
}
