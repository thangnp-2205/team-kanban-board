'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { createClient } from '@/lib/supabase/client'
import { logActivity } from '@/lib/activity'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'
import { AddColumnButton } from './add-column-button'
import type { ColumnWithCards, CardWithDetails, BoardMember } from '@/types'

interface KanbanBoardProps {
  boardId: string
  columns: ColumnWithCards[]
  members: (BoardMember & { profile: any })[]
}

export function KanbanBoard({ boardId, columns: initialColumns, members }: KanbanBoardProps) {
  const router = useRouter()
  const [columns, setColumns] = useState(initialColumns)
  const [activeCard, setActiveCard] = useState<CardWithDetails | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeColumnId = active.data.current?.columnId
    const activeColumn = columns.find((col) => col.id === activeColumnId)
    const card = activeColumn?.cards.find((card) => card.id === active.id)
    if (card) {
      setActiveCard(card)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    const activeColumnId = active.data.current?.columnId
    const overColumnId = over.data.current?.columnId || overId

    if (activeColumnId === overColumnId) return

    setColumns((prev) => {
      const activeColumn = prev.find((col) => col.id === activeColumnId)
      const overColumn = prev.find((col) => col.id === overColumnId)

      if (!activeColumn || !overColumn) return prev

      const activeCardIndex = activeColumn.cards.findIndex(
        (card) => card.id === activeId
      )

      if (activeCardIndex === -1) return prev

      const [movedCard] = activeColumn.cards.splice(activeCardIndex, 1)

      // Find the position to insert
      const overCardIndex = overColumn.cards.findIndex(
        (card) => card.id === overId
      )

      if (overCardIndex === -1) {
        overColumn.cards.push(movedCard)
      } else {
        overColumn.cards.splice(overCardIndex, 0, movedCard)
      }

      return [...prev]
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeColumnId = active.data.current?.columnId
    const overColumnId = over.data.current?.columnId || over.id

    const column = columns.find((col) => col.id === overColumnId)
    if (!column) return

    const cardIndex = column.cards.findIndex((card) => card.id === active.id)
    if (cardIndex === -1) return

    // Update card position and column in database
    const supabase = createClient()
    await supabase
      .from('cards')
      .update({
        column_id: overColumnId,
        position: cardIndex,
      })
      .eq('id', active.id)

    // Update positions of all cards in the column
    const updates = column.cards.map((card, index) => ({
      id: card.id,
      position: index,
    }))

    for (const update of updates) {
      await supabase
        .from('cards')
        .update({ position: update.position })
        .eq('id', update.id)
    }

    // Log activity if column changed
    if (activeColumnId !== overColumnId) {
      const fromColumn = columns.find((col) => col.id === activeColumnId)
      const toColumn = columns.find((col) => col.id === overColumnId)
      const card = column.cards.find((c) => c.id === active.id)

      await logActivity({
        boardId,
        action: 'moved',
        entityType: 'card',
        entityId: active.id as string,
        metadata: {
          title: card?.title,
          from_column: fromColumn?.title,
          to_column: toColumn?.title,
        },
      })
    }

    router.refresh()
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full">
          <SortableContext
            items={columns.map((col) => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={column.cards}
                members={members}
              />
            ))}
          </SortableContext>

          <AddColumnButton
            boardId={boardId}
            position={columns.length}
          />
        </div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <KanbanCard card={activeCard} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

