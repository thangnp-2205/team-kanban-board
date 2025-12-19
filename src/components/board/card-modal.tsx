'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import type { CardWithDetails, Comment, Profile } from '@/types'

interface CardModalProps {
  card: CardWithDetails
  isOpen: boolean
  onClose: () => void
}

export function CardModal({ card, isOpen, onClose }: CardModalProps) {
  const router = useRouter()
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [comments, setComments] = useState<(Comment & { user: Profile })[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchComments()
    }
  }, [isOpen])

  const fetchComments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
      .eq('card_id', card.id)
      .order('created_at', { ascending: true })

    if (data) {
      setComments(data as any)
    }
  }

  const handleUpdate = async () => {
    if (!title.trim()) return

    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('cards')
      .update({
        title: title.trim(),
        description: description.trim() || null,
      })
      .eq('id', card.id)

    setLoading(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this card?')) return

    const supabase = createClient()
    await supabase.from('cards').delete().eq('id', card.id)
    onClose()
    router.refresh()
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('comments').insert({
      card_id: card.id,
      user_id: user.id,
      content: newComment.trim(),
    })

    setNewComment('')
    fetchComments()
  }

  const handleDeleteComment = async (commentId: string) => {
    const supabase = createClient()
    await supabase.from('comments').delete().eq('id', commentId)
    fetchComments()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Card Details"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdate}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleUpdate}
            rows={4}
            placeholder="Add a description..."
          />
        </div>

        {/* Assignee info */}
        {card.assignee && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar
              src={card.assignee.avatar_url}
              name={card.assignee.full_name || card.assignee.email || 'Assignee'}
              size="md"
            />
            <div>
              <p className="font-medium text-gray-900">
                {card.assignee.full_name || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500">Assigned</p>
            </div>
          </div>
        )}

        {/* Comments section */}
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-900 mb-4">
            Comments ({comments.length})
          </h4>

          {/* Comments list */}
          <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                <Avatar
                  src={comment.user?.avatar_url}
                  name={comment.user?.full_name || comment.user?.email || 'User'}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">
                      {comment.user?.full_name || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 ml-auto"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add comment */}
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAddComment()
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Delete button */}
        <div className="flex justify-end border-t pt-4">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Card
          </Button>
        </div>
      </div>
    </Modal>
  )
}

