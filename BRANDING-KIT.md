# FIRA Branding Kit — Design System Reference

> **Document Purpose:** This is the single source of truth for all visual design decisions on the FIRA website. It is used to audit and adjust the codebase design for consistency.
>
> **Last Updated:** July 2025

---

## Table of Contents

1. [Color Palette](#1-color-palette)
2. [Color Scheme (Light / Dark)](#2-color-scheme-light--dark)
3. [Color Ranges](#3-color-ranges)
4. [Status Indicators](#4-status-indicators)
5. [Typography](#5-typography)
6. [Links](#6-links)
7. [Buttons](#7-buttons)
8. [Input Fields](#8-input-fields)
9. [Cards](#9-cards)
10. [Badges & Tags](#10-badges--tags)
11. [Borders & Dividers](#11-borders--dividers)
12. [Border Radius Rules](#12-border-radius-rules)
13. [Shadows](#13-shadows)
14. [Glassmorphism](#14-glassmorphism)
15. [Tables](#15-tables)
16. [Toasts & Notifications](#16-toasts--notifications)
17. [Dialogs / Modals](#17-dialogs--modals)
18. [Loading States](#18-loading-states)
19. [Empty States](#19-empty-states)
20. [Error States](#20-error-states)
21. [Success States](#21-success-states)
22. [Selection States](#22-selection-states)
23. [Hover Effects](#23-hover-effects)
24. [Focus States](#24-focus-states)
25. [Disabled States](#25-disabled-states)
26. [Icons](#26-icons)
27. [Animations & Transitions](#27-animations--transitions)
28. [Scrollbar](#28-scrollbar)
29. [Accessibility](#29-accessibility)
30. [Spacing System](#30-spacing-system)
31. [Responsive Breakpoints](#31-responsive-breakpoints)

---

## 1. Color Palette

### 1.1 Primary — Blue

The core brand color. Blue conveys trust, professionalism, and stability — essential for a recruitment agency.

| Token | Hex | Usage |
|-------|-----|-------|
| `blue-50` | `#eff6ff` | Lightest tint; subtle backgrounds |
| `blue-100` | `#dbeafe` | Light tint; hover fills, secondary bg |
| `blue-200` | `#bfdbfe` | Light border accents |
| `blue-300` | `#93c5fd` | Light text on dark; subtle emphasis |
| `blue-400` | `#60a5fa` | Medium accent; dark mode primary |
| `blue-500` | `#3b82f6` | Standard blue; interactive elements |
| `blue-600` | `#2563eb` | **Brand Primary** (light mode); ring/focus color |
| `blue-700` | `#1d4ed8` | Darker primary; strong emphasis |
| `blue-800` | `#1e40af` | **Light mode `--primary`**; main CTA buttons |
| `blue-900` | `#1e3a8a` | Deep navy; secondary-foreground |
| `blue-950` | `#172554` | Darkest; footer backgrounds, deep accents |

**Usage Rules:**
- Primary buttons, active nav items, and key CTAs use `--primary` (light: `#1e40af`, dark: `#60a5fa`).
- Blue-600 `#2563eb` is the ring/focus color for both modes.
- Never use blue as a decorative color for non-interactive elements unless intentionally.

### 1.2 Accent 1 — Warm Gold / Amber

Subtle warmth for secondary highlights. Must **NOT** be loud or oversaturated.

| Token | Hex | Usage |
|-------|-----|-------|
| `amber-50` | `#fffbeb` | Lightest background tint |
| `amber-100` | `#fef3c7` | Light background fill |
| `amber-200` | `#fde68a` | Light border |
| `amber-300` | `#fcd34d` | Subtle accent |
| `amber-400` | `#fbbf24` | Medium accent; gold highlights |
| `amber-500` | `#f59e0b` | Standard amber |
| `amber-600` | `#d97706` | **Primary gold accent**; warm emphasis |
| `amber-700` | `#b45309` | **Anchor gold**; icons, small details |
| `amber-800` | `#92400e` | Dark gold text |
| `amber-900` | `#78350f` | Deepest gold; text on gold bg |

**Usage Rules:**
- Used sparingly for: star ratings, achievement badges, premium/featured labels, warning-related emphasis.
- Never as a primary CTA color.
- Amber-600/700 for icon fills; amber-50/100 for backgrounds behind gold elements.

### 1.3 Accent 2 — Slate / Cool Gray

Neutral cool gray for secondary text, de-emphasized elements, and structural hierarchy.

| Token | Hex | Usage |
|-------|-----|-------|
| `slate-50` | `#f8fafc` | **Light mode `--background`** |
| `slate-100` | `#f1f5f9` | Light muted bg; sidebar bg |
| `slate-200` | `#e2e8f0` | Light borders; secondary text |
| `slate-300` | `#cbd5e1` | **Light mode `--border` / `--input`** |
| `slate-400` | `#94a3b8` | Placeholder text; disabled text |
| `slate-500` | `#64748b` | **Light mode `--muted-foreground`**; secondary text |
| `slate-600` | `#475569` | Body text (secondary) |
| `slate-700` | `#334155` | Strong secondary text |
| `slate-800` | `#1e293b` | Dark text; sidebar accents (dark mode) |
| `slate-900` | `#0f172a` | **Light mode `--foreground`**; primary text |
| `slate-950` | `#020617` | Deepest; near-black text |

**Usage Rules:**
- Primary text: slate-900 (light) / slate-200 (dark).
- Secondary/muted text: slate-500 (light) / slate-400 range (dark).
- Borders and input outlines: slate-300 (light) / custom dark border.

### 1.4 Semantic Colors

| Role | Light Hex | Dark Hex | Tailwind |
|------|-----------|----------|----------|
| Destructive / Error | `#ef4444` | `#f87171` | `red-500` / `red-400` |
| Success / Approved | `#22c55e` | `#4ade80` | `green-500` / `green-400` |
| Warning / Pending | `#f59e0b` | `#fbbf24` | `amber-500` / `amber-400` |
| Info | `#3b82f6` | `#60a5fa` | `blue-500` / `blue-400` |

---

## 2. Color Scheme (Light / Dark)

### 2.1 Light Mode

| CSS Variable | Value | Purpose |
|-------------|-------|---------|
| `--background` | `#f8fafc` | Page background |
| `--foreground` | `#0f172a` | Primary text |
| `--card` | `#ffffff` | Card background |
| `--card-foreground` | `#0f172a` | Card text |
| `--popover` | `#ffffff` | Popover/dropdown bg |
| `--popover-foreground` | `#0f172a` | Popover text |
| `--primary` | `#1e40af` | Primary buttons, active elements |
| `--primary-foreground` | `#ffffff` | Text on primary |
| `--secondary` | `#eff6ff` | Secondary button bg |
| `--secondary-foreground` | `#1e3a8a` | Secondary button text |
| `--muted` | `#f1f5f9` | Muted backgrounds |
| `--muted-foreground` | `#64748b` | Muted text |
| `--accent` | `#dbeafe` | Accent hover backgrounds |
| `--accent-foreground` | `#1e3a8a` | Text on accent bg |
| `--destructive` | `#ef4444` | Error/danger |
| `--border` | `#cbd5e1` | Borders |
| `--input` | `#cbd5e1` | Input borders |
| `--ring` | `#2563eb` | Focus ring color |

### 2.2 Dark Mode

| CSS Variable | Value | Purpose |
|-------------|-------|---------|
| `--background` | `#0b1120` | Page background (deep navy) |
| `--foreground` | `#e2e8f0` | Primary text |
| `--card` | `#141c2e` | Card background |
| `--card-foreground` | `#e2e8f0` | Card text |
| `--popover` | `#141c2e` | Popover/dropdown bg |
| `--popover-foreground` | `#e2e8f0` | Popover text |
| `--primary` | `#60a5fa` | Primary buttons, active elements |
| `--primary-foreground` | `#0b1120` | Text on primary |
| `--secondary` | `#1a2540` | Secondary button bg |
| `--secondary-foreground` | `#93c5fd` | Secondary button text |
| `--muted` | `#1a2540` | Muted backgrounds |
| `--muted-foreground` | `#8899b4` | Muted text |
| `--accent` | `#1e293b` | Accent hover backgrounds |
| `--accent-foreground` | `#93c5fd` | Text on accent bg |
| `--destructive` | `#f87171` | Error/danger |
| `--border` | `#1e2d4a` | Borders |
| `--input` | `#1e2d4a` | Input borders |
| `--ring` | `#3b82f6` | Focus ring color |

---

## 3. Color Ranges

### 3.1 Green Range (Success / Approved / Active)

| Shade | Light Usage | Dark Usage |
|-------|------------|------------|
| `green-50` | Background tint | — |
| `green-100` | Badge background | `green-950/50` badge bg |
| `green-700` | Badge text | `green-300` badge text |
| `green-500` | Icon fill, status dot | `green-400` icon fill |

### 3.2 Red Range (Error / Rejected / Failed)

| Shade | Light Usage | Dark Usage |
|-------|------------|------------|
| `red-50` | Background tint | — |
| `red-100` | Badge background | `red-950/50` badge bg |
| `red-700` | Badge text | `red-300` badge text |
| `red-500` | Destructive actions | `red-400` destructive actions |

### 3.3 Amber Range (Pending / Waiting / Warning)

| Shade | Light Usage | Dark Usage |
|-------|------------|------------|
| `amber-50` | Background tint | — |
| `amber-100` | Badge background | `amber-950/50` badge bg |
| `amber-700` | Badge text | `amber-300` badge text |
| `amber-500` | Warning icon | `amber-400` warning icon |

### 3.4 Blue Range (Info / Applied / Processing)

| Shade | Light Usage | Dark Usage |
|-------|------------|------------|
| `blue-50` | Background tint | — |
| `blue-100` | Badge background | `blue-950/50` badge bg |
| `blue-700` | Badge text | `blue-300` badge text |
| `blue-500` | Info icon | `blue-400` info icon |

### 3.5 Gray Range (Inactive / Closed / Completed)

| Shade | Light Usage | Dark Usage |
|-------|------------|------------|
| `gray-50` | Background tint | — |
| `gray-100` | Badge background | `gray-950/50` badge bg |
| `gray-200` | Subtle closed bg | `gray-950/50` badge bg |
| `gray-500` | Inactive text | `gray-400` inactive text |
| `gray-700` | Completed text | `gray-300` completed text |

---

## 4. Status Indicators

### 4.1 Standard Status Colors

| Status Meaning | Light BG | Light Text | Dark BG | Dark Text |
|---------------|----------|------------|---------|----------|
| **Success / Approved / Active / Complete / Open** | `bg-green-100` | `text-green-700` | `bg-green-950/50` | `text-green-300` |
| **Error / Rejected / Failed** | `bg-red-100` | `text-red-700` | `bg-red-950/50` | `text-red-300` |
| **Pending / Waiting / Warning / Incomplete** | `bg-amber-100` | `text-amber-700` | `bg-amber-950/50` | `text-amber-300` |
| **Info / Applied / Processing** | `bg-blue-100` | `text-blue-700` | `bg-blue-950/50` | `text-blue-300` |
| **Inactive / Closed / Cancelled / Completed** | `bg-gray-100` | `text-gray-500` | `bg-gray-950/50` | `text-gray-400` |

### 4.2 Application Pipeline Status Colors

| Status | Light | Dark | Notes |
|--------|-------|------|-------|
| `applied` | `bg-blue-100 text-blue-700` | `bg-blue-950/50 text-blue-300` | Info — application submitted |
| `screening` | `bg-amber-100 text-amber-700` | `bg-amber-950/50 text-amber-300` | Pending — under review |
| `interview_scheduled` | `bg-blue-100 text-blue-700` | `bg-blue-950/50 text-blue-300` | Info — upcoming event |
| `interview_passed` | `bg-green-100 text-green-700` | `bg-green-950/50 text-green-300` | Success — milestone passed |
| `pending_documents` | `bg-amber-100 text-amber-700` | `bg-amber-950/50 text-amber-300` | Warning — action needed |
| `documents_submitted` | `bg-blue-100 text-blue-700` | `bg-blue-950/50 text-blue-300` | Info — awaiting review |
| `pending_fira_review` | `bg-blue-100 text-blue-700` | `bg-blue-950/50 text-blue-300` | Info — FIRA processing |
| `fira_approved` | `bg-green-100 text-green-700` | `bg-green-950/50 text-green-300` | Success — approved by FIRA |
| `pending_employer_review` | `bg-blue-100 text-blue-700` | `bg-blue-950/50 text-blue-300` | Info — employer processing |
| `employer_accepted` | `bg-green-100 text-green-700` | `bg-green-950/50 text-green-300` | Success — accepted |
| `deployed` | `bg-green-100 text-green-700` | `bg-green-950/50 text-green-300` | Success — deployed |
| `completed` | `bg-gray-100 text-gray-500` | `bg-gray-950/50 text-gray-400` | Neutral — process ended |
| `rejected` | `bg-red-100 text-red-700` | `bg-red-950/50 text-red-300` | Error — rejected |
| `cancelled` | `bg-gray-100 text-gray-500` | `bg-gray-950/50 text-gray-400` | Neutral — user cancelled |

**Design Decision:** `interview_scheduled` and `documents_submitted` and `pending_fira_review` and `pending_employer_review` all use **blue (info)** since they represent intermediate processing stages where no user action is immediately required. This is a change from the current code which uses purple, orange, teal, indigo, and cyan — these should be **consolidated to blue** for consistency.

### 4.3 Profile Status

| Status | Colors | Notes |
|--------|--------|-------|
| `complete` | Green | Profile fully filled |
| `incomplete` | Amber | Missing fields |
| `active` | Green | Account active |
| `inactive` | Gray | Account deactivated |

### 4.4 Account/Agency/Employer Approval Status

| Status | Colors | Notes |
|--------|--------|-------|
| `pending` | Amber | Awaiting admin review |
| `approved` | Green | Approved and active |
| `rejected` | Red | Rejected |

### 4.5 Job Status

| Status | Colors | Notes |
|--------|--------|-------|
| `open` | Green | Accepting applicants |
| `closed` | Gray | No longer accepting |
| `draft` | Gray/Amber | Not yet published |
| `filled` | Blue | All positions filled |

### 4.6 Status Badge Specification

- **Variant:** `outline` (border-0 override applied)
- **Font size:** `text-xs`
- **Font weight:** `font-medium`
- **Border radius:** `rounded-md`
- **Padding:** `px-2 py-0.5` (from Badge component)
- **No border:** `border-0`

---

## 5. Typography

### 5.1 Font Families

| Role | Font | Fallback | Usage |
|------|------|----------|-------|
| **Sans** | Geist Sans | system sans-serif | All UI text, headings, body |
| **Mono** | Geist Mono | system monospace | Code snippets, technical data, numbers in tables |

### 5.2 Type Scale

| Level | Element | Size | Weight | Line Height | Letter Spacing | Tailwind Class |
|-------|---------|------|--------|-------------|----------------|---------------|
| **H1** | Page title, hero heading | `36px` | `700` (bold) | `1.2` | `-0.02em` | `text-4xl font-bold` → `leading-tight tracking-tight` |
| **H2** | Section title | `30px` | `600` (semibold) | `1.25` | `-0.01em` | `text-3xl font-semibold` → `leading-tight` |
| **H3** | Subsection title | `20px` | `600` (semibold) | `1.3` | `0` | `text-xl font-semibold` |
| **H4** | Card title, widget header | `18px` | `600` (semibold) | `1.35` | `0` | `text-lg font-semibold` |
| **H5** | Small header, label group | `16px` | `500` (medium) | `1.4` | `0` | `text-base font-medium` |
| **H6** | Minor header | `14px` | `500` (medium) | `1.4` | `0.01em` | `text-sm font-medium tracking-wide` |
| **Body** | Main content | `16px` | `400` (regular) | `1.6` | `0` | `text-base` |
| **Body SM** | Secondary content | `14px` | `400` (regular) | `1.5` | `0` | `text-sm` |
| **Caption** | Meta info, helper text | `12px` | `400` (regular) | `1.4` | `0.02em` | `text-xs tracking-wide` |
| **Overline** | Section label, eyebrow | `12px` | `500` (medium) | `1.4` | `0.05em` | `text-xs font-medium uppercase tracking-widest` |

### 5.3 Font Size Accessibility

- Font size is user-adjustable via the accessibility toolbar.
- **Range:** `12px` (min) to `28px` (max), step `2px`, default `16px`.
- Applied via inline style: `style={{ fontSize: '`${fontSize}px`' }}`.
- All sizing above uses the **default** base. The accessibility scaler adjusts all sizes proportionally.

### 5.4 Text Color Hierarchy

| Hierarchy | Light Mode | Dark Mode | Tailwind |
|-----------|-----------|-----------|----------|
| **Primary text** | `#0f172a` | `#e2e8f0` | `text-foreground` |
| **Secondary text** | `#64748b` | `#8899b4` | `text-muted-foreground` |
| **Tertiary text** | `#94a3b8` | `#64748b` | `text-slate-400` (light) / `text-slate-500` (dark) |
| **Disabled text** | `#cbd5e1` | `#475569` | `text-slate-300` (light) / `text-slate-600` (dark) |
| **Inverse text** | `#ffffff` | `#0b1120` | `text-primary-foreground` |

---

## 6. Links

### 6.1 Inline Text Links

| State | Style |
|-------|-------|
| **Default** | `text-blue-600 dark:text-blue-400` (no underline) |
| **Hover** | `text-blue-700 dark:text-blue-300` + `underline` + `underline-offset-4` |
| **Active** | `text-blue-800 dark:text-blue-200` + underline |
| **Visited** | Same as default (no distinct visited style) |
| **Focus (keyboard)** | `outline: 2px solid #2563eb; outline-offset: 2px` |

### 6.2 Navigation Links (Nav Bar)

| State | Style |
|-------|-------|
| **Default** | `text-slate-600 dark:text-slate-300` |
| **Hover** | `text-foreground dark:text-slate-100` + subtle `bg-accent` |
| **Active (current page)** | `text-primary dark:text-primary` + `font-medium` |
| **Focus** | `outline: 2px solid #2563eb; outline-offset: 2px` |

### 6.3 External Links

- Same as inline text links.
- Append `ArrowUpRight` icon (from Lucide) after text to indicate external destination.
- `rel="noopener noreferrer"` and `target="_blank"` attributes.

### 6.4 Links in Cards / Dense Lists

- Same as inline text links but `text-sm`.
- Use `hover:underline` on the entire card area, not just the text.

---

## 7. Buttons

### 7.1 Design Philosophy

- **Flat, simple, professional.**
- **NO gradients** on buttons.
- Subtle `shadow-xs` on default variant; ghost/link have no shadow.
- Transitions: `transition-all duration-150ms ease`.

### 7.2 Button Variants

| Variant | Background | Text | Border | Shadow | Hover |
|---------|-----------|------|--------|--------|-------|
| **Default (Primary)** | `bg-primary` (`#1e40af` / `#60a5fa`) | `text-primary-foreground` | none | `shadow-xs` | `bg-primary/90` |
| **Destructive** | `bg-destructive` (`#ef4444` / `#f87171`) | `text-white` | none | `shadow-xs` | `bg-destructive/90` |
| **Outline** | `bg-background` | `text-foreground` | `border border-input` | `shadow-xs` | `bg-accent text-accent-foreground` |
| **Secondary** | `bg-secondary` | `text-secondary-foreground` | none | `shadow-xs` | `bg-secondary/80` |
| **Ghost** | transparent | `text-foreground` | none | none | `bg-accent text-accent-foreground` |
| **Link** | transparent | `text-primary` | none | none | `underline` via `underline-offset-4 hover:underline` |

### 7.3 Button Sizes

| Size | Height | Padding | Font Size | Border Radius |
|------|--------|---------|-----------|---------------|
| **sm** | `32px` (h-8) | `px-3` | `text-sm` | `rounded-md` |
| **default** | `36px` (h-9) | `px-4 py-2` | `text-sm` | `rounded-md` |
| **lg** | `40px` (h-10) | `px-6` | `text-sm` | `rounded-md` |
| **icon** | `36px` (size-9) | — | — | `rounded-md` |

### 7.4 Button States

| State | Visual |
|-------|--------|
| **Default** | Per variant spec above |
| **Hover** | See variant table; opacity shift or bg change |
| **Active / Pressed** | `scale-[0.98]` (subtle press feedback) |
| **Focus (keyboard)** | `outline: 2px solid var(--ring); outline-offset: 2px; ring-3px ring-ring/50` |
| **Disabled** | `opacity: 50%; pointer-events: none` |
| **Loading** | Disabled appearance + spinner icon (`Loader2` from Lucide, `animate-spin`) replacing text |
| **Icon-only (icon size)** | Same as default but square, centered icon |

### 7.5 Button with Icon

- Icon placed **before** text by default (left side).
- Gap: `gap-2`.
- Icon size: `size-4` (16px).
- For icon-only buttons: `gap-0`, icon `size-5` (20px) for better visibility.

---

## 8. Input Fields

### 8.1 Text Input / Email / Password

| Property | Value |
|----------|-------|
| Height | `36px` (h-9) |
| Padding | `px-3 py-1` |
| Border | `1px solid var(--input)` (`#cbd5e1` / `#1e2d4a`) |
| Border Radius | `rounded-md` |
| Background | `transparent` (light) / `bg-input/30` (dark) |
| Font Size | `text-base` (mobile) / `text-sm` (md+) |
| Text Color | `text-foreground` |
| Placeholder | `text-muted-foreground` |
| Shadow | `shadow-xs` |

### 8.2 Input States

| State | Visual |
|-------|--------|
| **Default** | Border `var(--input)`, transparent bg |
| **Focus** | Border `var(--ring)` (`#2563eb`), `ring-3px ring-ring/50` |
| **Error** | Border `var(--destructive)`, `ring-3px ring-destructive/20` (light) / `ring-destructive/40` (dark) |
| **Disabled** | `opacity: 50%; cursor: not-allowed` |
| **Read-only** | Same as default but `cursor: default` |

### 8.3 Textarea

- Same styling as text input.
- `min-height: 64px` (`min-h-16`).
- `field-sizing-content` for auto-grow.
- Padding: `px-3 py-2`.

### 8.4 Select / Dropdown

- Same border, radius, and focus styles as input.
- Uses shadcn/ui Select component.
- Chevron icon on the right.

### 8.5 Checkbox

- Uses shadcn/ui Checkbox component.
- Size: `size-4` (16px) checkbox, `size-3.5` (14px) checkmark.
- Focus ring: `ring-2 ring-ring ring-offset-2`.
- Accent color: `accent-primary`.

### 8.6 Switch / Toggle

- Uses shadcn/ui Switch component.
- Width: `44px`, Height: `24px`.
- Off: `bg-input`.
- On: `bg-primary`.
- Thumb: `size-5` (20px), white circle.

### 8.7 Radio Group

- Uses shadcn/ui Radio Group.
- Same focus/border styles as checkbox.
- Accent color: `accent-primary`.

### 8.8 File Upload

- Dashed border area: `border-2 border-dashed border-input`.
- On drag hover: `border-primary bg-primary/5`.
- Upload icon centered, muted text below.
- Accepted file types listed in small caption text.

---

## 9. Cards

### 9.1 Standard Card

| Property | Value |
|----------|-------|
| Background | `bg-card` (`#ffffff` / `#141c2e`) |
| Text | `text-card-foreground` |
| Border | `1px solid var(--border)` |
| Border Radius | `rounded-xl` |
| Shadow | `shadow-sm` |
| Padding (content) | `px-6 py-6` (from CardContent `p-6`) |
| Internal Gap | `gap-6` |

### 9.2 Glassmorphism Card (GlassCard)

| Property | Light | Dark |
|----------|-------|------|
| Background | `bg-card/80` | `bg-card/80` |
| Backdrop | `backdrop-blur-sm` | `backdrop-blur-sm` |
| Border | `border border-border/50` | `border border-border/50` |
| Shadow | `shadow-sm` | `shadow-sm` |
| Hover Shadow | `hover:shadow-md` | `hover:shadow-md` |
| Hover Border | `hover:border-border` | `hover:border-border` |
| Transition | `transition-all duration-200` | `transition-all duration-200` |

### 9.3 Card Title

- `font-semibold`, `leading-none`.
- Typically `text-lg` or `text-xl` depending on hierarchy.

### 9.4 Card Description

- `text-sm`, `text-muted-foreground`.

---

## 10. Badges & Tags

### 10.1 Badge Variants (shadcn/ui)

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| **default** | `bg-primary` | `text-primary-foreground` | transparent |
| **secondary** | `bg-secondary` | `text-secondary-foreground` | transparent |
| **destructive** | `bg-destructive` | `text-white` | transparent |
| **outline** | transparent | `text-foreground` | `border` |

### 10.2 Badge Sizing

| Property | Value |
|----------|-------|
| Font Size | `text-xs` |
| Font Weight | `font-medium` |
| Padding | `px-2 py-0.5` |
| Border Radius | `rounded-md` |
| Gap (icon) | `gap-1` |
| Icon Size | `size-3` |

### 10.3 Status Badges

- Always use `variant="outline"` + `border-0` + custom status colors (see [Section 4](#4-status-indicators)).
- Status badges use background color fills, not outline borders.

### 10.4 Category Tags (Job Categories)

| Category | Light | Dark |
|----------|-------|------|
| Domestic Helper | `bg-pink-100 text-pink-800` | `bg-pink-900/30 text-pink-300` |
| Caregiver | `bg-purple-100 text-purple-800` | `bg-purple-900/30 text-purple-300` |
| Nurse | `bg-teal-100 text-teal-800` | `bg-teal-900/30 text-teal-300` |
| Factory | `bg-orange-100 text-orange-800` | `bg-orange-900/30 text-orange-300` |
| Hospitality | `bg-amber-100 text-amber-800` | `bg-amber-900/30 text-amber-300` |

---

## 11. Borders & Dividers

### 11.1 Border Colors

| Context | Light | Dark |
|---------|-------|------|
| Default | `#cbd5e1` (slate-300) | `#1e2d4a` |
| Subtle | `border-border/50` | `border-border/50` |
| Strong / Emphasis | `border-foreground/20` | `border-foreground/20` |
| Input | `#cbd5e1` (slate-300) | `#1e2d4a` |
| Error | `border-destructive` | `border-destructive` |
| Focus | `border-ring` (`#2563eb`) | `border-ring` (`#3b82f6`) |

### 11.2 Divider / Separator

- Uses shadcn/ui Separator component.
- Default: `bg-border` (horizontal or vertical).
- Height: `1px` (horizontal) / `1px` width (vertical).

---

## 12. Border Radius Rules

### 12.1 Base Radius

The global base radius is `--radius: 0.625rem` (10px), defined in `:root`.

### 12.2 Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `calc(0.625rem - 4px)` = ~6px | Small elements: badges, small tags, tooltips |
| `--radius-md` | `calc(0.625rem - 2px)` = ~8px | Input fields, buttons, toggles, small cards |
| `--radius-lg` | `0.625rem` = 10px | Default for most components |
| `--radius-xl` | `calc(0.625rem + 4px)` = ~14px | Large cards, modals, hero sections |

### 12.3 When to Use Which Radius

| Element | Radius | Tailwind | Notes |
|---------|--------|----------|-------|
| **Buttons** (all variants) | `8px` | `rounded-md` | All button sizes |
| **Input / Textarea / Select** | `8px` | `rounded-md` | Form fields |
| **Badge / Tag** | `8px` | `rounded-md` | Inline labels |
| **Card** | `12px` | `rounded-xl` | Content cards, widgets |
| **Dialog / Modal** | `12px` | `rounded-xl` | Modal containers |
| **Dropdown / Popover** | `8px` | `rounded-md` | Menus, selects |
| **Toast / Notification** | `8px` | `rounded-md` | System messages |
| **Avatar** | `9999px` | `rounded-full` | Profile images |
| **Checkbox** | `4px` | `rounded-sm` | Square-ish |
| **Switch** | `9999px` | `rounded-full` | Toggle switch track |
| **Tooltip** | `6px` | `rounded-sm` | Small hint boxes |
| **Table** | `0px` | `rounded-none` | Tables use outer wrapper rounding only |
| **Skeleton** | Inherited | — | Matches the element it replaces |
| **Scrollbar thumb** | `4px` | `rounded` | Custom scrollbar |

---

## 13. Shadows

### 13.1 Design Philosophy

- **Cards get subtle shadow for depth.**
- **Buttons are flat** (only `shadow-xs` on filled variants).
- No heavy or dramatic shadows.

### 13.2 Shadow Scale

| Level | Value | Usage |
|-------|-------|-------|
| **xs** | `0 1px 2px rgba(0,0,0,0.05)` | Buttons, inputs, subtle depth |
| **sm** | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Cards at rest |
| **md** | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` | Cards on hover, elevated elements |
| **lg** | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Modals, dropdowns |
| **xl** | `0 20px 25px rgba(0,0,0,0.1), 0 8px 10px rgba(0,0,0,0.04)` | Floating panels (rare) |

### 13.3 When to Use Which Shadow

| Element | Rest | Hover | Notes |
|---------|------|-------|-------|
| **Card** | `shadow-sm` | `shadow-md` | Subtle lift on hover |
| **Glass Card** | `shadow-sm` | `shadow-md` | Same as card |
| **Button (default/secondary/destructive)** | `shadow-xs` | — | No shadow change on hover |
| **Button (outline/ghost/link)** | none | — | No shadow ever |
| **Input** | `shadow-xs` | — | No shadow change |
| **Dropdown / Popover** | `shadow-lg` | — | Elevated above content |
| **Dialog / Modal** | `shadow-lg` | — | Highest layer |
| **Toast** | `shadow-lg` | — | Notification layer |
| **Nav bar** | `shadow-xs` (glass) | — | Subtle separation |

### 13.4 Dark Mode Shadow Adjustment

- Shadows in dark mode should be **more subtle** since the dark background already provides depth.
- Consider reducing opacity by ~30-50% in dark mode for `shadow-sm` and `shadow-md`.

---

## 14. Glassmorphism

### 14.1 When to Use Glassmorphism

- **Navigation bar** (`.glass-nav`): Always glassmorphism for the sticky top nav.
- **Hero sections**: Glassmorphism overlay cards on gradient backgrounds.
- **Stat cards on landing page**: When placed over gradient/pattern backgrounds.
- **Feature highlight cards**: When used on colorful section backgrounds.

### 14.2 When NOT to Use Glassmorphism

- **Dashboard content cards**: Use standard Card styling with `shadow-sm`.
- **Form containers**: Use standard Card styling.
- **Table wrappers**: Use standard Card styling.
- **Sidebar**: Standard solid background (`--sidebar` variable).

### 14.3 Glassmorphism Specifications

#### `.glass` (Base)

| Property | Light | Dark |
|----------|-------|------|
| Background | `rgba(255, 255, 255, 0.1)` | `rgba(20, 28, 46, 0.4)` |
| Backdrop | `blur(12px)` | `blur(12px)` |
| Border | `1px solid rgba(255, 255, 255, 0.2)` | `1px solid rgba(59, 130, 246, 0.15)` |

#### `.glass-card` (Elevated Glass)

| Property | Light | Dark |
|----------|-------|------|
| Background | `rgba(255, 255, 255, 0.15)` | `rgba(20, 28, 46, 0.5)` |
| Backdrop | `blur(16px)` | `blur(16px)` |
| Border | `1px solid rgba(255, 255, 255, 0.25)` | `1px solid rgba(59, 130, 246, 0.2)` |
| Shadow | `0 8px 32px rgba(0, 0, 0, 0.1)` | `0 8px 32px rgba(0, 0, 0, 0.4)` |

#### `.glass-card-light` (Subtle Glass)

| Property | Light | Dark |
|----------|-------|------|
| Background | `rgba(255, 255, 255, 0.7)` | `rgba(20, 28, 46, 0.7)` |
| Backdrop | `blur(16px)` | (inherited) |
| Border | `1px solid rgba(255, 255, 255, 0.4)` | `1px solid rgba(59, 130, 246, 0.2)` |
| Shadow | `0 8px 32px rgba(0, 0, 0, 0.06)` | (inherited) |

#### `.glass-nav` (Navigation)

| Property | Light | Dark |
|----------|-------|------|
| Background | `rgba(255, 255, 255, 0.85)` | `rgba(11, 17, 32, 0.88)` |
| Backdrop | `blur(20px)` | (inherited) |
| Border | `border-bottom: 1px solid rgba(255, 255, 255, 0.3)` | `border-bottom: 1px solid rgba(59, 130, 246, 0.15)` |
| Shadow | `0 1px 12px rgba(0, 0, 0, 0.05)` | `0 1px 20px rgba(0, 0, 0, 0.4)` |

---

## 15. Tables

### 15.1 Table Styling

| Property | Value |
|----------|-------|
| Font Size | `text-sm` |
| Header BG | `bg-muted` / `hover:bg-muted/50` |
| Header Text | `text-muted-foreground` `font-medium` |
| Row Border | `border-b border-border` |
| Row Hover | `hover:bg-muted/50` |
| Selected Row | `bg-accent` |
| Cell Padding | `px-4 py-3` |
| Header Padding | `px-4 py-3` |
| Border Radius | `rounded-lg` on outer wrapper (if applicable) |

---

## 16. Toasts & Notifications

### 16.1 Toast Types (Sonner)

| Type | Border Left Color | Icon | Notes |
|------|------------------|------|-------|
| **Success** | `border-l-4 border-l-green-500` | `CheckCircle` green | Action completed |
| **Error** | `border-l-4 border-l-red-500` | `XCircle` red | Action failed |
| **Warning** | `border-l-4 border-l-amber-500` | `AlertTriangle` amber | Caution |
| **Info** | `border-l-4 border-l-blue-500` | `Info` blue | Informational |

### 16.2 Toast Styling

- Background: `bg-card` (or `bg-background`).
- Text: `text-foreground` `text-sm`.
- Border radius: `rounded-md`.
- Shadow: `shadow-lg`.
- Duration: Auto-dismiss after 4-5 seconds.
- Position: Bottom-right corner.

---

## 17. Dialogs / Modals

### 17.1 Dialog Styling

| Property | Value |
|----------|-------|
| Overlay | `bg-black/50` `backdrop-blur-sm` |
| Container BG | `bg-card` |
| Container Radius | `rounded-xl` |
| Container Shadow | `shadow-lg` |
| Container Max Width | `max-w-lg` (default) / `max-w-xl` / `max-w-2xl` |
| Container Padding | `p-6` |
| Title | `text-lg font-semibold` `text-foreground` |
| Description | `text-sm text-muted-foreground` |
| Close Button | Top-right, `ghost` variant, `size-4` icon (`X`) |

### 17.2 Dialog Actions

- Right-aligned: `justify-end gap-2`.
- Primary action: `default` button variant.
- Cancel/dismiss: `outline` or `ghost` button variant.
- Destructive action: `destructive` button variant.

---

## 18. Loading States

### 18.1 Full Page Loading

- Centered spinner: `Loader2` icon, `size-8` (32px), `animate-spin`, `text-primary`.
- Optional loading text below: `text-sm text-muted-foreground`.

### 18.2 Inline / Component Loading

- Skeleton component: `bg-muted` with `animate-pulse`.
- Match the shape of the content being loaded (text lines, circles for avatars, rectangles for images).
- Skeleton border radius should match the final element radius.

### 18.3 Button Loading

- Replace button text with `Loader2` icon, `size-4`, `animate-spin`.
- Button becomes disabled while loading.
- Original text hidden, not removed (for width stability).

### 18.4 Table Loading

- Show 3-5 skeleton rows matching column structure.
- Skeleton height: `h-12` per row.

### 18.5 Data Fetch Loading

- Show skeleton placeholders immediately.
- Smooth transition from skeleton to content (no flash).

### 18.6 Shimmer Effect (Optional Enhancement)

- CSS animation: `animate-shimmer`.
- Light: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`.
- Dark: `linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)`.

---

## 19. Empty States

### 19.1 Empty State Components

| Property | Value |
|----------|-------|
| Icon | Large Lucide icon, `size-12` (48px), `text-muted-foreground/50` |
| Title | `text-lg font-medium text-foreground` |
| Description | `text-sm text-muted-foreground` |
| CTA Button | Optional, `default` or `outline` variant |
| Container | Centered, `py-12` vertical padding |

### 19.2 Empty State Examples

| Context | Icon | Title | Description |
|---------|------|-------|-------------|
| No jobs | `Briefcase` | "No jobs found" | "Try adjusting your search or filters" |
| No applications | `FileText` | "No applications yet" | "Browse available jobs to get started" |
| No messages | `Mail` | "No messages" | "Your conversations will appear here" |
| No results (search) | `Search` | "No results found" | "Try different keywords or filters" |
| No notifications | `Bell` | "All caught up" | "You have no new notifications" |

---

## 20. Error States

### 20.1 Form Field Error

- Border: `border-destructive`.
- Ring: `ring-3px ring-destructive/20` (light) / `ring-destructive/40` (dark).
- Error message below field: `text-sm text-destructive`.
- Error icon (optional): `AlertCircle` icon, `size-4`, `text-destructive`, inline with message.

### 20.2 Error Page (404, 500, etc.)

- Large icon or illustration at top.
- Error code: `text-4xl font-bold text-foreground`.
- Message: `text-lg text-muted-foreground`.
- CTA: "Go back home" button, `default` variant.

### 20.3 Inline Error (Toast)

- Red-themed toast notification (see [Section 16](#16-toasts--notifications)).

### 20.4 API Error / Network Error

- Alert component with `destructive` variant.
- Title: "Something went wrong"
- Description: Brief error message.
- Retry button (optional).

---

## 21. Success States

### 21.1 Form Submission Success

- Green-themed toast notification.
- Optional: Green checkmark icon with brief confirmation message.

### 21.2 Success Page / Step Complete

- Large green `CheckCircle` icon, `size-16` (64px).
- Title: `text-2xl font-semibold`.
- Description: `text-muted-foreground`.
- Next step CTA button.

### 21.3 Inline Success Indicator

- Green text or green-tinted badge.
- Checkmark icon `size-4`.

---

## 22. Selection States

### 22.1 Checkbox / Radio Selected

- Accent color: `accent-primary`.
- Check/indicator: white on primary bg.

### 22.2 Row / Item Selected (Table or List)

- Background: `bg-accent`.
- Optional left border: `border-l-2 border-l-primary`.

### 22.3 Tab Selected

- Active tab: `border-b-2 border-primary` + `text-foreground` + `font-medium`.
- Inactive tab: `text-muted-foreground`.
- Hover (inactive): `text-foreground`.

### 22.4 Multi-select Selected Item

- Blue tint background: `bg-primary/10`.
- Blue checkmark: `text-primary`.
- Remove X: `text-muted-foreground hover:text-foreground`.

---

## 23. Hover Effects

### 23.1 General Rules

- Hover transitions: `transition-all duration-150ms ease` (matching base layer transition).
- No dramatic scale or movement on hover — subtle only.

### 23.2 Element-Specific Hover

| Element | Hover Effect |
|---------|-------------|
| **Button (default)** | `bg-primary/90` |
| **Button (destructive)** | `bg-destructive/90` |
| **Button (outline)** | `bg-accent text-accent-foreground` |
| **Button (secondary)** | `bg-secondary/80` |
| **Button (ghost)** | `bg-accent text-accent-foreground` (dark: `bg-accent/50`) |
| **Card** | `shadow-md` + optional `border-border` |
| **Link (inline)** | `underline` + `text-blue-700` (dark: `text-blue-300`) |
| **Table Row** | `bg-muted/50` |
| **Nav Link** | `bg-accent` + text brightens |
| **Badge (outline)** | `bg-accent text-accent-foreground` |
| **Dropdown Item** | `bg-accent text-accent-foreground` |
| **Avatar** | `ring-2 ring-ring ring-offset-2` (optional) |
| **Icon Button** | `bg-accent` |

---

## 24. Focus States

### 24.1 Keyboard Focus (focus-visible)

- Ring: `ring-[3px] ring-ring/50`.
- Border: `border-ring`.
- Outline offset: `2px` (for elements without native ring support).
- Color: `#2563eb` (light) / `#3b82f6` (dark).

### 24.2 Element-Specific Focus

| Element | Focus Style |
|---------|-------------|
| **Button** | `focus-visible:ring-[3px] ring-ring/50 focus-visible:border-ring` |
| **Input** | `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` |
| **Textarea** | Same as input |
| **Badge** | `focus-visible:ring-[3px] ring-ring/50 focus-visible:border-ring` |
| **Link** | `outline: 2px solid #2563eb; outline-offset: 2px` |
| **Checkbox/Switch/Radio** | `focus-visible:ring-2 ring-ring ring-offset-2` |
| **Skip link** | `outline: 3px solid #2563eb; outline-offset: 2px` |

---

## 25. Disabled States

### 25.1 General

- Opacity: `50%` (`opacity-50` or `disabled:opacity-50`).
- Cursor: `not-allowed` (`disabled:cursor-not-allowed`).
- Pointer events: `none` (`disabled:pointer-events-none`).

### 25.2 Element-Specific

| Element | Disabled Style |
|---------|---------------|
| **Button** | `opacity-50 pointer-events-none` |
| **Input** | `opacity-50 cursor-not-allowed` |
| **Textarea** | `opacity-50 cursor-not-allowed` |
| **Select** | `opacity-50 cursor-not-allowed` |
| **Link** | `opacity-50 pointer-events-none cursor-not-allowed text-muted-foreground no-underline` |

---

## 26. Icons

### 26.1 Icon Library

- **Lucide React** — the sole icon library.

### 26.2 Icon Sizes

| Context | Size | Tailwind |
|---------|------|----------|
| **Inline with text (button)** | `16px` | `size-4` |
| **Badge / Tag** | `12px` | `size-3` |
| **Table cell** | `16px` | `size-4` |
| **Navigation** | `20px` | `size-5` |
| **Section header** | `24px` | `size-6` |
| **Empty state** | `48px` | `size-12` |
| **Success / Error page** | `64px` | `size-16` |
| **Hero / Feature** | `32px` | `size-8` |

### 26.3 Icon Colors

- Default: Inherit from parent `currentColor`.
- Muted: `text-muted-foreground`.
- Interactive: `text-primary`.
- Success: `text-green-500` (light) / `text-green-400` (dark).
- Error: `text-red-500` (light) / `text-red-400` (dark).
- Warning: `text-amber-500` (light) / `text-amber-400` (dark).

---

## 27. Animations & Transitions

### 27.1 Base Transition

All elements have a base transition defined in `@layer base`:

```css
transition-property: background-color, border-color, color, fill, stroke, box-shadow;
transition-timing-function: ease;
transition-duration: 150ms;
```

### 27.2 Reduce Motion

When `.reduce-motion` class is active (or user `prefers-reduced-motion`):
- All transitions: `duration: 0.01ms`.
- All animations: `duration: 0.01ms; iteration-count: 1`.
- Scroll behavior: `auto`.

### 27.3 Page / View Transitions

- View transitions (SPA route changes): `fadeIn` animation, `0.2s ease-out`.
- Applied via `.view-transition` class.

### 27.4 Entry Animations (Landing Page)

| Animation | From | To | Duration | Usage |
|-----------|------|----|----------|-------|
| `fadeUp` | `opacity: 0, y: 30` | `opacity: 1, y: 0` | `0.6s` | General content entry |
| `slideInLeft` | `opacity: 0, x: -40` | `opacity: 1, x: 0` | `0.7s` | Left-side content |
| `slideInRight` | `opacity: 0, x: 40` | `opacity: 1, x: 0` | `0.7s` | Right-side content |
| `scaleIn` | `opacity: 0, scale: 0.85` | `opacity: 1, scale: 1` | `0.6s` | Cards, images |
| `fadeIn` | `opacity: 0, y: 4` | `opacity: 1, y: 0` | `0.2s` | Subtle view change |

- Easing: `[0.22, 1, 0.36, 1]` (custom ease-out).
- Stagger: `0.1s` between sibling elements.

### 27.5 Decorative Animations

| Animation | Duration | Usage |
|-----------|----------|-------|
| `float` | `3s ease-in-out infinite` | Hero decorative elements |
| `pulse-glow` | `2s ease-in-out infinite` | CTA emphasis (sparingly) |
| `shimmer` | `2s infinite` | Loading skeleton enhancement |

### 27.6 Framer Motion (Interactive)

- Used for landing page scroll-triggered animations.
- `AnimatePresence` for mount/unmount transitions.
- `useInView` for scroll-triggered reveals.
- Keep animations subtle and professional — no bouncy or playful effects.

---

## 28. Scrollbar

### 28.1 Global Scrollbar

| Property | Value |
|----------|-------|
| Width | `8px` |
| Track | `transparent` |
| Thumb | `#93c5fd` (light) / `#334155` (dark) |
| Thumb Radius | `4px` |
| Thumb Hover | `#2563eb` (light) / `#475569` (dark) |

### 28.2 Dashboard / Container Scrollbar (`.custom-scrollbar`)

| Property | Value |
|----------|-------|
| Width | `6px` |
| Track | `transparent` |
| Thumb | `rgba(148, 163, 184, 0.3)` (light) / `rgba(100, 116, 139, 0.4)` (dark) |
| Thumb Radius | `3px` |
| Thumb Hover | `rgba(148, 163, 184, 0.5)` (light) / `rgba(100, 116, 139, 0.6)` (dark) |

---

## 29. Accessibility

### 29.1 Supported Accessibility Features

| Feature | Implementation |
|---------|---------------|
| **Dyslexia-friendly font** | `.dyslexia-font` class → OpenDyslexic font, `letter-spacing: 0.05em`, `word-spacing: 0.1em` |
| **High contrast mode** | `data-contrast="high"` → black/white palette, high-contrast borders |
| **Inverted contrast** | `data-contrast="inverted"` → dark-on-light with inverted images |
| **Large cursors** | `.large-cursors` class → 32px custom SVG cursor |
| **Reduced motion** | `.reduce-motion` class → all animations disabled |
| **Font size adjustment** | Inline `fontSize` style, range 12-28px, step 2px |
| **Skip to content** | `.skip-link` → hidden link, visible on focus |
| **Focus indicators** | Visible ring on all interactive elements |
| **Screen reader** | `sr-only` class, ARIA labels, semantic HTML |

### 29.2 ARIA Requirements

- All interactive elements must have accessible labels.
- Images must have `alt` text.
- Modals must trap focus and announce via `aria-label` or `aria-labelledby`.
- Status changes must use `aria-live` regions.
- Custom controls must use appropriate ARIA roles.

---

## 30. Spacing System

### 30.1 Spacing Scale

FIRA uses Tailwind's default spacing scale (4px base unit):

| Token | Value | Common Usage |
|-------|-------|-------------|
| `0.5` | `2px` | Tight gaps |
| `1` | `4px` | Icon gaps, inline gaps |
| `1.5` | `6px` | Small button padding |
| `2` | `8px` | Tight padding, small gaps |
| `3` | `12px` | Section inner spacing |
| `4` | `16px` | Standard padding, card padding (compact) |
| `5` | `20px` | Medium padding |
| `6` | `24px` | Card padding (standard), section gaps |
| `8` | `32px` | Section padding |
| `10` | `40px` | Large section gaps |
| `12` | `48px` | Section vertical spacing |
| `16` | `64px` | Major section breaks |
| `20` | `80px` | Page-level vertical spacing |
| `24` | `96px` | Hero padding |

### 30.2 Component Spacing Standards

| Component | Padding | Gap | Notes |
|-----------|---------|-----|-------|
| **Card** | `p-6` | `gap-6` | Internal content spacing |
| **Card (compact)** | `p-4` | `gap-4` | Dense information cards |
| **Dialog** | `p-6` | `gap-4` | Modal content |
| **Form field group** | — | `gap-2` | Label + input + error |
| **Form section** | — | `gap-6` | Between field groups |
| **Page content** | `px-4 md:px-6 lg:px-8` | `gap-6` | Max-width container |
| **Section (landing)** | `py-16 md:py-24` | `gap-8` | Full-width sections |
| **Navbar** | `px-4 md:px-6` | `gap-2` | Navigation items |
| **Table cell** | `px-4 py-3` | — | Data cells |

---

## 31. Responsive Breakpoints

### 31.1 Breakpoint Scale (Tailwind Default)

| Name | Min Width | Target Devices |
|------|-----------|---------------|
| `sm` | `640px` | Large phones (landscape) |
| `md` | `768px` | Tablets |
| `lg` | `1024px` | Small laptops |
| `xl` | `1280px` | Desktops |
| `2xl` | `1536px` | Large screens |

### 31.2 Responsive Patterns

| Pattern | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Layout** | Single column | 2 columns | Full layout |
| **Sidebar** | Hidden (drawer) | Hidden (drawer) | Visible | 
| **Nav** | Hamburger menu | Hamburger menu | Full nav |
| **Cards grid** | 1 column | 2 columns | 3-4 columns |
| **Table** | Horizontal scroll | Horizontal scroll | Full table |
| **Font size** | Base (16px) | Base (16px) | Base (16px) |
| **Page padding** | `px-4` | `px-6` | `px-8` |
| **Section padding** | `py-12` | `py-16` | `py-24` |
| **Touch targets** | Min 44px | Min 44px | Standard |

---

## Appendix A: Color Quick Reference Card

```
LIGHT MODE
┌─────────────────────────────────────────────────────────────┐
│  Background:    #f8fafc (slate-50)                           │
│  Card:          #ffffff                                      │
│  Primary:       #1e40af (blue-800)     ─── Buttons, CTA      │
│  Primary Text:  #ffffff                                      │
│  Ring/Focus:    #2563eb (blue-600)     ─── Focus rings        │
│  Secondary:     #eff6ff (blue-50)      ─── Secondary bg       │
│  Accent:        #dbeafe (blue-100)     ─── Hover bg           │
│  Text:          #0f172a (slate-900)    ─── Headings, body     │
│  Muted Text:    #64748b (slate-500)    ─── Descriptions       │
│  Border:        #cbd5e1 (slate-300)    ─── All borders        │
│  Destructive:   #ef4444 (red-500)      ─── Errors, danger     │
│  Gold Accent:   #b45309 (amber-700)    ─── Stars, premium     │
└─────────────────────────────────────────────────────────────┘

DARK MODE
┌─────────────────────────────────────────────────────────────┐
│  Background:    #0b1120 (deep navy)                          │
│  Card:          #141c2e                                      │
│  Primary:       #60a5fa (blue-400)     ─── Buttons, CTA      │
│  Primary Text:  #0b1120                                      │
│  Ring/Focus:    #3b82f6 (blue-500)     ─── Focus rings        │
│  Secondary:     #1a2540                 ─── Secondary bg       │
│  Accent:        #1e293b                 ─── Hover bg           │
│  Text:          #e2e8f0 (slate-200)    ─── Headings, body     │
│  Muted Text:    #8899b4                 ─── Descriptions       │
│  Border:        #1e2d4a                 ─── All borders        │
│  Destructive:   #f87171 (red-400)      ─── Errors, danger     │
│  Gold Accent:   #fbbf24 (amber-400)    ─── Stars, premium     │
└─────────────────────────────────────────────────────────────┘

STATUS COLORS (Both Modes)
┌─────────────────────────────────────────────────────────────┐
│  Success/Approved/Active:    Green (green-100/700 / -950/300) │
│  Error/Rejected/Failed:      Red   (red-100/700 / -950/300)   │
│  Pending/Waiting/Warning:    Amber (amber-100/700 / -950/300) │
│  Info/Applied/Processing:    Blue  (blue-100/700 / -950/300)  │
│  Inactive/Closed/Cancelled:  Gray  (gray-100/500 / -950/400) │
└─────────────────────────────────────────────────────────────┘
```

## Appendix B: Design Decision Log

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Primary color is Blue | Trust, professionalism for a recruitment agency. Not too cold, not too warm. |
| 2 | Accent 1 is subtle Warm Gold/Amber | Adds warmth without being loud. Used sparingly for premium/achievement indicators. |
| 3 | Accent 2 is Slate/Cool Gray | Neutral backbone for hierarchy. Doesn't compete with primary. |
| 4 | Buttons are flat (no gradients) | Clean, professional look. Gradients can look dated. |
| 5 | Cards have subtle shadows | Provides depth and visual separation without heaviness. |
| 6 | Glassmorphism kept but scoped | Used on nav and hero only, not on every card. Prevents visual fatigue. |
| 7 | Links underline on hover only | Cleaner default appearance, underline confirms interactivity on hover. |
| 8 | Dark mode is deep navy (#0b1120) | More immersive than pure black, easier on eyes. |
| 9 | Mixed border radius codified | Each element type has a defined radius for consistency. |
| 10 | Status colors consolidated | Reduced from 11+ colors to 5 semantic categories (green, red, amber, blue, gray). |
| 11 | Pipeline statuses use info (blue) for intermediate steps | All "waiting for processing" stages use blue, not purple/teal/indigo/cyan. |
| 12 | Geist Sans + Geist Mono | Modern, clean, optimized for screens. Mono for data/code/numbers. |

---

*End of FIRA Branding Kit.*