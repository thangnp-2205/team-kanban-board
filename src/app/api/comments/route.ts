import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Get comments for a card
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cardId = searchParams.get('cardId')

  if (!cardId) {
    return NextResponse.json({ error: 'Card ID is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles(id, full_name, email, avatar_url)
    `)
    .eq('card_id', cardId)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(comments)
}

// POST: Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { card_id, content } = body

    if (!card_id || !content?.trim()) {
      return NextResponse.json(
        { error: 'Card ID and content are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get card and board info
    const { data: card } = await supabase
      .from('cards')
      .select('title, columns(board_id)')
      .eq('id', card_id)
      .single()

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const boardId = (card.columns as any).board_id

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

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        card_id,
        user_id: user.id,
        content: content.trim(),
      })
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      board_id: boardId,
      user_id: user.id,
      action: 'commented',
      entity_type: 'comment',
      entity_id: comment.id,
      metadata: { title: card.title },
    })

    return NextResponse.json(comment)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// DELETE: Delete a comment
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get comment
  const { data: comment } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  // Only allow the author to delete their comment
  if (comment.user_id !== user.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const { error } = await supabase.from('comments').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Comment deleted successfully' })
}

