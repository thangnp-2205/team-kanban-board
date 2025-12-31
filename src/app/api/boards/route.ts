import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST: Create a new board
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create board
    const { data: board, error } = await supabase
      .from('boards')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create default columns
    await supabase.from('columns').insert([
      { board_id: board.id, title: 'To Do', position: 0 },
      { board_id: board.id, title: 'In Progress', position: 1 },
      { board_id: board.id, title: 'Done', position: 2 },
    ])

    // Log activity
    await supabase.from('activity_logs').insert({
      board_id: board.id,
      user_id: user.id,
      action: 'created',
      entity_type: 'board',
      entity_id: board.id,
      metadata: { title: board.title },
    })

    return NextResponse.json(board)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// GET: List all boards for current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: boards, error } = await supabase
    .from('boards')
    .select(`
      *,
      owner:profiles!boards_owner_id_fkey(id, full_name, email, avatar_url),
      board_members(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(boards)
}

