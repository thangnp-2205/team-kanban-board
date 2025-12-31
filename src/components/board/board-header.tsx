'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Activity, MoreHorizontal, Trash2, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ShareBoardModal } from './share-board-modal'
import { ActivityLogPanel } from './activity-log'

interface BoardHeaderProps {
  board: any
  currentUserId: string
}

export function BoardHeader({ board, currentUserId }: BoardHeaderProps) {
  const router = useRouter()
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isActivityOpen, setIsActivityOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [title, setTitle] = useState(board.title)
  const [description, setDescription] = useState(board.description || '')
  const [loading, setLoading] = useState(false)

  const isOwner = board.owner_id === currentUserId

  const handleUpdateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('boards')
      .update({
        title: title.trim(),
        description: description.trim() || null,
      })
      .eq('id', board.id)

    // Log activity
    await supabase.from('activity_logs').insert({
      board_id: board.id,
      user_id: currentUserId,
      action: 'updated',
      entity_type: 'board',
      entity_id: board.id,
      metadata: { title: title.trim() },
    })

    setLoading(false)
    setIsEditOpen(false)
    router.refresh()
  }

  const handleDeleteBoard = async () => {
    if (!confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return
    }

    const supabase = createClient()
    await supabase.from('boards').delete().eq('id', board.id)
    router.push('/boards')
  }

  return (
    <>
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/boards">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{board.title}</h1>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {board.description && (
                <p className="text-sm text-gray-500">{board.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Activity Log button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsActivityOpen(true)}
            >
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </Button>

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

            {/* Share button */}
            <Button variant="outline" size="sm" onClick={() => setIsShareOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Share
            </Button>

            {/* More options menu */}
            {isOwner && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>

                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20">
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                        onClick={handleDeleteBoard}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Board
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareBoardModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        boardId={board.id}
        members={board.board_members || []}
        currentUserId={currentUserId}
        isOwner={isOwner}
      />

      {/* Activity Log Modal */}
      <Modal
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
        title="Activity Log"
        className="max-w-lg"
      >
        <ActivityLogPanel boardId={board.id} />
      </Modal>

      {/* Edit Board Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Board"
      >
        <form onSubmit={handleUpdateBoard} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

