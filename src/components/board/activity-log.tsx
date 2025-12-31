'use client'

import { useState, useEffect } from 'react'
import { Activity, MessageSquare, Plus, Trash2, Edit, ArrowRight, UserPlus, UserMinus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import type { ActivityLog, Profile } from '@/types'

interface ActivityLogProps {
  boardId: string
}

interface ActivityWithUser extends ActivityLog {
  user: Profile | null
}

const actionIcons: Record<string, React.ReactNode> = {
  created: <Plus className="h-3 w-3 text-green-500" />,
  updated: <Edit className="h-3 w-3 text-blue-500" />,
  deleted: <Trash2 className="h-3 w-3 text-red-500" />,
  moved: <ArrowRight className="h-3 w-3 text-purple-500" />,
  assigned: <UserPlus className="h-3 w-3 text-teal-500" />,
  unassigned: <UserMinus className="h-3 w-3 text-orange-500" />,
  commented: <MessageSquare className="h-3 w-3 text-indigo-500" />,
}

const entityLabels: Record<string, string> = {
  board: 'board',
  column: 'column',
  card: 'card',
  comment: 'comment',
  member: 'member',
}

function getActivityMessage(activity: ActivityWithUser): string {
  const action = activity.action
  const entityType = entityLabels[activity.entity_type] || activity.entity_type
  const entityName = activity.metadata?.title || activity.metadata?.name || entityType

  switch (action) {
    case 'created':
      return `created ${entityType} "${entityName}"`
    case 'updated':
      return `updated ${entityType} "${entityName}"`
    case 'deleted':
      return `deleted ${entityType} "${entityName}"`
    case 'moved':
      const from = activity.metadata?.from_column || 'a column'
      const to = activity.metadata?.to_column || 'another column'
      return `moved "${entityName}" from ${from} to ${to}`
    case 'assigned':
      const assignee = activity.metadata?.assignee_name || 'someone'
      return `assigned "${entityName}" to ${assignee}`
    case 'unassigned':
      return `unassigned "${entityName}"`
    case 'commented':
      return `commented on "${entityName}"`
    default:
      return `${action} ${entityType}`
  }
}

export function ActivityLogPanel({ boardId }: ActivityLogProps) {
  const [activities, setActivities] = useState<ActivityWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActivities()
  }, [boardId])

  const fetchActivities = async () => {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
      .eq('board_id', boardId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      setError('Failed to load activity log')
      console.error('Error fetching activities:', error)
    } else {
      setActivities(data as ActivityWithUser[])
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/4 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
        <button
          onClick={fetchActivities}
          className="mt-2 text-sm text-primary-600 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p>No activity yet</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4" />
        Activity Log
      </h3>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className="relative">
              <Avatar
                src={activity.user?.avatar_url}
                name={activity.user?.full_name || activity.user?.email || 'Unknown'}
                size="sm"
              />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                {actionIcons[activity.action] || <Activity className="h-3 w-3 text-gray-400" />}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">
                  {activity.user?.full_name || 'Unknown'}
                </span>{' '}
                {getActivityMessage(activity)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatRelativeTime(activity.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

