import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: { boardId: string }
}

// GET: Get all members of a board
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { boardId } = params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: members, error } = await supabase
    .from('board_members')
    .select(`
      *,
      profile:profiles(id, full_name, email, avatar_url)
    `)
    .eq('board_id', boardId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(members)
}

// POST: Add a new member to the board
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { boardId } = params

  try {
    const body = await request.json()
    const { email, role = 'member' } = body

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user has permission
    const { data: currentMembership } = await supabase
      .from('board_members')
      .select('role')
      .eq('board_id', boardId)
      .eq('user_id', user.id)
      .single()

    if (!currentMembership || !['owner', 'admin'].includes(currentMembership.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Find user by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found. They need to create an account first.' },
        { status: 404 }
      )
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('board_members')
      .select('id')
      .eq('board_id', boardId)
      .eq('user_id', profile.id)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this board' },
        { status: 400 }
      )
    }

    // Add member
    const { data: member, error } = await supabase
      .from('board_members')
      .insert({
        board_id: boardId,
        user_id: profile.id,
        role,
      })
      .select(`
        *,
        profile:profiles(id, full_name, email, avatar_url)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      board_id: boardId,
      user_id: user.id,
      action: 'assigned',
      entity_type: 'member',
      entity_id: profile.id,
      metadata: {
        member_name: profile.full_name || profile.email,
        role,
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

