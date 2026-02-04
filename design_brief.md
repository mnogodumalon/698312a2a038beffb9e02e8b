# Design Brief: Test-Management Dashboard

## 1. App Analysis

### What This App Does
This is a QA/Test Management system for tracking software testing activities. It manages test projects, defines test cases within those projects, and records the execution results of each test run. The workflow flows from Projects → Test Cases → Test Executions, allowing teams to track testing progress, identify failing tests, and measure overall test quality.

### Who Uses This
QA Engineers, Test Managers, and Development Team Leads who need to monitor testing progress, quickly identify which tests are failing, and track overall test coverage and quality metrics across their projects.

### The ONE Thing Users Care About Most
**Test Pass Rate** - The percentage of tests that are passing. This immediately tells users the health of their software. A dropping pass rate signals problems; a high pass rate signals confidence for release.

### Primary Actions (IMPORTANT!)
1. **Testausführung erfassen** → Primary Action Button (logging a new test execution is the most frequent action)
2. View failing tests to investigate issues
3. Check project-level test coverage

---

## 2. What Makes This Design Distinctive

### Visual Identity
This dashboard embraces a **"command center" aesthetic** with a cool, technical feel that resonates with QA professionals. The slate-blue color palette conveys precision and reliability - qualities essential to testing work. The design uses strong visual indicators for test status (green/red/amber) against a calm neutral background, making pass/fail status instantly recognizable without overwhelming the eye. The overall feeling is professional, data-driven, and confidence-inspiring.

### Layout Strategy
- **Hero element: Test Pass Rate** dominates the top with a large percentage display and a circular progress ring, creating immediate visual impact and answering "how healthy is our testing?" at a glance
- **Asymmetric layout on desktop**: The pass rate hero and trend chart take the left 2/3, while recent executions list takes the right 1/3, creating visual flow from metrics → details
- **Size variation creates hierarchy**: The hero percentage (72px) dwarfs secondary KPIs (24px), making importance crystal clear
- **Status colors are semantic**: Green (bestanden), Red (fehlgeschlagen), Amber (blockiert) - universally understood by QA professionals

### Unique Element
The **circular progress ring** around the pass rate percentage uses a thick 10px stroke with a gradient from slate-400 to emerald-500 based on the percentage. The ring animates on load, filling to the current pass rate. The background ring is a subtle slate-200 dashed pattern, creating depth. This element makes the most critical metric feel dynamic and engaging, almost game-like in its visual feedback.

---

## 3. Theme & Colors

### Font
- **Family:** Space Grotesk
- **URL:** `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap`
- **Why this font:** Space Grotesk is technical and modern without being cold. Its geometric forms suit data/analytics dashboards, while its subtle quirks (like the distinctive 'a' and 'g') add personality. The wide range of weights (300-700) enables strong typographic hierarchy.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(210 20% 98%)` | `--background` |
| Main text | `hsl(215 25% 17%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(215 25% 17%)` | `--card-foreground` |
| Borders | `hsl(214 20% 90%)` | `--border` |
| Primary action | `hsl(215 70% 45%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(215 50% 95%)` | `--accent` |
| Muted background | `hsl(210 15% 96%)` | `--muted` |
| Muted text | `hsl(215 15% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(152 60% 40%)` | (component use) |
| Error/negative | `hsl(0 70% 50%)` | `--destructive` |
| Warning/blocked | `hsl(38 90% 50%)` | (component use) |

### Why These Colors
The cool slate-blue base creates a calm, focused environment perfect for analytical work. The muted background (`hsl(210 20% 98%)`) has a subtle blue undertone that feels more refined than pure white. The primary blue (`hsl(215 70% 45%)`) is confident and action-oriented without being aggressive. The semantic status colors (green/red/amber) pop against this neutral backdrop, ensuring test results are instantly visible.

### Background Treatment
The page background uses a subtle **dot pattern** created with CSS radial gradients - tiny slate-300 dots at 20px intervals. This adds texture without distraction and reinforces the technical/precision theme. Cards sit on top with pure white backgrounds and subtle shadows, creating clear visual separation.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
The mobile layout is a focused, vertical scroll experience. The hero pass rate dominates the first viewport (approximately 50% of screen height), making the most important metric impossible to miss. Secondary elements stack below with clear visual separation. Status cards use color-coded left borders for quick scanning.

### What Users See (Top to Bottom)

**Header:**
- Left: "Test Dashboard" title in Space Grotesk 600 weight, 18px
- Right: Primary action button (icon only on mobile) - a "+" icon to add test execution
- Background: Transparent, blends with page background
- Height: 56px

**Hero Section (The FIRST thing users see):**
- **Content:** Test Pass Rate as large percentage with circular progress ring
- **Size:** Takes ~50% of viewport height (roughly 350px)
- **Layout:** Centered vertically and horizontally
  - Circular progress ring: 200px diameter, 10px stroke
  - Percentage inside ring: 72px font, 700 weight
  - Label below ring: "Erfolgsrate" in 14px, muted text
  - Below label: "X von Y Tests bestanden" in 12px
- **Styling:** The ring uses gradient stroke (slate-400 → emerald-500 based on %). Background ring is dashed slate-200
- **Why hero:** This single number tells users immediately if their software is healthy. 95%+ = confidence, <80% = concern

**Section 2: Status Summary (Horizontal scroll)**
- 3 compact stat cards in horizontal scroll container
- Each card: 100px wide, showing count and label
  - Bestanden (green left border): count of passed
  - Fehlgeschlagen (red left border): count of failed
  - Blockiert (amber left border): count of blocked
- Cards have 8px gap, container has horizontal padding allowing peek of next card
- Tap on any card filters the list below to that status

**Section 3: Active Projects**
- Section header: "Aktive Projekte" with count badge
- Horizontal scroll of project cards (140px wide each)
- Each card shows: Project name (truncated), status badge, test count
- Card style: white background, subtle shadow, 12px border-radius

**Section 4: Recent Executions**
- Section header: "Letzte Testläufe"
- Vertical list of test execution cards
- Each card shows:
  - Test case title (bold, truncated single line)
  - Project name (muted, small)
  - Status badge (pill style with color)
  - Relative time (e.g., "vor 2 Stunden")
- Sorted by execution time, newest first
- Shows last 10 executions
- Full-width cards with 12px border-radius

**Bottom Navigation / Action:**
- Fixed bottom button: "Testausführung erfassen"
- Full width minus 16px padding on each side
- 48px height, primary color background
- Icon (clipboard-check) + text

### Mobile-Specific Adaptations
- Chart is hidden on mobile (trend data is less actionable on small screen, and the hero metric provides the key insight)
- Project cards become horizontal scroll instead of grid
- Status summary becomes horizontal scroll instead of row
- Test execution cards are simplified (fewer fields shown)

### Touch Targets
- All tappable elements minimum 44px touch target
- Cards have subtle active state (scale 0.98 + shadow reduction)
- Status filter cards have clear selected state (darker border + background tint)

### Interactive Elements
- Tapping a test execution card could show full details in a bottom sheet (optional enhancement)
- Status cards act as filters for the execution list

---

## 5. Desktop Layout

### Overall Structure
**Two-column asymmetric layout** with 2:1 ratio (roughly 66% / 34%)

- **Left column (main):** Hero metrics + trend chart
- **Right column (sidebar):** Recent activity feed + quick filters

The eye flows: Hero pass rate (top-left) → Status breakdown (below hero) → Trend chart (center-left) → Recent executions (right column)

### Section Layout

**Top Bar (full width):**
- Left: "Test-Management Dashboard" title, 24px, 600 weight
- Right: Primary action button "Testausführung erfassen" with icon, date range selector (optional)
- Height: 64px
- Background: transparent

**Left Column - Top (Hero Area):**
- Pass Rate Ring: 240px diameter, centered in a card that spans full column width
- To the right of ring within same card: 3 vertical stat items (Bestanden / Fehlgeschlagen / Blockiert counts)
- Card has 24px padding, subtle shadow

**Left Column - Middle (Project Cards):**
- Section header: "Projekte" with count
- Grid of 3 project cards in a row
- Each card: Project name, status badge, stats (test cases count, last run date)
- Cards: white, 16px border-radius, subtle hover shadow animation

**Left Column - Bottom (Trend Chart):**
- Line chart showing pass rate over time (last 30 days)
- X-axis: dates
- Y-axis: pass rate percentage
- Single line with area fill (gradient from primary-100 to transparent)
- Chart title: "Erfolgsrate Trend"
- Card wrapper with 24px padding

**Right Column - Full Height:**
- Section header: "Letzte Testläufe"
- Filter tabs: Alle / Fehlgeschlagen / Blockiert
- Scrollable list of recent executions (max height with scroll)
- Each item: compact card style
  - Test name (bold)
  - Project name (muted)
  - Status pill
  - Tester name
  - Relative timestamp
- Shows last 20 executions

### What Appears on Hover
- Project cards: Slight elevation increase (shadow grows), show "Details ansehen" text overlay
- Execution list items: Background tint to accent color
- Chart data points: Tooltip showing exact date and percentage
- Action buttons: Darken primary color by 10%

### Clickable/Interactive Areas
- Project cards: Click to filter executions by project (future enhancement)
- Status pills in hero: Click to filter execution list by status
- Execution items: Click to expand inline showing full details (actual result, notes)

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Erfolgsrate (Pass Rate)
- **Data source:** Testausführungen app
- **Calculation:** (Count where status = "bestanden") / (Total count) × 100, rounded to 1 decimal
- **Display:** Large percentage (72px mobile, 96px desktop) inside a circular progress ring
- **Context shown:**
  - Below percentage: "X von Y Tests bestanden"
  - Ring fill percentage matches the value
  - Color shifts: >90% emerald, 70-90% yellow-green, <70% amber-red
- **Why this is the hero:** Pass rate is the universal metric for test health. It's the first question any stakeholder asks: "Are our tests passing?"

### Secondary KPIs

**Bestanden (Passed)**
- Source: Testausführungen
- Calculation: Count where status = "bestanden"
- Format: Integer
- Display: Card with green left border, number + label stacked
- Color: `hsl(152 60% 40%)` for the number

**Fehlgeschlagen (Failed)**
- Source: Testausführungen
- Calculation: Count where status = "fehlgeschlagen"
- Format: Integer
- Display: Card with red left border, number + label stacked
- Color: `hsl(0 70% 50%)` for the number

**Blockiert (Blocked)**
- Source: Testausführungen
- Calculation: Count where status = "blockiert"
- Format: Integer
- Display: Card with amber left border, number + label stacked
- Color: `hsl(38 90% 50%)` for the number

**Testfälle Gesamt (Total Test Cases)**
- Source: Testfälle
- Calculation: Total count
- Format: Integer
- Display: Inline text in header area (desktop only)

### Chart

- **Type:** Area chart with line - area fills communicate volume/progress better than bare line
- **Title:** Erfolgsrate Trend (Pass Rate Trend)
- **What question it answers:** "Is our test health improving or declining over time?"
- **Data source:** Testausführungen, grouped by date
- **X-axis:** Date (last 30 days with data), formatted as "DD.MM"
- **Y-axis:** Pass rate percentage (0-100%)
- **Line color:** Primary blue
- **Area fill:** Gradient from primary-200 (top) to transparent (bottom)
- **Mobile simplification:** Hidden on mobile (space constraints, hero metric suffices)

### Lists/Tables

**Recent Executions List**
- Purpose: Shows latest test activity so users can spot recent failures immediately
- Source: Testausführungen
- Fields shown:
  - Test case title (via applookup to Testfälle)
  - Project name (via applookup chain to Testprojekte)
  - Status (as colored pill badge)
  - Tester name (combined first + last)
  - Execution timestamp (relative format: "vor X Stunden/Tagen")
- Mobile style: Full-width cards with stacked layout
- Desktop style: Compact cards in scrollable list
- Sort: By ausfuehrungszeitpunkt descending (newest first)
- Limit: 10 on mobile, 20 on desktop

**Projects Overview**
- Purpose: Quick access to project-level view
- Source: Testprojekte
- Fields shown:
  - Project name
  - Status badge
  - Count of test cases (via relationship)
  - Start date (formatted as "DD.MM.YYYY")
- Mobile style: Horizontal scroll cards
- Desktop style: Grid of cards (3 columns)
- Sort: By status (In Bearbeitung first), then by startdatum
- Limit: All active projects (status != "Abgeschlossen")

### Primary Action Button (REQUIRED!)

- **Label:** "Testausführung erfassen" (desktop), "+" icon with tooltip (mobile header), "Testausführung erfassen" (mobile bottom fixed)
- **Action:** add_record
- **Target app:** Testausführungen (app_id: 69831276eb4690de26587cf0)
- **What data:** Form with fields:
  - Testfall (select from Testfälle)
  - Status (radio: Bestanden / Fehlgeschlagen / Blockiert)
  - Tatsächliches Ergebnis (textarea)
  - Anmerkungen (textarea, optional)
  - Tester Vorname + Nachname (auto-filled if known, else text inputs)
  - Ausführungszeitpunkt (auto-set to now, but editable)
- **Mobile position:** bottom_fixed (full-width button at bottom of screen)
- **Desktop position:** header (right side of top bar)
- **Why this action:** Recording test results is the core workflow. Testers run tests and need to log results quickly. This should be 1-tap away at all times.

---

## 7. Visual Details

### Border Radius
- Cards: 16px (rounded, modern feel)
- Buttons: 8px (slightly rounded, not pill)
- Badges/Pills: 9999px (full pill shape for status indicators)
- Input fields: 8px

### Shadows
- Cards: `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` (subtle elevation)
- Cards on hover (desktop): `0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` (elevated)
- Modals/Sheets: `0 10px 40px rgba(0,0,0,0.15)` (prominent)

### Spacing
- **Spacious** overall with generous whitespace
- Page padding: 16px (mobile), 32px (desktop)
- Card internal padding: 16px (mobile), 24px (desktop)
- Section gaps: 24px (mobile), 32px (desktop)
- Element gaps within cards: 12px

### Animations
- **Page load:** Staggered fade-in for cards (100ms delay between each)
- **Progress ring:** Animated fill on load (800ms ease-out from 0 to actual value)
- **Hover effects:**
  - Cards: 200ms transition for shadow and transform
  - Buttons: 150ms transition for background color
- **Tap feedback:** Scale to 0.98 with 100ms duration on touchstart

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

:root {
  --background: hsl(210 20% 98%);
  --foreground: hsl(215 25% 17%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(215 25% 17%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(215 25% 17%);
  --primary: hsl(215 70% 45%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(210 15% 96%);
  --secondary-foreground: hsl(215 25% 17%);
  --muted: hsl(210 15% 96%);
  --muted-foreground: hsl(215 15% 50%);
  --accent: hsl(215 50% 95%);
  --accent-foreground: hsl(215 25% 17%);
  --destructive: hsl(0 70% 50%);
  --border: hsl(214 20% 90%);
  --input: hsl(214 20% 90%);
  --ring: hsl(215 70% 45%);
  --radius: 16px;

  /* Custom status colors */
  --status-passed: hsl(152 60% 40%);
  --status-failed: hsl(0 70% 50%);
  --status-blocked: hsl(38 90% 50%);
}

body {
  font-family: 'Space Grotesk', sans-serif;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from Google Fonts URL above (Space Grotesk)
- [ ] All CSS variables copied exactly including custom status colors
- [ ] Mobile layout matches Section 4 (hero dominant, horizontal scroll for stats)
- [ ] Desktop layout matches Section 5 (2:1 asymmetric columns)
- [ ] Hero pass rate with progress ring is prominent as described
- [ ] Colors create the cool, technical mood described in Section 2
- [ ] Status colors (green/red/amber) are consistent throughout
- [ ] Primary action button is always visible (header on desktop, fixed bottom on mobile)
- [ ] Animations implemented (progress ring fill, card hover, staggered load)
- [ ] Spacing is generous/spacious as specified
- [ ] Border radius consistent (16px cards, 8px buttons, pill badges)
