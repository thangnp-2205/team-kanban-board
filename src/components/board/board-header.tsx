'use client'

import Link from 'next/link'
import { ArrowLeft, Settings, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import type { Board } from '@/types'

interface BoardHeaderProps {
  board: any
}

export function BoardHeader({ board }: BoardHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/boards">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{board.title}</h1>
            {board.description && (
              <p className="text-sm text-gray-500">{board.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Members avatars */}
          <div className="flex -space-x-2">
            {board.board_members?.slice(0, 5).map((member: any) => (
              <Avatar
                key={member.id}
                src={member.profile?.avatar_url}
                name={member.profile?.full_name || member.profile?.email || 'Member'}
                size="sm"
                className="border-2 border-white"
              />
            ))}
            {board.board_members?.length > 5 && (
              <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                +{board.board_members.length - 5}
              </div>
            )}
          </div>

          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}

