'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { logActivity } from '@/lib/activity'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AddColumnButtonProps {
  boardId: string
  position: number
}

export function AddColumnButton({ boardId, position }: AddColumnButtonProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!title.trim()) return

    setLoading(true)
    const supabase = createClient()
    const { data: column } = await supabase.from('columns').insert({
      board_id: boardId,
      title: title.trim(),
      position,
    }).select().single()

    // Log activity
    if (column) {
      await logActivity({
        boardId,
        action: 'created',
        entityType: 'column',
        entityId: column.id,
        metadata: { title: column.title },
      })
    }

    setTitle('')
    setIsAdding(false)
    setLoading(false)
    router.refresh()
  }

  if (isAdding) {
    return (
      <div className="flex-shrink-0 w-80 bg-gray-100 rounded-xl p-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter column title..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
            if (e.key === 'Escape') {
              setTitle('')
              setIsAdding(false)
            }
          }}
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={loading || !title.trim()}
          >
            {loading ? 'Adding...' : 'Add Column'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setTitle('')
              setIsAdding(false)
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0">
      <Button
        variant="outline"
        className="w-80 h-12 border-dashed border-2 hover:border-primary-400 hover:text-primary-600"
        onClick={() => setIsAdding(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Column
      </Button>
    </div>
  )
}

