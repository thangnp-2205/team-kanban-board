'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'

interface NavbarProps {
  user: User
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/boards" className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary-600" />
            <span className="font-bold text-xl text-gray-900">Kanban</span>
          </Link>

          {/* User menu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar
                name={user.user_metadata?.full_name || user.email || 'User'}
                src={user.user_metadata?.avatar_url}
                size="sm"
              />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user.user_metadata?.full_name || user.email}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

