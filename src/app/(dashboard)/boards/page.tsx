import { createClient } from '@/lib/supabase/server'
import { BoardList } from '@/components/board/board-list'
import { CreateBoardButton } from '@/components/board/create-board-button'

export default async function BoardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch boards where user is a member
  const { data: boards } = await supabase
    .from('boards')
    .select(`
      *,
      owner:profiles!boards_owner_id_fkey(id, full_name, email, avatar_url),
      board_members(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Boards</h1>
          <p className="text-gray-600 mt-1">
            Manage your projects and collaborate with your team
          </p>
        </div>
        <CreateBoardButton />
      </div>

      <BoardList boards={boards || []} userId={user.id} />
    </div>
  )
}

