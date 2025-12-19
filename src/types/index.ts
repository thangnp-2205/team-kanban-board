// Database Types for Supabase

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Board {
  id: string
  title: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface BoardMember {
  id: string
  board_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

export interface Column {
  id: string
  board_id: string
  title: string
  position: number
  created_at: string
}

export interface Card {
  id: string
  column_id: string
  title: string
  description: string | null
  position: number
  assignee_id: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  card_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  board_id: string
  user_id: string
  action: ActivityAction
  entity_type: EntityType
  entity_id: string
  metadata: Record<string, any>
  created_at: string
}

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'moved'
  | 'assigned'
  | 'unassigned'
  | 'commented'

export type EntityType =
  | 'board'
  | 'column'
  | 'card'
  | 'comment'
  | 'member'

// Extended types with relations
export interface CardWithDetails extends Card {
  assignee?: Profile | null
  comments_count?: number
}

export interface ColumnWithCards extends Column {
  cards: CardWithDetails[]
}

export interface BoardWithDetails extends Board {
  columns: ColumnWithCards[]
  members: (BoardMember & { profile: Profile })[]
  owner: Profile
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// Form types
export interface CreateBoardInput {
  title: string
  description?: string
}

export interface UpdateBoardInput {
  title?: string
  description?: string
}

export interface CreateColumnInput {
  board_id: string
  title: string
  position?: number
}

export interface UpdateColumnInput {
  title?: string
  position?: number
}

export interface CreateCardInput {
  column_id: string
  title: string
  description?: string
  assignee_id?: string
  due_date?: string
}

export interface UpdateCardInput {
  title?: string
  description?: string
  column_id?: string
  position?: number
  assignee_id?: string | null
  due_date?: string | null
}

export interface MoveCardInput {
  card_id: string
  source_column_id: string
  destination_column_id: string
  new_position: number
}

export interface CreateCommentInput {
  card_id: string
  content: string
}

export interface UpdateCommentInput {
  content: string
}

