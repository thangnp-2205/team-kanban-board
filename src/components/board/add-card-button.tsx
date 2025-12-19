'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import type { BoardMember } from '@/types'

interface AddCardButtonProps {
  columnId: string
  position: number
  members: (BoardMember & { profile: any })[]
}

export function AddCardButton({ columnId, position, members }: AddCardButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)

    const supabase = createClient()
    await supabase.from('cards').insert({
      column_id: columnId,
      title: title.trim(),
      description: description.trim() || null,
      assignee_id: assigneeId,
      position,
    })

    setIsOpen(false)
    setTitle('')
    setDescription('')
    setAssigneeId(null)
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <Button
        variant="ghost"
        className="w-full mt-3 justify-start text-gray-500 hover:text-gray-700"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add a card
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Card"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title *
            </label>
            <Input
              id="title"
              placeholder="Enter card title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="assignee" className="text-sm font-medium text-gray-700">
              Assign to
            </label>
            <select
              id="assignee"
              value={assigneeId || ''}
              onChange={(e) => setAssigneeId(e.target.value || null)}
              className="w-full h-9 rounded-md border border-gray-200 px-3 py-1 text-sm"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.profile?.full_name || member.profile?.email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'Creating...' : 'Add Card'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

