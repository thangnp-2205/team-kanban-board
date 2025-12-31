import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BoardNotFound() {
  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Board not found
        </h2>
        <p className="text-gray-600 mb-6">
          The board you&apos;re looking for doesn&apos;t exist or you don&apos;t have
          permission to view it.
        </p>
        <Link href="/boards">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            Go to Boards
          </Button>
        </Link>
      </div>
    </div>
  )
}

