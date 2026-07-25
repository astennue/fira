'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useQuery } from '@tanstack/react-query'
import {
  Menu, Search, Bell, Moon, Sun, LogOut, User, LayoutDashboard,
  Briefcase, Users, FileText, Sparkles, Send, Columns, Building,
  Building2, UserCheck, ChevronDown, UserCog, Globe, Languages,
  HelpCircle, MessageSquareQuote, Share2, Network, ScrollText,
  LayoutList, Settings, X, Home, Info, MessageCircle, Phone,
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
import { useAppStore, getNavItems, type ViewName, roleDisplayNames } from '@/store/app-store'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Search, FileText, User, Briefcase, Users, Sparkles,
  Send, Columns, Building, Building2, UserCheck, UserCog, Settings,
  HelpCircle, MessageSquareQuote, Share2, Network, ScrollText, LayoutList,
}

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
    fontSize, setFontSize,
    currentView,
  } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

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
  const navItems = user ? getNavItems(user.role) : []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('job-listing', { search: searchQuery })
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'F'

  const getRoleBadge = () => {
    if (!user) return null
    const roleInfo = roleDisplayNames[user.role]
    return roleInfo[language]
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setScrolled(window.scrollY > 20)
    })
  }

  const isPublicView = publicNavItems.some((item) => item.view === currentView)

  return (
    <>
      <header className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled || !isPublicView
          ? 'glass-nav shadow-sm'
          : 'bg-transparent border-transparent'
      )}>
        <div className="flex h-14 items-center gap-3 px-4 md:px-6">
          {/* Mobile hamburger */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden shrink-0">
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
              {user && (
                <div className="px-4 py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-gray-500">{getRoleBadge()}</p>
                    </div>
                  </div>
                </div>
              )}
              <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
                <nav className="flex flex-col gap-1 p-3">
                  {!user && publicNavItems.map((item) => {
                    const Icon = publicIconMap[item.icon] || Home
                    const isActive = currentView === item.view
                    return (
                      <button
                        key={item.view}
                        onClick={() => navigate(item.view)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full text-left',
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-100 hover:text-gray-900',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{language === 'fil' ? item.labelFil : item.label}</span>
                      </button>
                    )
                  })}
                  {user && navItems.map((item) => {
                    const Icon = iconMap[item.icon] || LayoutDashboard
                    const isActive = currentView === item.view
                    return (
                      <button
                        key={item.view}
                        onClick={() => navigate(item.view)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full text-left',
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-100 hover:text-gray-900',
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

          {/* Logo */}
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2 shrink-0"
          >
            <img src="/logo.png" alt="FIRA Logo" className="h-8 sm:h-9 object-contain" />
          </button>

          {/* Desktop Nav Links (public) */}
          {isPublicView && (
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
                          ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50'
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
            <div className={cn(
              'relative w-full',
              scrolled || !isPublicView
                ? ''
                : 'bg-white/15 backdrop-blur-sm'
            )}>
              <Search className={cn(
                'absolute left-2.5 top-2.5 h-4 w-4',
                scrolled || !isPublicView ? 'text-gray-400' : 'text-white/60'
              )} />
              <Input
                type="search"
                placeholder={language === 'fil' ? 'Maghanap ng trabaho...' : 'Search jobs...'}
                className={cn(
                  'pl-9 h-9',
                  scrolled || !isPublicView
                    ? ''
                    : 'bg-transparent border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30'
                )}
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
              className={cn(
                'hidden sm:flex gap-1 text-xs',
                scrolled || !isPublicView ? '' : 'text-white/80 hover:text-white hover:bg-white/10'
              )}
              onClick={() => setLanguage(language === 'en' ? 'fil' : 'en')}
            >
              <Globe className="h-3.5 w-3.5" />
              {language === 'en' ? 'EN' : 'FIL'}
            </Button>

            {/* Notifications */}
            {user && (
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            )}

            {/* Font size selector */}
            <select
              value={fontSize}
              onChange={(e) => useAppStore.getState().setFontSize(e.target.value as 'small' | 'medium' | 'large')}
              className={cn(
                'text-xs rounded-md border px-1.5 py-1 bg-transparent cursor-pointer',
                scrolled || !isPublicView
                  ? 'border-border text-foreground'
                  : 'border-white/30 text-white bg-white/10'
              )}
              title="Font Size"
            >
              <option value="small">A</option>
              <option value="medium">A+</option>
              <option value="large">A++</option>
            </select>

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              <Sun className={cn(
                'h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0',
                scrolled || !isPublicView ? '' : 'text-white'
              )} />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-1">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{getRoleBadge()}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`${user.role === 'super_admin' ? 'fira' : user.role}-dashboard` as ViewName)}>
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
                    scrolled || !isPublicView ? '' : 'text-white hover:text-white hover:bg-white/10'
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
