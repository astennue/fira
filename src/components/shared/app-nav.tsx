'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useQuery } from '@tanstack/react-query'
import {
  Menu, Search, Bell, Moon, Sun, LogOut, User, LayoutDashboard,
  Briefcase, Building2, ChevronDown, Globe,
  HelpCircle, Home, Info, MessageCircle, Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore, getDashboardView, type ViewName, roleDisplayNames } from '@/store/app-store'
import { cn } from '@/lib/utils'

const publicNavItems = [
  { label: 'Home', labelFil: 'Home', icon: 'Home', view: 'landing' as ViewName },
  { label: 'About', labelFil: 'Tungkol', icon: 'Info', view: 'about' as ViewName },
  { label: 'Services', labelFil: 'Serbisyo', icon: 'Briefcase', view: 'services' as ViewName },
  { label: 'Jobs', labelFil: 'Trabaho', icon: 'Briefcase', view: 'job-listing' as ViewName },
  { label: 'For Employers', labelFil: 'Para sa Empleyador', icon: 'Building2', view: 'employer-partnership' as ViewName },
  { label: 'FAQ', labelFil: 'FAQ', icon: 'HelpCircle', view: 'faq' as ViewName },
  { label: 'Contact', labelFil: 'Makipag-ugnay', icon: 'Phone', view: 'contact' as ViewName },
]

const publicIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Info, Briefcase, HelpCircle, Phone, MessageCircle, Building2,
}

export function AppNav() {
  const {
    user, logout, navigate,
    setAuthModalOpen,
    sidebarOpen, setSidebarOpen,
    searchQuery, setSearchQuery,
    language, setLanguage,
    currentView,
  } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  // Proper scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const res = await fetch(`/api/notifications?userId=${user.id}`)
      if (!res.ok) return []
      const data = await res.json()
      return (data.notifications || data || []) as Array<{ id: string; title: string; read: boolean }>
    },
    enabled: !!user?.id,
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('job-listing', { search: searchQuery })
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'F'

  const getRoleBadge = () => {
    if (!user) return null
    return roleDisplayNames[user.role]?.[language] ?? user.role?.replace(/_/g, ' ') ?? ''
  }

  const isPublicView = publicNavItems.some((item) => item.view === currentView)
  const isDashboardView = user && !isPublicView

  const handleLogoClick = () => {
    if (user) {
      navigate(getDashboardView(user.role))
    } else {
      navigate('landing')
    }
  }

  return (
    <>
      <header className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isDashboardView || scrolled
          ? 'glass-nav shadow-sm'
          : 'bg-transparent border-transparent'
      )}>
        <div className="flex h-14 items-center gap-3 px-4 md:px-6">
          {/* Mobile hamburger */}
          {user ? (
            // Logged in: hamburger toggles dashboard sidebar
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0 text-foreground"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          ) : (
            // Not logged in: hamburger opens Sheet with public nav
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden shrink-0 text-foreground"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="border-b px-4 py-3">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 text-white font-bold text-sm">
                      F
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">FIRA</span>
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
                  <nav className="flex flex-col gap-1 p-3">
                    {publicNavItems.map((item) => {
                      const Icon = publicIconMap[item.icon] || Home
                      const isActive = currentView === item.view
                      return (
                        <button
                          key={item.view}
                          onClick={() => { navigate(item.view); setSidebarOpen(false) }}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full text-left',
                            isActive
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                              : 'hover:bg-accent hover:text-accent-foreground',
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{language === 'fil' ? item.labelFil : item.label}</span>
                        </button>
                      )
                    })}
                  </nav>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          )}

          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 shrink-0"
          >
            <img src="/logo.png" alt="FIRA Logo" className="h-8 sm:h-9 object-contain" />
          </button>

          {/* Desktop Nav Links (public only, when not logged in) */}
          {!user && isPublicView && (
            <nav className="hidden lg:flex items-center gap-1 ml-6">
              {publicNavItems.map((item) => {
                const Icon = publicIconMap[item.icon] || Home
                const isActive = currentView === item.view
                return (
                  <button
                    key={item.view}
                    onClick={() => navigate(item.view)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? scrolled
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'bg-white/20 text-white'
                        : scrolled
                          ? 'text-foreground hover:text-foreground hover:bg-accent'
                          : 'text-white/70 hover:text-white hover:bg-white/10',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{language === 'fil' ? item.labelFil : item.label}</span>
                  </button>
                )
              })}
            </nav>
          )}

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex ml-auto">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={language === 'fil' ? 'Maghanap ng trabaho...' : 'Search jobs...'}
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
            {/* Language toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex gap-1 text-xs text-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setLanguage(language === 'en' ? 'fil' : 'en')}
            >
              <Globe className="h-3.5 w-3.5" />
              {language === 'en' ? 'EN' : 'FIL'}
            </Button>

            {/* Notifications */}
            {user && (
              <Button variant="ghost" size="icon" className="relative text-foreground hover:text-foreground hover:bg-accent">
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
              className="text-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-1 text-foreground hover:text-foreground hover:bg-accent">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
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
                    <p className="text-xs text-muted-foreground">{getRoleBadge()}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(getDashboardView(user.role))}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('user-settings')}>
                    <User className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {language === 'fil' ? 'Mag-logout' : 'Sign Out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'text-foreground hover:text-foreground hover:bg-accent',
                  )}
                  onClick={() => setAuthModalOpen(true)}
                >
                  {language === 'fil' ? 'Mag-sign In' : 'Sign In'}
                </Button>
                <Button
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setAuthModalOpen(true)}
                >
                  {language === 'fil' ? 'Magparehistro' : 'Register'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
