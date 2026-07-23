'use client'

import { useTheme } from 'next-themes'
import { useQuery } from '@tanstack/react-query'
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Sparkles,
  Send,
  Columns,
  Building,
  Building2,
  UserCheck,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAppStore, getNavItems, type ViewName } from '@/store/app-store'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Search,
  FileText,
  User,
  Briefcase,
  Users,
  Sparkles,
  Send,
  Columns,
  Building,
  Building2,
  UserCheck,
}

export function AppNav() {
  const {
    user,
    setUser,
    logout,
    navigate,
    authModalOpen,
    setAuthModalOpen,
    sidebarOpen,
    setSidebarOpen,
    searchQuery,
    setSearchQuery,
  } = useAppStore()
  const { theme, setTheme } = useTheme()

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const res = await fetch(`/api/notifications?userId=${user.id}`)
      if (!res.ok) return []
      const data = await res.json()
      return data as Array<{ id: string; title: string; read: boolean }>
    },
    enabled: !!user?.id,
  })

  const unreadCount = notifications.filter((n) => !n.read).length
  const navItems = user ? getNavItems(user.role) : []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('job-listing', { search: searchQuery })
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-4 md:px-6">
          {/* Mobile hamburger */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                    F
                  </div>
                  <span className="text-lg font-bold">
                    <span className="text-primary">FIRA</span>
                  </span>
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="flex-1 h-[calc(100vh-4rem)]">
                <nav className="flex flex-col gap-1 p-3">
                  {user && navItems.map((item) => {
                    const Icon = iconMap[item.icon] || LayoutDashboard
                    return (
                      <button
                        key={item.view}
                        onClick={() => navigate(item.view)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full text-left',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    )
                  })}
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2 mr-4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              F
            </div>
            <span className="hidden sm:inline text-lg font-bold">
              <span className="text-primary">FIRA</span>
            </span>
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate(user.role === 'fira' ? 'fira-dashboard' : `${user.role}-dashboard` as ViewName)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            )}

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              /* User menu */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-1">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`${user.role}-dashboard` as ViewName)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (user.role === 'applicant') navigate('applicant-profile')
                  }}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Auth buttons */
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAuthModalOpen(true)
                  }}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setAuthModalOpen(true)
                  }}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}