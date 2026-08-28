# FIRA Brand Audit Findings

### [FINDING] Missing `fadeUp` keyframe — wrong name and wrong translateY value - /home/z/my-project/src/app/globals.css - Lines 320-323

The brandkit requires `@keyframes fadeUp` with `from { opacity: 0; transform: translateY(30px) }` and a duration of 0.6s using easing `cubic-bezier(0.22, 1, 0.36, 1)`. The CSS instead defines `@keyframes fadeInUp` with `translateY(20px)` — both the name and the translate distance are wrong. No corresponding `.animate-fadeUp` utility class exists.

### [FINDING] Missing `slideInLeft` keyframe — wrong name and wrong translateX value - /home/z/my-project/src/app/globals.css - Lines 325-328

The brandkit requires `@keyframes slideInLeft` with `from { opacity: 0; transform: translateX(-40px) }` and a duration of 0.7s using easing `cubic-bezier(0.22, 1, 0.36, 1)`. The CSS instead defines `@keyframes fadeInLeft` with `translateX(-20px)` — both the name and the translate distance are wrong. No corresponding `.animate-slideInLeft` utility class exists.

### [FINDING] Missing `slideInRight` keyframe — wrong name and wrong translateX value - /home/z/my-project/src/app/globals.css - Lines 330-333

The brandkit requires `@keyframes slideInRight` with `from { opacity: 0; transform: translateX(40px) }` and a duration of 0.7s using easing `cubic-bezier(0.22, 1, 0.36, 1)`. The CSS instead defines `@keyframes fadeInRight` with `translateX(20px)` — both the name and the translate distance are wrong. No corresponding `.animate-slideInRight` utility class exists.

### [FINDING] `scaleIn` keyframe uses wrong starting scale value - /home/z/my-project/src/app/globals.css - Lines 335-338

The brandkit specifies `@keyframes scaleIn` should animate from `scale(0.85)` to `scale(1)` with a duration of 0.6s. The CSS uses `scale(0.95)` as the starting value, which produces a noticeably less dramatic entrance effect.

### [FINDING] `shimmer` keyframe uses wrong animation technique - /home/z/my-project/src/app/globals.css - Lines 350-353

The brandkit specifies `@keyframes shimmer` should use `translateX(-100%)` to `translateX(100%)` with 2s infinite duration. The CSS instead uses `background-position: -200% 0` to `background-position: 200% 0`, which is a completely different animation technique. The `.animate-shimmer` class also relies on this background-position approach (lines 382-385) rather than a translateX-based approach.

### [FINDING] Missing entry animation easing `cubic-bezier(0.22, 1, 0.36, 1)` - /home/z/my-project/src/app/globals.css - Lines 314-385

The brandkit specifies that all entry animations (fadeUp, slideInLeft, slideInRight, scaleIn) should use the easing `cubic-bezier(0.22, 1, 0.36, 1)`. No animation class or keyframe definition in the CSS references this easing curve. The existing animations use `ease-out` or `ease-in-out` instead.

### [FINDING] Missing animation utility classes for entry animations - /home/z/my-project/src/app/globals.css - Lines 369-385

The brandkit implies utility classes should exist for entry animations (fadeUp at 0.6s, slideInLeft at 0.7s, slideInRight at 0.7s, scaleIn at 0.6s). Only `.animate-float`, `.animate-pulse-glow`, `.animate-shimmer`, and `.view-transition` are defined. No `.animate-fadeUp`, `.animate-slideInLeft`, `.animate-slideInRight`, or `.animate-scaleIn` classes exist.

### [FINDING] Missing shadow scale definitions (xs, sm, md, lg, xl) - /home/z/my-project/src/app/globals.css - (entire file)

The brandkit specifies a complete shadow scale:
- `--shadow-xs`: `0 1px 2px rgba(0,0,0,0.05)`
- `--shadow-sm`: `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`
- `--shadow-md`: `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)`
- `--shadow-lg`: `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)`
- `--shadow-xl`: `0 20px 25px rgba(0,0,0,0.1), 0 8px 10px rgba(0,0,0,0.04)`

None of these shadow variables or corresponding CSS custom properties are defined anywhere in globals.css or the `@theme inline` block.

### [FINDING] `dyslexia-font` class inconsistent `!important` on word-spacing - /home/z/my-project/src/app/globals.css - Lines 420-425

The brandkit specifies `.dyslexia-font` should have OpenDyslexic font, letter-spacing 0.05em, and word-spacing 0.1em. In the CSS, `letter-spacing: 0.05em` has `!important` (line 423) but `word-spacing: 0.1em` does not (line 424). This inconsistency means word-spacing could be overridden by component-level styles, breaking the accessibility feature.

### [FINDING] `data-contrast=high` missing `--popover` and `--popover-foreground` overrides - /home/z/my-project/src/app/globals.css - Lines 428-445

The brandkit says `data-contrast=high` should provide a "black/white palette, high-contrast borders" and styles for "all CSS variables". The current implementation sets overrides for `--background`, `--foreground`, `--card`, `--card-foreground`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--accent`, `--accent-foreground`, and `--destructive`. However, `--popover` and `--popover-foreground` are missing, so popover components would retain standard-theme colors in high-contrast mode.

### [FINDING] `data-contrast=inverted` missing `--popover` and `--popover-foreground` overrides - /home/z/my-project/src/app/globals.css - Lines 452-469

The brandkit says `data-contrast=inverted` should provide styles for "all CSS variables" with a dark-on-light palette. Similar to high-contrast, `--popover` and `--popover-foreground` are missing from the inverted mode overrides.

### [FINDING] `tailwind.config.ts` wraps hex CSS variables in `hsl()` — invalid CSS - /home/z/my-project/tailwind.config.ts - Lines 14-46

The tailwind config defines all colors using `hsl(var(--variable))` (e.g., `hsl(var(--background))` on line 14), but the CSS variables in globals.css are hex values (e.g., `--background: #f8fafc`). This produces invalid CSS output like `hsl(#f8fafc)`. While this file appears to be a legacy artifact not imported by Tailwind v4 (no `@config` directive in globals.css), it remains in the project and could cause confusion or breakage if re-enabled.

### [FINDING] Missing `--destructive-foreground` CSS variable - /home/z/my-project/src/app/globals.css - Lines 60-106, 111-160

The `tailwind.config.ts` (line 42) references `hsl(var(--destructive-foreground))`, but this variable is never defined in either the `:root` light-mode block or the `.dark` block in globals.css. Any usage of `text-destructive-foreground` or similar would resolve to an undefined/unset value.

---

## Proposed Fix

### Fix 1: Rename and correct entry animation keyframes

In `/home/z/my-project/src/app/globals.css`, replace `fadeInUp`, `fadeInLeft`, and `fadeInRight` with the brandkit-specified names and values:

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}
```

### Fix 2: Correct `scaleIn` starting scale

Change line 336 from `scale(0.95)` to `scale(0.85)`:
```css
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}
```

### Fix 3: Rewrite `shimmer` keyframe to use translateX

Replace lines 350-353 with:
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```
Also update `.animate-shimmer` (lines 382-385) to remove the `background-size` and `background` approach, using a pseudo-element or child element with the translateX shimmer instead.

### Fix 4: Add animation utility classes with brandkit easing and durations

After the existing animation classes, add:
```css
.animate-fadeUp {
  animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.animate-slideInLeft {
  animation: slideInLeft 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.animate-slideInRight {
  animation: slideInRight 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.animate-scaleIn {
  animation: scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
```

### Fix 5: Add shadow scale CSS variables

Add to `:root` and `@theme inline`:
```css
:root {
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.1), 0 8px 10px rgba(0,0,0,0.04);
}
```

### Fix 6: Add `!important` to `dyslexia-font` word-spacing

Change line 424 from:
```css
  word-spacing: 0.1em;
```
to:
```css
  word-spacing: 0.1em !important;
```

### Fix 7: Add `--popover` and `--popover-foreground` to contrast modes

In `data-contrast=high` (after line 445), add:
```css
  --popover: #ffffff !important;
  --popover-foreground: #000000 !important;
```

In `data-contrast=inverted` (after line 469), add:
```css
  --popover: #1a1a1a !important;
  --popover-foreground: #ffffff !important;
```

### Fix 8: Remove or fix `tailwind.config.ts` hsl() wrapping

Either remove the legacy `tailwind.config.ts` file entirely (since it is not used by Tailwind v4), or change all `hsl(var(--...))` references to `var(--...)` to match the hex-formatted CSS variables.

### Fix 9: Add `--destructive-foreground` variable

Add to `:root` (e.g., `--destructive-foreground: #ffffff;`) and to `.dark` (e.g., `--destructive-foreground: #0b1120;`), or remove the `destructive-foreground` reference from tailwind.config.ts if the file is kept.

---

## Component-Level Findings

### [FINDING] Button missing pressed state `active:scale-[0.98]` - /home/z/my-project/src/components/ui/button.tsx - Line 8

The brandkit requires a pressed state of `scale-[0.98]` on all buttons. The `buttonVariants` base class does not include `active:scale-[0.98]`.

#### Proposed Fix
Add `active:scale-[0.98]` to the base class string in the `cva()` call on line 8.

### [FINDING] Button `sm` size uses `gap-1.5` instead of `gap-2` - /home/z/my-project/src/components/ui/button.tsx - Line 26

The brandkit specifies `gap-2` for all buttons. The `sm` size variant overrides the base `gap-2` with `gap-1.5`.

#### Proposed Fix
Remove `gap-1.5` from the `sm` size variant on line 26 so it inherits the base `gap-2`.

### [FINDING] Pipeline status badges use disallowed colors in status-badge.tsx - /home/z/my-project/src/components/shared/status-badge.tsx - Lines 9-17

The brandkit restricts pipeline statuses to ONLY green, red, amber, blue, gray. The following statuses use forbidden colors:
- `interview_scheduled` (line 9): uses purple-100/purple-700 — purple is not allowed
- `interview_passed` (line 10): uses emerald-100/emerald-700 — should use green
- `pending_documents` (line 11): uses orange-100/orange-700 — orange is not allowed
- `documents_submitted` (line 12): uses teal-100/teal-700 — teal is not allowed
- `pending_fira_review` (line 13): uses indigo-100/indigo-700 — indigo is not allowed
- `pending_employer_review` (line 15): uses cyan-100/cyan-700 — cyan is not allowed
- `employer_accepted` (line 16): uses lime-100/lime-700 — lime is not allowed
- `deployed` (line 17): uses emerald-200/emerald-800 — should use green-100/green-700

Additionally, `completed` (line 18) uses `dark:text-gray-300` but the brandkit specifies gray dark mode text should be `gray-400`.

#### Proposed Fix
Replace each status color with the nearest allowed palette color (green, red, amber, blue, or gray), using the format `bg-{color}-100 text-{color}-700 dark:bg-{color}-950/50 dark:text-{color}-300`.

### [FINDING] Status color system in lib/status.ts uses forbidden colors and wrong dark-mode format - /home/z/my-project/src/lib/status.ts - Lines 27-217

The brandkit restricts pipeline statuses to ONLY green, red, amber, blue, gray and specifies dark mode as `{color}-950/50` bg with `{color}-300` text. The `APPLICATION_STATUSES` array has the following violations:
- `screening` (line 41): cyan — not allowed
- `shortlisted` (line 51): violet — not allowed
- `interview` (line 61): purple — not allowed
- `under_review` (line 81): orange — not allowed
- `fira_approved` (line 101): emerald — should use green
- `employer_accepted` (line 131): emerald — should use green
- `offered` (line 151): teal — not allowed
- `hired` (line 161): emerald — should use green
- `processing` (line 171): sky — not allowed
- `completed` (line 191): slate — should use gray
- `withdrawn` (line 211): uses `text-gray-600` — should be `text-gray-500`

All statuses use `border-{color}-200 dark:border-{color}-800` which the brandkit says should be `border-0` for status badges. All statuses use `{color}-900/40` for dark mode bg instead of the required `{color}-950/50`.

#### Proposed Fix
1. Replace all non-allowed colors with the closest allowed palette color.
2. Change all dark mode bg from `*-900/40` to `*-950/50`.
3. Remove all `border-*` classes from status color strings.
4. Fix `completed` to use gray-100/gray-500/gray-950/50/gray-400.
5. Fix `withdrawn` text to `gray-500`.

### [FINDING] Checkbox uses custom data-state styling instead of `accent-primary` - /home/z/my-project/src/components/ui/checkbox.tsx - Line 17

The brandkit specifies checkboxes should use `accent-primary` for their checked state styling. The component instead uses `data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary`.

#### Proposed Fix
Replace the data-state checked styles with `accent-primary` and simplify the checkbox class to rely on the native accent-color approach.

### [FINDING] Switch has wrong dimensions — too small - /home/z/my-project/src/components/ui/switch.tsx - Lines 16, 24

The brandkit specifies switches should be 44px width, 24px height, with thumb size-5. The current implementation has:
- Width: `w-8` (32px) instead of 44px (line 16)
- Height: `h-[1.15rem]` (~18.4px) instead of 24px (line 16)
- Thumb: `size-4` instead of `size-5` (line 24)

#### Proposed Fix
Change width to `w-11` (44px), height to `h-6` (24px), and thumb to `size-5` on line 24. Update the thumb's `translate-x` value accordingly to fit the new track width.

### [FINDING] Table header missing `bg-muted` and uses wrong text color - /home/z/my-project/src/components/ui/table.tsx - Lines 68-79

The brandkit specifies table headers should have `bg-muted` background and `text-muted-foreground` for text. The `TableHead` component has `text-foreground` (line 73) and no `bg-muted` class.

#### Proposed Fix
Add `bg-muted text-muted-foreground` to the `TableHead` className and remove `text-foreground`.

### [FINDING] Table cell and header padding wrong — `p-2`/`px-2` instead of `px-4 py-3` - /home/z/my-project/src/components/ui/table.tsx - Lines 73, 86

The brandkit specifies cell padding of `px-4 py-3`. `TableHead` has `px-2` (line 73) and `TableCell` has `p-2` (line 86).

#### Proposed Fix
Change `TableHead` padding from `px-2` to `px-4 py-3` and `TableCell` padding from `p-2` to `px-4 py-3`.

### [FINDING] Table container missing `rounded-lg` - /home/z/my-project/src/components/ui/table.tsx - Line 11

The brandkit says the table outer wrapper should be `rounded-lg` if applicable. The `Table` component's wrapper div (line 11) has no rounded class.

#### Proposed Fix
Add `rounded-lg` and `border` to the wrapper div className on line 11.

### [FINDING] Sonner toaster missing brandkit toast styling - /home/z/my-project/src/components/ui/sonner.tsx - Lines 10-22

The brandkit specifies toasts should have: `border-l-4` with color (green-500/red-500/amber-500/blue-500), `bg-card`, `text-foreground text-sm`, `rounded-md`, `shadow-lg`, and specific icons (CheckCircle, XCircle, AlertTriangle, Info). The Sonner `Toaster` only configures `--normal-bg`/`--normal-text`/`--normal-border` using popover variables, and does not set any of the required toast styling properties.

#### Proposed Fix
Add `toastOptions` with custom styling that applies `border-l-4`, `bg-card`, `text-foreground`, `text-sm`, `rounded-md`, `shadow-lg` and appropriate icons for each toast type via Sonner's `toastOptions.style` or a custom `toast` component wrapper.

### [FINDING] Radix toast uses `bg-background` instead of `bg-card` - /home/z/my-project/src/components/ui/toast.tsx - Line 32

The brandkit says toasts should use `bg-card`. The default toast variant (line 32) uses `bg-background`. Additionally, the base class (line 28) is missing `text-sm` and `border-l-4` styling.

#### Proposed Fix
Change `bg-background` to `bg-card` on line 32. Add `text-sm` to the base cva class string.

### [FINDING] Dialog overlay missing `backdrop-blur-sm` - /home/z/my-project/src/components/ui/dialog.tsx - Line 41

The brandkit specifies dialog overlays should use `bg-black/50 backdrop-blur-sm`. The overlay only has `bg-black/50`.

#### Proposed Fix
Add `backdrop-blur-sm` to the overlay className on line 41.

### [FINDING] Dialog content uses `bg-background` and `rounded-lg` instead of `bg-card` and `rounded-xl` - /home/z/my-project/src/components/ui/dialog.tsx - Line 63

The brandkit specifies dialog containers should use `bg-card rounded-xl`. The current implementation uses `bg-background` and `rounded-lg`.

#### Proposed Fix
Change `bg-background` to `bg-card` and `rounded-lg` to `rounded-xl` on line 63.

### [FINDING] DialogTitle missing `text-foreground` - /home/z/my-project/src/components/ui/dialog.tsx - Line 113

The brandkit specifies dialog titles should be `text-lg font-semibold text-foreground`. The `DialogTitle` has `text-lg font-semibold` but is missing `text-foreground`.

#### Proposed Fix
Add `text-foreground` to the `DialogTitle` className on line 113.

### [FINDING] AlertDialog has same overlay/container/title violations as Dialog - /home/z/my-project/src/components/ui/alert-dialog.tsx - Lines 39, 57, 102

Same issues as Dialog: overlay missing `backdrop-blur-sm` (line 39), content uses `bg-background rounded-lg` instead of `bg-card rounded-xl` (line 57), and title is missing `text-foreground` (line 102).

#### Proposed Fix
Apply the same fixes as the Dialog component to the corresponding AlertDialog sub-components.

### [FINDING] Skeleton uses `bg-accent` instead of `bg-muted` - /home/z/my-project/src/components/ui/skeleton.tsx - Line 7

The brandkit specifies loading skeletons should use `bg-muted animate-pulse`. The component uses `bg-accent animate-pulse`.

#### Proposed Fix
Change `bg-accent` to `bg-muted` on line 7.

### [FINDING] Buttons across 15+ files use `rounded-xl` instead of `rounded-md` - /home/z/my-project/src/components/ (multiple files) - Various lines

The brandkit states: "ALL buttons use rounded-md (8px), NEVER rounded-lg or rounded-full (except avatar/switch)". The following Button instances use `rounded-xl`:
- `auth/auth-modal.tsx` lines 223, 406 (also have gradient violations)
- `shared/app-nav.tsx` line 309
- `landing/services-page.tsx` lines 182, 186
- `landing/landing-page.tsx` lines 383, 391, 395, 830, 874
- `landing/contact-page.tsx` line 156
- `landing/about-page.tsx` line 125
- `dashboard/ats-pipeline-page.tsx` lines 683, 750, 1135, 1239, 1270
- `dashboard/fira-jobs-page.tsx` line 46
- `shared/user-settings-page.tsx` lines 236, 261, 273, 338
- `cms/cms-social-page.tsx` line 114
- `cms/cms-pages-page.tsx` line 107
- `cms/cms-org-chart-page.tsx` lines 157, 167
- `cms/cms-testimonials-page.tsx` line 100
- `cms/cms-terms-page.tsx` lines 141, 179

#### Proposed Fix
Replace all `rounded-xl` with `rounded-md` on Button components. Alternatively, if a specific larger radius is desired for landing hero CTAs only, add a dedicated `pill` or `hero` variant to the Button component instead of ad-hoc className overrides.

### [FINDING] Buttons in auth-modal and fira-jobs-page use `bg-gradient-*` on buttons - /home/z/my-project/src/components/auth/auth-modal.tsx - Lines 223, 406; /home/z/my-project/src/components/dashboard/fira-jobs-page.tsx - Line 46

The brandkit states: "NO gradients on buttons (no bg-gradient-*)". Three Button instances use gradients:
- `auth-modal.tsx:223`: `bg-gradient-to-r from-blue-700 to-blue-900`
- `auth-modal.tsx:406`: same gradient
- `fira-jobs-page.tsx:46`: same gradient

#### Proposed Fix
Replace gradient backgrounds with solid `bg-primary` and remove all `from-*`/`to-*`/`hover:from-*`/`hover:to-*` gradient classes.

### [FINDING] Buttons use non-standard heights `h-11` and `h-12` - /home/z/my-project/src/components/auth/auth-modal.tsx - Lines 223, 406; /home/z/my-project/src/components/landing/landing-page.tsx - Line 874; /home/z/my-project/src/components/landing/contact-page.tsx - Line 156

The brandkit defines button sizes as: sm=h-8, default=h-9, lg=h-10, icon=size-9. There is no h-11 or h-12 size. Four buttons use h-11 (auth-modal lines 223/406, contact-page line 156) and one uses h-12 (landing-page line 874).

#### Proposed Fix
Change h-11 buttons to `size="lg"` (h-10) and the h-12 button to `size="lg"` (h-10), adding `py-3` if extra vertical padding is desired, or add a new `xl` variant to the Button component with the desired height.

### [FINDING] Nav links use `text-foreground` instead of `text-slate-600 dark:text-slate-300` - /home/z/my-project/src/components/shared/app-nav.tsx - Line 194

The brandkit specifies nav links should use `text-slate-600 dark:text-slate-300` with hover `text-foreground dark:text-slate-100 + bg-accent`. The scrolled-state nav links (line 194) use `text-foreground hover:text-foreground hover:bg-accent`, missing the slate base color.

#### Proposed Fix
Change the scrolled-state inactive link classes from `text-foreground hover:text-foreground hover:bg-accent` to `text-slate-600 dark:text-slate-300 hover:text-foreground dark:hover:text-slate-100 hover:bg-accent`.

### [FINDING] Nav icons use `h-4 w-4` instead of brandkit nav size `h-5 w-5` - /home/z/my-project/src/components/shared/app-nav.tsx - Lines 198, 158

The brandkit specifies nav icons should be `size-5` (h-5 w-5). Desktop nav icons (line 198) and mobile nav icons (line 158) both use `h-4 w-4`.

#### Proposed Fix
Change icon classes from `h-4 w-4` to `h-5 w-5` in both the desktop nav button (line 198) and mobile nav button (line 158).

### [FINDING] Empty states use wrong icon sizes and missing title/description pattern - /home/z/my-project/src/components/ (multiple files) - Various lines

The brandkit specifies empty states must have: icon `size-12 text-muted-foreground/50`, title `text-lg font-medium text-foreground`, description `text-sm text-muted-foreground`, container `py-12`. Violations found:
- `dashboard/fira-dashboard.tsx:398`: Icon h-8 w-8 (should be h-12 w-12), text-muted-foreground (should be /50), wrapped in extra bg-muted div, text is text-sm instead of text-lg + text-sm split
- `dashboard/fira-dashboard.tsx:454`: Same violations as above
- `dashboard/ats-pipeline-page.tsx:727`: Icon h-8 w-8 (should be h-12 w-12)
- `dashboard/ats-pipeline-page.tsx:741`: Icon h-7 w-7 (should be h-12 w-12)
- `dashboard/applicant-dashboard.tsx:342`: Icon h-8 w-8 with text-muted-foreground/40 (should be h-12 w-12 with /50)
- `dashboard/applicant-dashboard.tsx:547`: Icon h-8 w-8 (should be h-12 w-12)
- `dashboard/applicant-dashboard.tsx:622`: Icon h-10 w-10 with text-muted-foreground/40 (should be h-12 w-12 with /50)
- `landing/landing-page.tsx:549`: Icon h-12 w-12 ✓ but uses text-muted-foreground/40 (should be /50)
- `cms/cms-pages-page.tsx:173`: Icon h-10 w-10 (should be h-12 w-12)
- `dashboard/agency-endorsements-page.tsx:45`: Icon h-12 w-12 ✓ but uses text-muted-foreground (should be /50)
- `dashboard/agency-jobs-page.tsx:49`: Icon h-12 w-12 ✓ but uses text-muted-foreground (should be /50)

#### Proposed Fix
Create a shared `EmptyState` component that enforces the brandkit pattern (icon size-12 + /50, title text-lg font-medium text-foreground, description text-sm text-muted-foreground, container py-12). Replace all ad-hoc empty state markup with this component.

### [FINDING] Category tag colors use wrong text shade and dark mode format across 3 files - /home/z/my-project/src/components/landing/job-listing-page.tsx - Lines 47-52; /home/z/my-project/src/components/landing/landing-page.tsx - Lines 62-67; /home/z/my-project/src/components/dashboard/applicant-jobs-page.tsx - Lines 73-77

The brandkit status badge format is `bg-{color}-100 text-{color}-700 dark:bg-{color}-950/50 dark:text-{color}-300`. All three files use `text-{color}-800` (wrong shade), `dark:bg-{color}-900/30` (wrong dark bg), and some use `dark:text-{color}-400` (wrong dark text). The color assignments (pink/purple/teal/orange/amber) are correct per the brandkit.

#### Proposed Fix
Update all category color records to use `-700` for text, `-950/50` for dark bg, and `-300` for dark text.

### [FINDING] Inline status color maps use wrong colors in agency-endorsements-page.tsx - /home/z/my-project/src/components/dashboard/agency-endorsements-page.tsx - Lines 27-32

The `statusConfig` uses `emerald` for `fira_approved` and `employer_accepted` (should be green), `text-{color}-800` (should be -700), `dark:bg-{color}-900/30` (should be -950/50), and `dark:text-{color}-400` (should be -300).

#### Proposed Fix
Replace emerald with green, change -800 to -700, -900/30 to -950/50, and -400 to -300 for all entries.

### [FINDING] Inline status color map uses wrong colors in agency-jobs-page.tsx - /home/z/my-project/src/components/dashboard/agency-jobs-page.tsx - Lines 28-31

The `statusColors` map uses `emerald` for `open` (should be green), `bg-muted text-foreground` for `closed` (should be `bg-gray-100 text-gray-500 dark:bg-gray-950/50 dark:text-gray-400`), and all entries use -800/-900/30/-400 format instead of -700/-950/50/-300.

#### Proposed Fix
Replace emerald with green, fix `closed` to use gray status colors, and update all dark mode values to the brandkit format.

### [FINDING] Inline status colors in fira-dashboard.tsx use emerald for open status - /home/z/my-project/src/components/fira/fira-dashboard.tsx - Line 65

The `open` status badge uses `bg-emerald-100 text-emerald-700`. The brandkit says job status `open` should use green.

#### Proposed Fix
Change `bg-emerald-100 text-emerald-700` to `bg-green-100 text-green-700`.

### [FINDING] Inline status colors in applicant-dashboard.tsx and employer-dashboard.tsx use yellow and emerald - /home/z/my-project/src/components/applicant/applicant-dashboard.tsx - Line 41; /home/z/my-project/src/components/employer/employer-dashboard.tsx - Line 157

`applicant-dashboard.tsx:41` uses `yellow` for pending/accepted (should be `amber`) and `emerald` for hired (should be `green`). `employer-dashboard.tsx:157` uses `yellow` for pending (should be `amber`) and `emerald` for approved (should be `green`).

#### Proposed Fix
Replace `yellow` with `amber` and `emerald` with `green` in both status color maps.

### [FINDING] Dashboard cards use glassmorphism (backdrop-blur) where forbidden - /home/z/my-project/src/components/dashboard/applicant-dashboard.tsx - Lines 203, 287, 321, 392, 524, 600; /home/z/my-project/src/components/dashboard/employer-dashboard.tsx - Lines 146, 157, 159, 160, 193, 438; /home/z/my-project/src/components/dashboard/fira-dashboard.tsx - Line 294

The brandkit states: "Glassmorphism ONLY on nav/hero/landing stat cards, NOT on dashboard/form/table cards". The applicant-dashboard, employer-dashboard, and fira-dashboard all use `backdrop-blur-xl` or `GlassCard` (which has `backdrop-blur-sm`) on their dashboard cards.

#### Proposed Fix
Remove all `backdrop-blur-*` and `bg-card/70` (or `bg-white/60`) classes from dashboard cards. Replace with standard card styling: `bg-card border border-border shadow-sm`.

### [FINDING] Icons inside Button components use `mr-2` instead of relying on parent `gap-2` - /home/z/my-project/src/components/ (multiple files) - Various lines

The brandkit says "Icon before text, gap-2" and the Button base class already includes `gap-2`. Many Button instances add `mr-2` on child icons, resulting in double spacing (gap-2 from parent + mr-2 from icon). Affected files include: `user-settings-page.tsx` (lines 237, 262, 274, 339), `ats-pipeline-page.tsx` (lines 1247, 1279), `agency-jobs-page.tsx` (line 42), `cms-form-builder-page.tsx` (lines 149, 263), `resume-enhancement-page.tsx` (lines 79, 81), `cms-social-page.tsx` (line 114), `cms-pages-page.tsx` (line 107), `cms-terms-page.tsx` (lines 142, 180), `cms-testimonials-page.tsx` (line 100), `cms-faq-page.tsx` (lines 338, 442, 735), `auth-modal.tsx` (lines 224, 407), `employer-partnership-page.tsx` (line 394), `contact-page.tsx` (line 158/160).

#### Proposed Fix
Remove all `mr-2` classes from icons that are direct children of `<Button>` components. The Button's base `gap-2` class handles the spacing.

### [FINDING] SelectTrigger components use `rounded-xl` instead of `rounded-md` - /home/z/my-project/src/components/dashboard/ats-pipeline-page.tsx - Line 698; /home/z/my-project/src/components/cms/cms-faq-page.tsx - Lines 405, 669

The brandkit specifies input fields should use `rounded-md`. SelectTrigger is an input-like element. Three instances override with `rounded-xl`.

#### Proposed Fix
Remove `rounded-xl` from all SelectTrigger className overrides, letting the default `rounded-md` from the SelectTrigger base class apply.

---

## Pages, Lib, Hooks, Store & Utility File Findings

### [FINDING] Root layout body missing `min-h-screen flex flex-col` for sticky footer - /home/z/my-project/src/app/layout.tsx - Line 35

The brandkit requires the root layout to use `min-h-screen flex flex-col` on the body (or root div) and `mt-auto` on the footer to make it sticky to the bottom. The `layout.tsx` body element (line 35) has no flex layout. While `page.tsx` line 351 does add `min-h-screen flex flex-col`, the root layout itself doesn't enforce this pattern, and there is no footer element at all.

### [FINDING] Loading spinner uses custom CSS spinner instead of brandkit Loader2 pattern - /home/z/my-project/src/app/page.tsx - Lines 67-76

The brandkit specifies full-page loading state should use `Loader2` icon from Lucide with `size-8 animate-spin text-primary`. The `LoadingSpinner` component (line 71) instead uses a custom CSS border spinner with `border-blue-200 dark:border-blue-800 border-t-blue-600` — hardcoded blue colors and a non-standard pattern.

### [FINDING] Sidebar user info section uses blue as decorative gradient - /home/z/my-project/src/app/page.tsx - Line 105

The brandkit states: "NO indigo or blue colors as decorative (only interactive)." The sidebar user info box (line 105) uses `bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50` — a decorative blue gradient on a non-interactive information display.

### [FINDING] `ROLE_COLORS` in types.ts uses forbidden purple and emerald, no dark mode, wrong text shade - /home/z/my-project/src/lib/types.ts - Lines 139-145

The `ROLE_COLORS` map uses `purple-100/purple-800` for agency_admin and agency_member (purple is forbidden), `emerald-100/emerald-800` for fira (emerald is forbidden, should use green), `blue-100/text-blue-800` for applicant (wrong text shade, should be -700, no dark mode variants), and `amber-100/amber-800` for employer (wrong text shade, should be -700, no dark mode variants). Although currently unused, this is a status-like color map that would produce violations if imported.

### [FINDING] `pending_fira_review` in status.ts mapped to amber but brandkit specifies blue - /home/z/my-project/src/lib/status.ts - Lines 89-91

The existing finding about status.ts mentions forbidden colors but misses that `pending_fira_review` is mapped to `amber-100/amber-700` while the brandkit explicitly maps it to `blue-100/blue-700 (info)`. Same issue applies to `pending_employer_review` (lines 119-121) which also uses amber but brandkit says blue.

### [FINDING] GlassCard component is a reusable glassmorphism primitive used outside allowed contexts - /home/z/my-project/src/components/shared/glass-card.tsx - Lines 13-14

The brandkit restricts glassmorphism (backdrop-blur) to ONLY: navigation bar, hero sections, landing page stat cards, and feature highlight cards on colorful backgrounds. The `GlassCard` component (line 14) applies `bg-card/80 backdrop-blur-sm` as a generic reusable component. It is used in `dashboard/agency-dashboard.tsx` and `dashboard/fira-dashboard.tsx` — both dashboard contexts where glassmorphism is explicitly forbidden.

### [FINDING] Auth modal DialogTitle and buttons use emerald (forbidden) - /home/z/my-project/src/components/shared/auth-modal.tsx - Lines 91, 134, 231

Line 91: `DialogTitle` uses `text-emerald-700` — emerald is a forbidden color. DialogTitle should use `text-foreground`. Lines 134 and 231: Login and register submit buttons use `bg-emerald-600 hover:bg-emerald-700` — emerald is forbidden. Should use `bg-primary hover:bg-primary/90`.

### [FINDING] Accessibility toolbar panel uses `rounded-2xl` instead of `rounded-xl` or `rounded-md` - /home/z/my-project/src/components/shared/accessibility-toolbar.tsx - Lines 160-161

The brandkit specifies Dialog/Modal: `rounded-xl`, Dropdown/Popover: `rounded-md`. The accessibility panel (line 160) is a popover-like overlay but uses `rounded-2xl`. The sticky header (line 161) also uses `rounded-t-2xl`. Additionally, multiple toggle buttons (lines 19, 55, 59) and container divs (lines 47, 185, 200) use `rounded-lg` instead of the brandkit's `rounded-md` for buttons.

### [FINDING] Widespread use of emerald (forbidden) across 10+ component files for buttons, stat icons, badges, avatars, alerts, and borders - /home/z/my-project/src/components/ (multiple) - Various lines

The brandkit explicitly forbids emerald for status/decorative use (should use green). The following files use emerald where green is required:
- `agency/agency-dashboard.tsx` lines 137, 151, 175, 184, 252, 266, 334 (visibility color, buttons, stat icons, dialog title, badge)
- `agency/agency-pipeline.tsx` lines 69-70, 118-119 (job and applicant avatars)
- `fira/fira-agencies.tsx` line 61 (approve button)
- `fira/fira-employers.tsx` line 61 (approve button)
- `fira/fira-matching.tsx` lines 49-50, 55-56, 77-78, 90, 93-94 (score colors, stat icon, button, ring, avatar)
- `fira/fira-dashboard.tsx` lines 65, 91, 92, 124, 148 (badge, stat icons, buttons)
- `applicant/applicant-jobs.tsx` line 151 (apply button)
- `applicant/applicant-profile.tsx` lines 110, 149, 215, 226, 229, 241 (section icons, button, skill borders)
- `employer/employer-dashboard.tsx` lines 90, 122, 133-138, 143-144, 168 (stat card, ring, alerts, avatar, button)
- `shared/auth-modal.tsx` lines 91, 134, 231 (dialog title, buttons)

All `emerald-*` references should be replaced with the corresponding `green-*` shade.

### [FINDING] Widespread use of yellow (not in brandkit palette) for pending status badges - /home/z/my-project/src/components/ (multiple) - Various lines

The brandkit uses `amber` for pending/warning states, not `yellow`. Files using `yellow` for status:
- `agency/agency-endorsements.tsx` line 22 (`bg-yellow-100 text-yellow-800`)
- `fira/fira-agencies.tsx` line 60 (`bg-yellow-100 text-yellow-700`)
- `fira/fira-employers.tsx` line 60 (`bg-yellow-100 text-yellow-700`)
- `employer/employer-dashboard.tsx` lines 157, 160 (`bg-yellow-100 text-yellow-700`)
- `applicant/applicant-dashboard.tsx` line 41 (`bg-yellow-100 text-yellow-800`)

All should use `amber` instead of `yellow`.

### [FINDING] Password strength meters use forbidden orange, yellow, and emerald - /home/z/my-project/src/components/auth/auth-modal.tsx - Lines 64, 324; /home/z/my-project/src/components/shared/user-settings-page.tsx - Lines 28, 304

Both files implement password strength indicators using `bg-orange-500`/`text-orange-500` (orange is forbidden), `bg-yellow-500`/`text-yellow-600` (should be amber), and `bg-emerald-500` (should be green). Auth-modal line 64 also has a progress bar using these colors.

### [FINDING] Purple used as decorative icon color in fira-employers.tsx - /home/z/my-project/src/components/fira/fira-employers.tsx - Line 52

Line 52 uses `bg-purple-100 text-purple-700` for the employer icon background. Purple is an explicitly forbidden color. This is a decorative use (not interactive), making it a double violation of the "no purple" and "no blue/purple as decorative" rules.

### [FINDING] H1 headings consistently use `text-2xl font-bold` instead of brandkit `text-4xl font-bold leading-tight tracking-tight` - /home/z/my-project/src/components/ (multiple) - Various lines

The brandkit specifies H1: `text-4xl font-bold leading-tight tracking-tight`. Nearly every page component uses `text-2xl font-bold` for H1 headings:
- `agency/agency-dashboard.tsx` lines 147, 162, 174
- `agency/agency-endorsements.tsx` line 41
- `agency/agency-pipeline.tsx` lines 60, 94
- `fira/fira-agencies.tsx` line 40
- `fira/fira-employers.tsx` line 40
- `fira/fira-matching.tsx` line 59
- `fira/fira-dashboard.tsx` lines 59, 77, 85
- `applicant/applicant-jobs.tsx` line 100
- `applicant/applicant-profile.tsx` line 146
- `employer/employer-dashboard.tsx` lines 62, 85

### [FINDING] H2 headings use wrong sizes across multiple files - /home/z/my-project/src/components/ (multiple) - Various lines

The brandkit specifies H2: `text-3xl font-semibold leading-tight`. Violations:
- `employer/employer-dashboard.tsx` line 70: `text-xl font-bold` for H2
- `employer/employer-dashboard.tsx` line 107: `text-lg font-semibold` for H2
- `page.tsx` lines 243, 261, 277: `text-2xl font-bold` for H2 in "Coming Soon" sections

### [FINDING] Stars in CMS testimonials use `yellow-400` instead of brandkit gold accent `amber-400` - /home/z/my-project/src/components/cms/cms-testimonials-page.tsx - Lines 118, 174

The brandkit specifies gold accent as `amber-700` (light) / `amber-400` (dark). The star icons use `text-yellow-400 fill-yellow-400` which is a non-standard color. Should use `text-amber-400 fill-amber-400`.

### [FINDING] Multiple files use `mr-1` or `mr-2` on icons inside Button components (additional instances) - /home/z/my-project/src/components/ (multiple) - Various lines

The existing finding covers many `mr-2` instances. Additional instances found in:
- `shared/auth-modal.tsx` lines 135, 232 (`mr-2`)
- `agency/agency-dashboard.tsx` lines 152, 176 (`mr-2`)
- `fira/fira-agencies.tsx` line 63 (`mr-1`)
- `fira/fira-employers.tsx` line 63 (`mr-1`)
- `fira/fira-matching.tsx` line 78 (`mr-2`)
- `fira/fira-dashboard.tsx` lines 124, 149, 154 (`mr-1`)
- `applicant/applicant-jobs.tsx` line 155 (`mr-1`)
- `applicant/applicant-profile.tsx` line 153 (`mr-1`)
- `employer/employer-dashboard.tsx` lines 169, 172 (`mr-2`)

### [FINDING] Non-standard button heights `min-h-[44px]` and `h-8` on sm buttons - /home/z/my-project/src/components/ (multiple) - Various lines

The brandkit defines button sizes as: sm=h-8, default=h-9, lg=h-10. Additional non-standard heights found:
- `fira/fira-matching.tsx` line 77: `min-h-[44px]`
- `applicant/applicant-jobs.tsx` line 151: `min-h-[44px]`
- `employer/employer-dashboard.tsx` lines 168, 171: `min-h-[44px]`
- `agency/agency-dashboard.tsx` line 175: `min-h-[44px]`
- `fira/fira-agencies.tsx` line 61: `h-8` with `size="sm"` (redundant, sm is already h-8)
- `fira/fira-employers.tsx` line 61: same redundant `h-8`

### [FINDING] `applicant/applicant-dashboard.tsx` inline status map uses forbidden yellow and emerald, wrong text shade - /home/z/my-project/src/components/applicant/applicant-dashboard.tsx - Line 41

Line 41 defines a status color map with: `bg-yellow-100 text-yellow-800` (yellow forbidden, should be amber, text should be -700), `bg-emerald-100 text-emerald-800` (emerald forbidden, should be green, text should be -700), `bg-gray-100 text-gray-800` (text should be -700).

### [FINDING] Empty state patterns don't match brandkit spec in several files - /home/z/my-project/src/components/ (multiple) - Various lines

The brandkit requires empty states: icon `size-12 text-muted-foreground/50`, title `text-lg font-medium text-foreground`, container `py-12`. Violations:
- `applicant/applicant-jobs.tsx` line 127: Icon `h-10 w-10 opacity-50` (wrong size, wrong opacity approach)
- `employer/employer-dashboard.tsx` line 113: Icon `h-12 w-12 opacity-50` (right size but wrong opacity — should be `text-muted-foreground/50` not `opacity-50`)
- `agency/agency-endorsements.tsx` line 46: Icon `h-12 w-12 opacity-50` (same opacity issue)
