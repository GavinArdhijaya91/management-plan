# Siapin Design System & Responsive Implementation

## 🎨 Design Overview

**Siapin** adalah platform manajemen bisnis untuk UMKM dengan filosofi: *"Siapin dulu rencananya, baru dijalankan"*

### Key Design Principles

- **Clean Card Layout**: Semua informasi dipisah dalam kartu-kartu modular dengan border halus dan shadow yang konsisten
- **Anti-Trading Look**: Menggunakan grafik batang dan garis halus, bukan candlestick atau visual yang kompleks
- **Professional & Approachable**: Desain yang elegan tapi mudah digunakan untuk pengguna non-teknis
- **Fully Responsive**: Mobile-first design yang bekerja sempurna di desktop, tablet, dan smartphone

---

## 🎯 Color Palette

Siapin menggunakan 4 warna utama dengan semantic meaning:

| Warna | Hex | Penggunaan | Contoh |
|-------|-----|-----------|---------|
| **Primary Blue** | #2563EB | Navigasi, CTA, brand elements | Tombol "Mulai", aktif menu |
| **Neutral White** | #FFFFFF | Background, card backgrounds | Main background, card surfaces |
| **Neutral Gray** | #F8F9FA, #F1F5F9 | Light backgrounds, container | Card backgrounds, section backgrounds |
| **Dark Text** | #0F172A | Heading, important text | Judul, teks utama |
| **Secondary Text** | #475569 | Deskripsi, secondary info | Paragraf, subtitle |
| **Success Green** | #10B981 | Status positif, badges | "Untung", "Aman", "Tercapai" |
| **Warning Red** | #EF4444 | Status negatif, alerts | "Rugi", "Urgent", errors |
| **Warning Orange** | #F59E0B | Attention, caution | "Warning" badges |

---

## 📐 Typography

- **Heading Font**: Default sans-serif (Geist via Next.js)
- **Body Font**: Default sans-serif (Geist via Next.js)
- **Line Height**: 1.5 untuk readability optimal
- **Font Sizes**:
  - H1: 28-32px (mobile-first, scales up to 36px on desktop)
  - H2: 20-24px
  - H3: 16-18px
  - Body: 14-16px
  - Small: 12-13px

---

## 🎨 Responsive Design Breakpoints

```
Mobile-first approach:
- Mobile: 375px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+
```

### Tailwind Breakpoints Used:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## 📱 Layout Components

### KPI Cards (Dashboard)
**Desktop**: 4 columns grid
**Mobile**: 1 column stack

```jsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
```

### Chart Section
**Desktop**: Chart + Sidebar (2/3 + 1/3)
**Mobile**: Full width stacked

```jsx
className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
```

### Table/Transaction List
**Desktop**: Full table with all columns
**Mobile**: Essential columns only, horizontal scroll

```jsx
className="overflow-x-auto"  // Enables scroll on mobile
```

### Header
**Desktop**: Full navigation menu visible
**Mobile**: Hamburger menu with collapsible nav

```jsx
className="hidden md:flex"  // Desktop only
className="md:hidden"       // Mobile only
```

---

## 🧩 Component Classes & Patterns

### Card Components
All card surfaces use the base card style:
```html
<div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
```

### Button Styles
Primary Action Buttons:
```html
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
```

### Status Badges
Success:
```html
<span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
```

Danger:
```html
<span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
```

---

## 📄 Page Structure

### 1. **Landing Page** (`/`)
- Hero section with value proposition
- Features grid (6 features in 3 columns)
- CTA section with email signup
- Footer with links

**Responsive Behavior**:
- Hero heading: Single line on mobile → two lines on desktop
- Features: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- CTA form: Stacked (mobile) → inline (desktop)

### 2. **Dashboard** (`/dashboard`)
- KPI Cards (4 cards showing key metrics)
- Sales Chart (bar chart with 4-week data)
- Quick Insights (3 insight cards)
- Weekly Tasks & Status Summary

**Responsive Behavior**:
- KPI: 1 column → 2 columns → 4 columns
- Main content: Full width → 2/3 + 1/3 sidebar on desktop
- Chart: Responsive container with fixed height

### 3. **Manajemen** (`/manajemen`)
- Summary cards (3 metrics)
- Search & Filter section
- Transaction table (sortable, editable)

**Responsive Behavior**:
- Summary cards: 1 column → 1 column → 3 columns
- Table: Horizontal scroll on mobile, full table on desktop
- Mobile hides: Modal column, Profit/Loss column (shown on hover)

### 4. **Kalender** (`/kalender`)
- Interactive calendar (left side)
- Event sidebar (right side)
- Upcoming events list (full width)

**Responsive Behavior**:
- Calendar: 2 columns (desktop) → 1 column (mobile with tabs)
- Navigation preserved for responsive

### 5. **Tren Pasar** (`/tren-pasar`)
- Line chart (6-month trend)
- Insight cards (3 recommendations)
- Product trends table

**Responsive Behavior**:
- Insights: 1 column → 3 columns
- Table: Horizontal scroll on mobile

### 6. **Hubungi Kami** (`/hubungi-kami`)
- Contact methods (3 cards)
- Contact form (2/3 width) + FAQ sidebar (1/3 width)

**Responsive Behavior**:
- Contact cards: 1 column → 3 columns
- Form & FAQ: 1 column (mobile) → 2 columns (desktop)

---

## 🎨 Editing in Figma

### How to Export from v0 to Figma

1. **Take Screenshots**:
   - Desktop version (1920x1080): Full page screenshot
   - Mobile version (375x667): Full page screenshot
   - Tablet version (768x1024): For completeness

2. **Import to Figma**:
   - Create new Figma file: "Siapin Design System"
   - File → Import → Upload screenshots
   - Create artboards for each page (Desktop, Mobile, Tablet)

3. **Create Components**:
   - Card Component: Use base card style as component
   - Button Variants: Primary, Secondary, Disabled
   - Badge Variants: Success, Danger, Warning, Normal
   - KPI Card: Create reusable component

4. **Build Design Tokens**:
   - Colors: Create color styles (Primary Blue, Text Dark, etc.)
   - Typography: Create text styles (H1, H2, Body, Small)
   - Spacing: Document spacing scale (4px, 8px, 12px, 16px, etc.)
   - Shadows: Card shadow, hover shadow

5. **Create Layout Grid**:
   - 12-column grid for desktop
   - 6-column grid for tablet
   - 4-column grid for mobile
   - 16px gutter spacing

### Figma File Structure Recommendation

```
Siapin Design System
├── 🎨 Design Tokens
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   └── Shadows
├── 📦 Components
│   ├── Cards
│   ├── Buttons
│   ├── Badges
│   ├── Headers
│   └── Charts
├── 📱 Pages
│   ├── Landing (Desktop)
│   ├── Landing (Mobile)
│   ├── Dashboard (Desktop)
│   ├── Dashboard (Mobile)
│   ├── Manajemen (Desktop)
│   ├── Manajemen (Mobile)
│   └── ... (other pages)
└── 📐 Spacing Reference
```

---

## 🔧 Key CSS Classes (Tailwind)

### Responsive Utilities Used

```css
/* Display */
.hidden.md:flex        /* Show on desktop, hide on mobile */
.md:hidden             /* Hide on desktop, show on mobile */

/* Grid */
.grid-cols-1           /* 1 column (mobile) */
.sm:grid-cols-2        /* 2 columns (tablet) */
.lg:grid-cols-3        /* 3 columns (desktop) */
.lg:grid-cols-4        /* 4 columns (desktop wide) */

/* Sizing */
.md:p-6                /* Padding: 16px (mobile), 24px (desktop) */
.text-2xl.md:text-3xl  /* Font size: mobile → desktop */

/* Gaps */
.gap-4.md:gap-6        /* Gap: 16px (mobile), 24px (desktop) */
```

---

## 📊 Design Specifications by Page

### Landing Page
- **Hero Title**: Max-width 56rem (896px), centered
- **Features Grid**: 6 items, 1 column mobile → 2 columns tablet → 3 columns desktop
- **Footer**: Dark gray (#1F2937) background
- **CTA Section**: Gradient blue background with form

### Dashboard
- **Header**: Sticky, white background with bottom border
- **KPI Cards**: Shadow on hover for interactivity
- **Chart Container**: Height: 320px (fixed)
- **Sidebar**: Width 100% (mobile) → 33.33% (desktop)
- **Status Badges**: Inline with icon

### Manajemen
- **Search Bar**: Full width mobile → flex layout desktop
- **Table**: Min-width 800px, horizontal scroll on mobile
- **Row Height**: 56px (desktop), 48px (mobile)
- **Action Buttons**: Icon buttons with 16px icons

### Kalender
- **Calendar**: 7 columns (days of week)
- **Day Cell**: Aspect-square for responsive sizing
- **Event Sidebar**: Width 100% (mobile) → 33.33% (desktop)

---

## 🚀 Implementation Notes

### Performance Considerations
- Charts use Recharts for efficient rendering
- Lazy load images for landing page
- Use CSS transitions, not animations (better performance)
- Shadow on hover uses `transition-shadow`

### Accessibility
- All buttons have proper `aria-labels` where needed
- Color is not the only indicator (icons + text for status)
- Font sizes meet minimum 14px for body text
- Heading hierarchy properly maintained (H1 → H2 → H3)

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Uses CSS Grid and Flexbox (widely supported)

---

## 📝 Next Steps for Figma Design

1. Export all pages as high-resolution screenshots
2. Import to Figma as base
3. Create design tokens in Figma
4. Build component library with variations
5. Create design system file for handoff to developers
6. Document all responsive breakpoints
7. Create component guidelines document

---

## 🔗 Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Recharts**: https://recharts.org/
- **Next.js**: https://nextjs.org/docs
- **Responsive Design**: https://web.dev/responsive-web-design-basics/

---

**Last Updated**: July 20, 2026
**Version**: 1.0
