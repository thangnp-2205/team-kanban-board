'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MessageSquare, GripVertical } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { CardModal } from './card-modal'
import type { CardWithDetails } from '@/types'

interface KanbanCardProps {
  card: CardWithDetails
  columnId?: string
  isDragging?: boolean
}

export function KanbanCard({ card, columnId, isDragging }: KanbanCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      columnId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isCardDragging = isDragging || isSortableDragging

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-pointer',
          'hover:shadow-md hover:border-gray-300 transition-all',
          'group',
          isCardDragging && 'opacity-50 shadow-lg rotate-3'
        )}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* Card title */}
        <h4 className="font-medium text-gray-900 mb-2 pr-6">{card.title}</h4>

        {/* Card description preview */}
        {card.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Card footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {/* Due date */}
            {card.due_date && (
              <div
                className={cn(
                  'flex items-center gap-1',
                  new Date(card.due_date) < new Date() && 'text-red-500'
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>{formatDate(card.due_date)}</span>
              </div>
            )}

            {/* Comments count */}
            {card.comments_count !== undefined && card.comments_count > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{card.comments_count}</span>
              </div>
            )}
          </div>

          {/* Assignee */}
          {card.assignee && (
            <Avatar
              src={card.assignee.avatar_url}
              name={card.assignee.full_name || card.assignee.email || 'Assignee'}
              size="sm"
            />
          )}
        </div>
      </div>

      {/* Card detail modal */}
      <CardModal
        card={card}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

