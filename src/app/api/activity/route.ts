import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Fetch activity logs for a board
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const boardId = searchParams.get('boardId')
  const limit = parseInt(searchParams.get('limit') || '50')

  if (!boardId) {
    return NextResponse.json({ error: 'Board ID is required' }, { status: 400 })
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
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Fetch activity logs
  const { data: activities, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      user:profiles(id, full_name, email, avatar_url)
    `)
    .eq('board_id', boardId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(activities)
}

// POST: Create a new activity log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { board_id, action, entity_type, entity_id, metadata } = body

    if (!board_id || !action || !entity_type || !entity_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        board_id,
        user_id: user.id,
        action,
        entity_type,
        entity_id,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

