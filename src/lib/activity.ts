import { createClient } from '@/lib/supabase/client'
import type { ActivityAction, EntityType } from '@/types'

interface LogActivityParams {
  boardId: string
  action: ActivityAction
  entityType: EntityType
  entityId: string
  metadata?: Record<string, any>
}

export async function logActivity({
  boardId,
  action,
  entityType,
  entityId,
  metadata = {},
}: LogActivityParams) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      board_id: boardId,
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    })
    .select()
    .single()

  if (error) {
    console.error('Error logging activity:', error)
    return null
  }

  return data
}

// Helper to get board ID from column ID
export async function getBoardIdFromColumnId(columnId: string): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('columns')
    .select('board_id')
    .eq('id', columnId)
    .single()

  return data?.board_id || null
}

// Helper to get board ID from card ID
export async function getBoardIdFromCardId(cardId: string): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('cards')
    .select('column_id')
    .eq('id', cardId)
    .single()

  if (!data?.column_id) return null

  return getBoardIdFromColumnId(data.column_id)
}

