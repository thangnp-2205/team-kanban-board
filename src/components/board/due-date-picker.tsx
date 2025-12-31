'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DueDatePickerProps {
  cardId: string
  currentDueDate?: string | null
  onUpdate?: () => void
}

export function DueDatePicker({ cardId, currentDueDate, onUpdate }: DueDatePickerProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [date, setDate] = useState(
    currentDueDate ? new Date(currentDueDate).toISOString().split('T')[0] : ''
  )
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const supabase = createClient()

    await supabase
      .from('cards')
      .update({ due_date: date ? new Date(date).toISOString() : null })
      .eq('id', cardId)

    setLoading(false)
    setIsEditing(false)
    onUpdate?.()
    router.refresh()
  }

  const handleRemove = async () => {
    setLoading(true)
    const supabase = createClient()

    await supabase
      .from('cards')
      .update({ due_date: null })
      .eq('id', cardId)

    setDate('')
    setLoading(false)
    onUpdate?.()
    router.refresh()
  }

  const isOverdue = currentDueDate && new Date(currentDueDate) < new Date()

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Due Date
      </label>

      {isEditing ? (
        <div className="flex gap-2">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={handleSave} disabled={loading}>
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsEditing(false)
              setDate(
                currentDueDate
                  ? new Date(currentDueDate).toISOString().split('T')[0]
                  : ''
              )
            }}
          >
            Cancel
          </Button>
        </div>
      ) : currentDueDate ? (
        <div
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
            isOverdue ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
          }`}
          onClick={() => setIsEditing(true)}
        >
          <div className="flex items-center gap-2">
            <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
            <span className="font-medium">{formatDate(currentDueDate)}</span>
            {isOverdue && <span className="text-xs bg-red-100 px-2 py-0.5 rounded">Overdue</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              handleRemove()
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full justify-start text-gray-500"
          onClick={() => setIsEditing(true)}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Set due date
        </Button>
      )}
    </div>
  )
}

