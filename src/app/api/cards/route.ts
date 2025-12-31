import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST: Create a new card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { column_id, title, description, assignee_id, due_date, position } = body

    if (!column_id || !title?.trim()) {
      return NextResponse.json(
        { error: 'Column ID and title are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get board ID from column
    const { data: column } = await supabase
      .from('columns')
      .select('board_id')
      .eq('id', column_id)
      .single()

    if (!column) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 })
    }

    // Check if user is a member of the board
    const { data: membership } = await supabase
      .from('board_members')
      .select('id')
      .eq('board_id', column.board_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create card
    const { data: card, error } = await supabase
      .from('cards')
      .insert({
        column_id,
        title: title.trim(),
        description: description?.trim() || null,
        assignee_id: assignee_id || null,
        due_date: due_date || null,
        position: position ?? 0,
      })
      .select(`
        *,
        assignee:profiles!cards_assignee_id_fkey(id, full_name, email, avatar_url)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      board_id: column.board_id,
      user_id: user.id,
      action: 'created',
      entity_type: 'card',
      entity_id: card.id,
      metadata: { title: card.title },
    })

    return NextResponse.json(card)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// PATCH: Update a card
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, column_id, title, description, assignee_id, due_date, position } = body

    if (!id) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current card and board info
    const { data: currentCard } = await supabase
      .from('cards')
      .select('*, columns(board_id)')
      .eq('id', id)
      .single()

    if (!currentCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const boardId = (currentCard.columns as any).board_id

    // Check if user is a member
    const { data: membership } = await supabase
      .from('board_members')
      .select('id')
      .eq('board_id', boardId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Build updates
    const updates: Record<string, any> = {}
    if (column_id !== undefined) updates.column_id = column_id
    if (title !== undefined) updates.title = title.trim()
    if (description !== undefined) updates.description = description?.trim() || null
    if (assignee_id !== undefined) updates.assignee_id = assignee_id
    if (due_date !== undefined) updates.due_date = due_date
    if (position !== undefined) updates.position = position

    const { data: card, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        assignee:profiles!cards_assignee_id_fkey(id, full_name, email, avatar_url)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      board_id: boardId,
      user_id: user.id,
      action: 'updated',
      entity_type: 'card',
      entity_id: id,
      metadata: { title: card.title, updates },
    })

    return NextResponse.json(card)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// DELETE: Delete a card
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Card ID is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get card and board info
  const { data: card } = await supabase
    .from('cards')
    .select('*, columns(board_id)')
    .eq('id', id)
    .single()

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  const boardId = (card.columns as any).board_id

  // Log activity before deleting
  await supabase.from('activity_logs').insert({
    board_id: boardId,
    user_id: user.id,
    action: 'deleted',
    entity_type: 'card',
    entity_id: id,
    metadata: { title: card.title },
  })

  const { error } = await supabase.from('cards').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Card deleted successfully' })
}

