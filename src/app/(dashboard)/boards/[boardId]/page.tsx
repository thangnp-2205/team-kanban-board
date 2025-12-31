import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/board/kanban-board'
import { BoardHeader } from '@/components/board/board-header'

interface BoardPageProps {
  params: { boardId: string }
}

export default async function BoardPage({ params }: BoardPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch board with columns and cards
  const { data: board, error } = await supabase
    .from('boards')
    .select(`
      *,
      owner:profiles!boards_owner_id_fkey(id, full_name, email, avatar_url),
      columns(
        *,
        cards(
          *,
          assignee:profiles!cards_assignee_id_fkey(id, full_name, email, avatar_url)
        )
      ),
      board_members(
        *,
        profile:profiles(id, full_name, email, avatar_url)
      )
    `)
    .eq('id', params.boardId)
    .single()

  if (error || !board) {
    notFound()
  }

  // Sort columns by position
  const sortedColumns = board.columns
    .sort((a: any, b: any) => a.position - b.position)
    .map((column: any) => ({
      ...column,
      cards: column.cards.sort((a: any, b: any) => a.position - b.position),
    }))

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <BoardHeader board={board} currentUserId={user.id} />
      <KanbanBoard
        boardId={board.id}
        columns={sortedColumns}
        members={board.board_members}
      />
    </div>
  )
}

