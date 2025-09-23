"use client"

import Script from 'next/script'
import { useState } from 'react'

interface RazorpayScriptProps {
  onLoad?: () => void
  onError?: (error: Error) => void
}

export default function RazorpayScript({ onLoad, onError }: RazorpayScriptProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    console.log('✅ Razorpay Script loaded via Next.js Script component')
    setIsLoaded(true)
    if (onLoad) onLoad()
  }

  const handleError = (error: any) => {
    console.error('❌ Razorpay Script failed to load:', error)
    setHasError(true)
    
    const errorMsg = new Error(
      'Payment gateway blocked by ad blocker or browser extension. ' +
      'Please disable your ad blocker and refresh the page, or try incognito mode.'
    )
    
    if (onError) onError(errorMsg)
  }

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleLoad}
        onError={handleError}
        strategy="lazyOnload"
      />
      
      {/* Status indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-3 py-2 rounded text-xs font-mono ${
            hasError 
              ? 'bg-red-100 text-red-800 border border-red-300' 
              : isLoaded 
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          }`}>
            Razorpay: {hasError ? 'Blocked' : isLoaded ? 'Ready' : 'Loading...'}
          </div>
        </div>
      )}
    </>
  )
}
