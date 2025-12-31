import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: { boardId: string }
}

// GET: Get a specific board with all details
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { boardId } = params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
    .eq('id', boardId)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 })
  }

  return NextResponse.json(board)
}

// PATCH: Update a board
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { boardId } = params

  try {
    const body = await request.json()
    const { title, description } = body

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to update
    const { data: membership } = await supabase
      .from('board_members')
      .select('role')
      .eq('board_id', boardId)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const updates: Record<string, any> = {}
    if (title !== undefined) updates.title = title.trim()
    if (description !== undefined) updates.description = description?.trim() || null

    const { data: board, error } = await supabase
      .from('boards')
      .update(updates)
      .eq('id', boardId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      board_id: boardId,
      user_id: user.id,
      action: 'updated',
      entity_type: 'board',
      entity_id: boardId,
      metadata: updates,
    })

    return NextResponse.json(board)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// DELETE: Delete a board
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { boardId } = params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is the owner
  const { data: board } = await supabase
    .from('boards')
    .select('owner_id, title')
    .eq('id', boardId)
    .single()

  if (!board || board.owner_id !== user.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const { error } = await supabase.from('boards').delete().eq('id', boardId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Board deleted successfully' })
}

