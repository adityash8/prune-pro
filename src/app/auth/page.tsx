'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function AuthPage() {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleGSCConnect = async () => {
    setIsConnecting(true)
    
    // TODO: Implement Google OAuth flow
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL + '/auth/callback')}&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/webmasters.readonly')}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`
    
    window.location.href = authUrl
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to PrunePro</h1>
          <p className="text-gray-600">
            Connect your Google Search Console to start analyzing your content
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🧟</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Remove zombie pages before they drain your rankings
            </h2>
            <p className="text-gray-600 text-sm">
              Our AI-powered analysis will identify low-value content and recommend safe actions
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span>Analyze 90 days of GSC data</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span>Calculate ZombieScore for each URL</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span>Recommend Keep/Refresh/Consolidate/Prune/Redirect</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span>Safe-mode simulation before applying changes</span>
            </div>
          </div>

          <Button
            onClick={handleGSCConnect}
            disabled={isConnecting}
            className="w-full"
            size="lg"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Connect Google Search Console
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By connecting, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
