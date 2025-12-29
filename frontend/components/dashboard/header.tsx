"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut } from "lucide-react"
import Image from "next/image"

interface DashboardHeaderProps {
  lastRefresh: Date
}

export function DashboardHeader({ lastRefresh }: DashboardHeaderProps) {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="py-3 sm:py-4 lg:py-6 px-3 sm:px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Logo and Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex-shrink-0">
              <Image
                src="/logo-WCI.png"
                alt="WCI Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg lg:text-2xl font-bold text-foreground truncate">Weather Comfort Index</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden md:block">Real-time comfort ranking across cities</p>
            </div>
          </div>

          {/* Right: User Info, Theme Toggle and Logout */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-shrink-0">
            <div className="text-right hidden md:block">
              <p className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[150px] lg:max-w-none">{user?.email || user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground hidden lg:block">Updated {formatTime(lastRefresh)}</p>
            </div>
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground px-2 sm:px-3"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
