'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserPlus, Trash2, Shield, Crown, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import type { BoardMember, Profile } from '@/types'

interface ShareBoardModalProps {
  isOpen: boolean
  onClose: () => void
  boardId: string
  members: (BoardMember & { profile: Profile })[]
  currentUserId: string
  isOwner: boolean
}

const roleIcons: Record<string, React.ReactNode> = {
  owner: <Crown className="h-4 w-4 text-yellow-500" />,
  admin: <Shield className="h-4 w-4 text-blue-500" />,
  member: <User className="h-4 w-4 text-gray-400" />,
}

export function ShareBoardModal({
  isOpen,
  onClose,
  boardId,
  members,
  currentUserId,
  isOwner,
}: ShareBoardModalProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (profileError || !profile) {
      setError('User not found. They need to create an account first.')
      setLoading(false)
      return
    }

    // Check if already a member
    const existingMember = members.find((m) => m.user_id === profile.id)
    if (existingMember) {
      setError('This user is already a member of this board.')
      setLoading(false)
      return
    }

    // Add member
    const { error: insertError } = await supabase
      .from('board_members')
      .insert({
        board_id: boardId,
        user_id: profile.id,
        role,
      })

    if (insertError) {
      setError('Failed to add member. Please try again.')
      setLoading(false)
      return
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      board_id: boardId,
      user_id: currentUserId,
      action: 'assigned',
      entity_type: 'member',
      entity_id: profile.id,
      metadata: {
        member_name: profile.full_name || profile.email,
        role,
      },
    })

    setSuccess(`${profile.full_name || profile.email} has been added to the board!`)
    setEmail('')
    setLoading(false)
    router.refresh()
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this board?`)) return

    const supabase = createClient()
    await supabase.from('board_members').delete().eq('id', memberId)

    // Log activity
    await supabase.from('activity_logs').insert({
      board_id: boardId,
      user_id: currentUserId,
      action: 'unassigned',
      entity_type: 'member',
      entity_id: memberId,
      metadata: { member_name: memberName },
    })

    router.refresh()
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    const supabase = createClient()
    await supabase
      .from('board_members')
      .update({ role: newRole })
      .eq('id', memberId)

    router.refresh()
  }

  const currentUserMember = members.find((m) => m.user_id === currentUserId)
  const canManageMembers = isOwner || currentUserMember?.role === 'admin'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Board" className="max-w-md">
      <div className="space-y-6">
        {/* Invite form */}
        {canManageMembers && (
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                className="h-9 rounded-md border border-gray-200 px-2 text-sm"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" disabled={loading || !email.trim()} className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? 'Adding...' : 'Invite Member'}
            </Button>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{success}</p>
            )}
          </form>
        )}

        {/* Members list */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members ({members.length})
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={member.profile?.avatar_url}
                    name={member.profile?.full_name || member.profile?.email || 'Member'}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {member.profile?.full_name || 'Unknown'}
                      {member.user_id === currentUserId && (
                        <span className="text-xs text-gray-400 ml-1">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{member.profile?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canManageMembers && member.role !== 'owner' ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {roleIcons[member.role]}
                      <span className="capitalize">{member.role}</span>
                    </div>
                  )}

                  {canManageMembers &&
                    member.role !== 'owner' &&
                    member.user_id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-500"
                        onClick={() =>
                          handleRemoveMember(
                            member.id,
                            member.profile?.full_name || member.profile?.email || 'member'
                          )
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

