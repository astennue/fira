---
Task ID: 3
Agent: full-stack-developer
Task: Redesign the FIRA (Super Admin) Dashboard for the FIRA recruitment platform

Work Log:
- Read worklog.md and existing fira-dashboard.tsx to understand project context
- Read app-store.ts to understand Zustand store structure (ViewName, UserRole, language, navigate, etc.)
- Verified available shadcn/ui components and dependencies (framer-motion, @tanstack/react-query, lucide-react)
- Completely rewrote `/src/components/dashboard/fira-dashboard.tsx` (~700 lines)

Design Implementation:
1. **Professional command center** aesthetic with Shield icon header, gradient accent badges
2. **Glassmorphism cards** via `GlassCard` wrapper using `bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/40`
3. **Bilingual** support using `isFil = language === 'fil'` pattern with useAppStore()
4. **Animated counters** using framer-motion `useSpring` + `useTransform` with bounce:0 for smooth counting
5. **Color scheme**: Blue primary (header, stats), violet (super-admin quick actions), amber (alerts, pending items), green (active/approved items)
6. **Dark mode**: CSS variables only - `text-foreground`, `text-muted-foreground`, `bg-accent`, `border-border`
7. **Responsive**: 6-column grid on lg, 2-column on sm, 1-column on mobile; 3-column main content on lg, stacked on mobile

Dashboard Sections:
- **Header**: Shield icon with blue-violet gradient, "FIRA Command Center" title, bilingual subtitle, Messages button with unread badge
- **Alert Banner**: Conditional amber/orange gradient banner showing pending agency approvals + pending endorsements with Review button
- **Stats Grid**: 6 glass cards (Total Agencies, Employers, Applicants, Active Jobs, Pending Endorsements, Total Endorsements) - each with gradient icon, animated counter, "Active" trend text
- **Column 1 (Recent Activity)**: Endorsement feed with pending items highlighted amber, approved items green, status badges, dates, max height scroll
- **Column 2 (Recent Registrations)**: Applicant list with gradient avatar circles, email, active/pending badge, click navigates to fira-applicant-detail
- **Column 3**: Quick Actions card (7 buttons with icon + badge) + Mini Jobs List card with country flags, status badges, max height scroll

Lint Fixes:
- Fixed unquoted object keys with spaces (`Saudi Arabia`, `United Kingdom`, etc.) → quoted strings
- Fixed nested ternary inside template literal causing parser error → extracted to conditional blocks
- All lint errors in src/ resolved (only pre-existing prisma/*.js errors remain)

Stage Summary:
- Complete FIRA Dashboard redesign with glassmorphism, animated counters, and professional command center UI
- Clean lint (no src/ errors)
- Bilingual English/Filipino support throughout
- Responsive grid layouts for mobile, tablet, desktop
