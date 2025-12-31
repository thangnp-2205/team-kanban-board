'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { logActivity } from '@/lib/activity'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'

export function CreateBoardButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to create a board')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('boards')
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Create default columns
    await supabase.from('columns').insert([
      { board_id: data.id, title: 'To Do', position: 0 },
      { board_id: data.id, title: 'In Progress', position: 1 },
      { board_id: data.id, title: 'Done', position: 2 },
    ])

    // Log activity
    await logActivity({
      boardId: data.id,
      action: 'created',
      entityType: 'board',
      entityId: data.id,
      metadata: { title: data.title },
    })

    setIsOpen(false)
    setTitle('')
    setDescription('')
    router.push(`/boards/${data.id}`)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Board
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Board"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Board Title *
            </label>
            <Input
              id="title"
              placeholder="Enter board title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <Textarea
              id="description"
              placeholder="Enter board description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'Creating...' : 'Create Board'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

