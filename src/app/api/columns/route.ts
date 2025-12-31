import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST: Create a new column
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { board_id, title, position } = body

    if (!board_id || !title?.trim()) {
      return NextResponse.json(
        { error: 'Board ID and title are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a member of the board
    const { data: membership } = await supabase
      .from('board_members')
      .select('id')
      .eq('board_id', board_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create column
    const { data: column, error } = await supabase
      .from('columns')
      .insert({
        board_id,
        title: title.trim(),
        position: position ?? 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      board_id,
      user_id: user.id,
      action: 'created',
      entity_type: 'column',
      entity_id: column.id,
      metadata: { title: column.title },
    })

    return NextResponse.json(column)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// PATCH: Update a column
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, position } = body

    if (!id) {
      return NextResponse.json({ error: 'Column ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get column and board info
    const { data: currentColumn } = await supabase
      .from('columns')
      .select('board_id, title')
      .eq('id', id)
      .single()

    if (!currentColumn) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 })
    }

    // Check if user is a member
    const { data: membership } = await supabase
      .from('board_members')
      .select('id')
      .eq('board_id', currentColumn.board_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Build updates
    const updates: Record<string, any> = {}
    if (title !== undefined) updates.title = title.trim()
    if (position !== undefined) updates.position = position

    const { data: column, error } = await supabase
      .from('columns')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      board_id: currentColumn.board_id,
      user_id: user.id,
      action: 'updated',
      entity_type: 'column',
      entity_id: id,
      metadata: { title: column.title, old_title: currentColumn.title },
    })

    return NextResponse.json(column)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// DELETE: Delete a column
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Column ID is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get column info
  const { data: column } = await supabase
    .from('columns')
    .select('board_id, title')
    .eq('id', id)
    .single()

  if (!column) {
    return NextResponse.json({ error: 'Column not found' }, { status: 404 })
  }

  // Check if user is admin or owner
  const { data: membership } = await supabase
    .from('board_members')
    .select('role')
    .eq('board_id', column.board_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Log activity before deleting
  await supabase.from('activity_logs').insert({
    board_id: column.board_id,
    user_id: user.id,
    action: 'deleted',
    entity_type: 'column',
    entity_id: id,
    metadata: { title: column.title },
  })

  const { error } = await supabase.from('columns').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Column deleted successfully' })
}

