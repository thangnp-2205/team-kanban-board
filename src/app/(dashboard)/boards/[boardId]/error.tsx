'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function BoardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Board error:', error)
  }, [error])

  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn&apos;t load this board. This might be because the board doesn&apos;t exist
          or you don&apos;t have permission to view it.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          <Link href="/boards">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Go to Boards
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

