'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { logActivity, getBoardIdFromCardId } from '@/lib/activity'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import type { BoardMember, Profile } from '@/types'

interface AssigneePickerProps {
  cardId: string
  cardTitle: string
  currentAssignee?: Profile | null
  members: (BoardMember & { profile: Profile })[]
  onUpdate?: () => void
}

export function AssigneePicker({
  cardId,
  cardTitle,
  currentAssignee,
  members,
  onUpdate,
}: AssigneePickerProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAssign = async (userId: string | null) => {
    setLoading(true)
    const supabase = createClient()

    await supabase
      .from('cards')
      .update({ assignee_id: userId })
      .eq('id', cardId)

    // Log activity
    const boardId = await getBoardIdFromCardId(cardId)
    if (boardId) {
      const assignee = members.find((m) => m.user_id === userId)
      if (userId) {
        await logActivity({
          boardId,
          action: 'assigned',
          entityType: 'card',
          entityId: cardId,
          metadata: {
            title: cardTitle,
            assignee_name: assignee?.profile?.full_name || assignee?.profile?.email,
          },
        })
      } else {
        await logActivity({
          boardId,
          action: 'unassigned',
          entityType: 'card',
          entityId: cardId,
          metadata: { title: cardTitle },
        })
      }
    }

    setLoading(false)
    setIsOpen(false)
    onUpdate?.()
    router.refresh()
  }

  return (
    <div className="relative">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Assignee</label>

        {currentAssignee ? (
          <div
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Avatar
              src={currentAssignee.avatar_url}
              name={currentAssignee.full_name || currentAssignee.email || 'Assignee'}
              size="md"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {currentAssignee.full_name || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500">{currentAssignee.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleAssign(null)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start text-gray-500"
            onClick={() => setIsOpen(!isOpen)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Assign to someone
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border z-20 max-h-60 overflow-y-auto">
            {members.map((member) => (
              <button
                key={member.id}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                onClick={() => handleAssign(member.user_id)}
                disabled={loading}
              >
                <Avatar
                  src={member.profile?.avatar_url}
                  name={member.profile?.full_name || member.profile?.email || 'Member'}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">
                    {member.profile?.full_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">{member.profile?.email}</p>
                </div>
                {currentAssignee?.id === member.user_id && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

