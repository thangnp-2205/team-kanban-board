'use client'

import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Users } from 'lucide-react'

interface BoardListProps {
  boards: any[]
  userId: string
}

export function BoardList({ boards, userId }: BoardListProps) {
  if (boards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No boards yet</h3>
        <p className="text-gray-600">Create your first board to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <Link key={board.id} href={`/boards/${board.id}`}>
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span className="group-hover:text-primary-600 transition-colors">
                  {board.title}
                </span>
                {board.owner_id === userId && (
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                    Owner
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {board.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {board.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Avatar
                    src={board.owner?.avatar_url}
                    name={board.owner?.full_name || board.owner?.email || 'Owner'}
                    size="sm"
                  />
                  <span>{board.owner?.full_name || 'Unknown'}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{board.board_members?.[0]?.count || 1}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Updated {formatRelativeTime(board.updated_at)}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

