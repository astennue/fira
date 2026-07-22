'use client';

import { useAppStore } from '@/store/app-store';
import { useI18n } from '@/lib/i18n';
import { LanguageToggle } from './language-toggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle,
} from '@/components/ui/sheet';
import {
  LayoutDashboard, Briefcase, Users, GitBranch, FileText,
  Building2, Globe, Star, Menu, LogOut, Bell, ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { ViewName, UserRole } from '@/lib/types';

interface NavItem {
  view: ViewName;
  label: string;
  icon: React.ReactNode;
}

function getNavItems(role: UserRole, t: (k: string) => string): NavItem[] {
  switch (role) {
    case 'applicant':
      return [
        { view: 'applicant-dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard className="h-4 w-4" /> },
        { view: 'applicant-jobs', label: t('nav.browseJobs'), icon: <Briefcase className="h-4 w-4" /> },
        { view: 'applicant-applications', label: t('nav.applications'), icon: <FileText className="h-4 w-4" /> },
        { view: 'applicant-profile', label: t('nav.myProfile'), icon: <Users className="h-4 w-4" /> },
      ];
    case 'agency_admin':
    case 'agency_member':
      return [
        { view: 'agency-dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard className="h-4 w-4" /> },
        { view: 'agency-applicants', label: t('nav.applicants'), icon: <Users className="h-4 w-4" /> },
        { view: 'agency-pipeline', label: t('nav.pipeline'), icon: <GitBranch className="h-4 w-4" /> },
        { view: 'agency-endorsements', label: t('nav.endorsements'), icon: <FileText className="h-4 w-4" /> },
        { view: 'agency-members', label: t('nav.members'), icon: <Users className="h-4 w-4" /> },
      ];
    case 'fira':
      return [
        { view: 'fira-dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard className="h-4 w-4" /> },
        { view: 'fira-agencies', label: t('nav.agencies'), icon: <Building2 className="h-4 w-4" /> },
        { view: 'fira-employers', label: t('nav.employers'), icon: <Globe className="h-4 w-4" /> },
        { view: 'fira-job-orders', label: t('nav.jobOrders'), icon: <Briefcase className="h-4 w-4" /> },
        { view: 'fira-matching', label: t('nav.matching'), icon: <Star className="h-4 w-4" /> },
        { view: 'fira-endorsements', label: t('nav.endorsements'), icon: <FileText className="h-4 w-4" /> },
      ];
    case 'employer':
      return [
        { view: 'employer-dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard className="h-4 w-4" /> },
        { view: 'employer-endorsements', label: t('nav.endorsements'), icon: <FileText className="h-4 w-4" /> },
        { view: 'employer-profile', label: t('nav.myProfile'), icon: <Users className="h-4 w-4" /> },
      ];
    default:
      return [];
  }
}

function getRoleBadge(role: UserRole) {
  const labels: Record<UserRole, string> = {
    applicant: 'OFW', agency_admin: 'Agency', agency_member: 'Staff',
    fira: 'Admin', employer: 'Employer',
  };
  return labels[role] || role;
}

export function AppNav() {
  const { user, currentView, navigate, logout, sidebarOpen, setSidebarOpen } = useAppStore();
  const { t } = useI18n();

  if (!user) return null;

  const navItems = getNavItems(user.role, t);

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={mobile ? 'flex flex-col gap-1' : 'flex items-center gap-1'}>
      {navItems.map((item) => (
        <Button
          key={item.view}
          variant={currentView === item.view ? 'secondary' : 'ghost'}
          size={mobile ? 'default' : 'sm'}
          className={`gap-2 justify-start ${mobile ? 'w-full' : ''} ${currentView === item.view ? 'bg-emerald-100 text-emerald-800' : ''}`}
          onClick={() => navigate(item.view)}
        >
          {item.icon}
          {item.label}
        </Button>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-14 items-center px-4">
        {/* Mobile menu */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-4">
            <SheetTitle className="text-lg font-bold text-emerald-700 mb-4">{t('common.appName')}</SheetTitle>
            <NavLinks mobile />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex items-center gap-2 mr-4 cursor-pointer" onClick={() => navigate(user.role === 'applicant' ? 'applicant-dashboard' : user.role === 'fira' ? 'fira-dashboard' : user.role === 'employer' ? 'employer-dashboard' : 'agency-dashboard')}>
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-bold text-lg text-emerald-700 hidden sm:block">{t('common.appName')}</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex flex-1">
          <NavLinks />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          <LanguageToggle />
          <Button variant="ghost" size="icon" className="relative" onClick={() => toast.info('No new notifications')}>
            <Bell className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm max-w-[120px] truncate">{user.name}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 hidden lg:block">
                  {getRoleBadge(user.role)}
                </Badge>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-sm text-muted-foreground">{user.email}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(user.role === 'applicant' ? 'applicant-profile' : 'employer-profile')}>
                {t('nav.myProfile')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); toast.success('Signed out'); }} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                {t('auth.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}