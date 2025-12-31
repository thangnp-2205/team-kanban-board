'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { logActivity } from '@/lib/activity'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KanbanCard } from './kanban-card'
import { AddCardButton } from './add-card-button'
import type { ColumnWithCards, CardWithDetails, BoardMember } from '@/types'

interface KanbanColumnProps {
  column: ColumnWithCards
  cards: CardWithDetails[]
  members: (BoardMember & { profile: any })[]
}

export function KanbanColumn({ column, cards, members }: KanbanColumnProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(column.title)

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      columnId: column.id,
    },
  })

  const handleUpdateTitle = async () => {
    if (!title.trim() || title === column.title) {
      setTitle(column.title)
      setIsEditing(false)
      return
    }

    const supabase = createClient()
    await supabase
      .from('columns')
      .update({ title: title.trim() })
      .eq('id', column.id)

    // Log activity
    await logActivity({
      boardId: column.board_id,
      action: 'updated',
      entityType: 'column',
      entityId: column.id,
      metadata: { title: title.trim(), old_title: column.title },
    })

    setIsEditing(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this column and all its cards?')) return

    const supabase = createClient()

    // Log activity before deleting
    await logActivity({
      boardId: column.board_id,
      action: 'deleted',
      entityType: 'column',
      entityId: column.id,
      metadata: { title: column.title },
    })

    await supabase.from('columns').delete().eq('id', column.id)
    router.refresh()
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-80 bg-gray-100 rounded-xl p-4 flex flex-col max-h-full',
        isOver && 'ring-2 ring-primary-400 ring-offset-2'
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdateTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdateTitle()
              if (e.key === 'Escape') {
                setTitle(column.title)
                setIsEditing(false)
              }
            }}
            className="font-semibold text-gray-900"
            autoFocus
          />
        ) : (
          <h3
            className="font-semibold text-gray-900 cursor-pointer hover:text-primary-600"
            onClick={() => setIsEditing(true)}
          >
            {column.title}
          </h3>
        )}

        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            {cards.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-red-600"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards container */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
        <SortableContext
          items={cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              columnId={column.id}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add card button */}
      <AddCardButton
        columnId={column.id}
        position={cards.length}
        members={members}
      />
    </div>
  )
}

