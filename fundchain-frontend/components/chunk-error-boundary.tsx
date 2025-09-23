"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

interface ChunkErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ChunkErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>
}

export class ChunkErrorBoundary extends React.Component<
  ChunkErrorBoundaryProps,
  ChunkErrorBoundaryState
> {
  constructor(props: ChunkErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ChunkErrorBoundaryState {
    // Check if it's a chunk loading error
    const isChunkError = 
      error.name === 'ChunkLoadError' ||
      error.message.includes('Loading chunk') ||
      error.message.includes('webpack') ||
      error.stack?.includes('webpack')

    return {
      hasError: true,
      error: isChunkError ? error : undefined
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ChunkErrorBoundary caught an error:', error, errorInfo)
    
    // Log chunk errors specifically
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      console.error('🚨 Chunk Loading Error Detected:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }

    this.setState({
      error,
      errorInfo
    })
  }

  handleRetry = () => {
    // Clear the error state
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    
    // Force a full page reload to clear webpack cache
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      }

      // Default chunk error UI
      return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Page Loading Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  We encountered an issue loading this page. This usually happens when:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>The application was updated while you were browsing</li>
                  <li>Your browser cache contains outdated files</li>
                  <li>There's a temporary network connectivity issue</li>
                </ul>
              </div>

              {this.state.error && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-red-600 font-mono">
                    <p><strong>Error:</strong> {this.state.error.name}</p>
                    <p><strong>Message:</strong> {this.state.error.message}</p>
                  </div>
                </details>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded">
                <p><strong>💡 Quick Fix:</strong></p>
                <p>Try refreshing the page (Ctrl+F5 or Cmd+Shift+R) to clear the cache.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for handling chunk loading errors in functional components
export function useChunkErrorHandler() {
  React.useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      const error = event.error
      
      if (error && (
        error.name === 'ChunkLoadError' || 
        error.message?.includes('Loading chunk') ||
        error.message?.includes('webpack')
      )) {
        console.error('🚨 Chunk loading error detected, reloading page...', error)
        
        // Show user-friendly message before reload
        const shouldReload = confirm(
          'The page needs to be refreshed due to an update. Click OK to reload.'
        )
        
        if (shouldReload) {
          window.location.reload()
        }
      }
    }

    // Listen for unhandled errors
    window.addEventListener('error', handleChunkError)
    
    // Listen for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      
      if (error && (
        error.name === 'ChunkLoadError' ||
        error.message?.includes('Loading chunk') ||
        error.message?.includes('webpack')
      )) {
        console.error('🚨 Chunk loading promise rejection detected, reloading page...', error)
        event.preventDefault() // Prevent the default unhandled rejection behavior
        
        const shouldReload = confirm(
          'The page needs to be refreshed due to an update. Click OK to reload.'
        )
        
        if (shouldReload) {
          window.location.reload()
        }
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleChunkError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])
}

export default ChunkErrorBoundary
