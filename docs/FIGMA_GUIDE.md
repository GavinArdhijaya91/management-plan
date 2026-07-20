# Siapin × Figma: Design Export & Editing Guide

## 📸 Screenshots Available

All responsive screenshots have been captured and are ready for Figma import:

### Landing Page
- `desktop-landing.png` - 1920×1080 desktop view
- `mobile-landing.png` - 375×667 mobile view

### Dashboard
- `desktop-dashboard.png` - 1920×1080 desktop view with all KPI cards, chart, and insights
- `mobile-dashboard.png` - 375×667 mobile view with stacked cards

### Manajemen (Transactions)
- `desktop-manajemen.png` - 1920×1080 desktop with full transaction table
- `mobile-manajemen.png` - 375×667 mobile with optimized table

### Kalender (Calendar)
- `desktop-kalender.png` - 1920×1080 desktop with calendar and event sidebar
- `mobile-kalender.png` - 375×667 mobile with responsive calendar

---

## 🎨 How to Import Screenshots into Figma

### Step 1: Create New Figma File

1. Go to [figma.com](https://figma.com)
2. Click **"Create new file"**
3. Name it: **"Siapin Design System v1"**
4. Click **"Create"**

### Step 2: Set Up Figma Pages

In the **Pages** panel (left sidebar), create the following pages:

- 🎨 **Design System**
- 📱 **Mobile (375px)**
- 💻 **Desktop (1920px)**
- 📋 **Components**
- 📐 **Spacing & Grid**

### Step 3: Import Screenshots

For **Desktop Page**:

1. Click **Assets** (left panel) → **"Upload image"** or drag & drop
2. Drag `desktop-landing.png` onto the canvas
3. Set constraints: **Fix width and height** (1920×1080)
4. Repeat for: `desktop-dashboard.png`, `desktop-manajemen.png`, `desktop-kalender.png`
5. Position them vertically with ~20px gaps
6. Rename each layer to match the page name

For **Mobile Page**:

1. Repeat the same process
2. Upload `mobile-landing.png`, `mobile-dashboard.png`, etc.
3. Set constraints: **Fix width and height** (375×667)
4. Position vertically on the canvas

### Step 4: Create Design Tokens

On the **Design System** page:

#### Color Library

Create a **colors section** with these colors (use **Fill** tool):

```
Primary Blue:
- Background: #2563EB
- Hover: #1D4ED8
- Light (KPI bg): #EBF8FF or bg-blue-50

Neutral:
- White: #FFFFFF
- Background Light: #F8F9FA
- Border: #E5E7EB
- Text Dark: #0F172A
- Text Gray: #475569

Status:
- Success: #10B981
- Success Light: #F0FDF4
- Error: #EF4444
- Error Light: #FEE2E2
- Warning: #F59E0B
- Warning Light: #FFFBEB
```

#### Typography Styles

Create **text styles** for:

- **H1**: 32px, 700 weight, line-height 1.2
- **H2**: 24px, 700 weight, line-height 1.3
- **H3**: 18px, 600 weight, line-height 1.4
- **Body**: 16px, 400 weight, line-height 1.5
- **Body Small**: 14px, 400 weight, line-height 1.5
- **Label**: 12px, 500 weight, line-height 1.5

#### Spacing Scale

Create a reference with these spacing values:

```
xs: 4px
sm: 8px
md: 12px
base: 16px
lg: 24px
xl: 32px
2xl: 48px
```

#### Shadows

Create shadow styles:

```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.07)
hover: 0 10px 15px rgba(0,0,0,0.1)
```

---

## 🧩 Creating Reusable Components

On the **Components** page, create these component library items:

### Button Component

1. Draw a rectangle (px-4 py-2 = 64×40px minimum)
2. Fill: **Primary Blue (#2563EB)**
3. Corner radius: 8px
4. Add text layer: "Button" (white, 16px, 600 weight)
5. Group both (Cmd+G)
6. Right-click → **"Create component"**
7. Name: `Button / Primary`

**Create variants**:

- `Button / Primary` (normal state)
- `Button / Primary / Hover` (darker blue #1D4ED8)
- `Button / Secondary` (white bg, blue border, blue text)
- `Button / Disabled` (gray bg, gray text)

### KPI Card Component

1. Draw a rectangle (320×160px)
2. Fill: White
3. Border: 1px #E5E7EB
4. Corner radius: 8px
5. Shadow: **sm** (0 1px 2px)
6. Add layers:
   - Title text layer
   - Value text layer (larger font)
   - Icon placeholder (48×48px circle, light blue bg)
   - Optional: Trend indicator (green/red)
7. Group and create component: `Card / KPI`

### Badge Components

Create 4 variants:

- `Badge / Success`: bg-emerald-100, text-emerald-700
- `Badge / Error`: bg-red-100, text-red-700
- `Badge / Warning`: bg-yellow-100, text-yellow-700
- `Badge / Neutral`: bg-gray-100, text-gray-700

Each: 12px font, px-3 py-1, rounded-full

### Status Indicator

Create as icon + text combo:

- Success (green checkmark + text)
- Error (red X + text)
- Warning (orange alert + text)

---

## 📐 Grid & Layout Guide

Create layout guides on the **Spacing & Grid** page:

### Desktop Grid (1920px)

1. Create artboard: 1920×1080
2. **Show layout grid**:
   - Grid columns: 12
   - Column width: 160px
   - Gutter: 16px
   - Offset: 0
3. Annotate with measurements

### Tablet Grid (768px)

1. Create artboard: 768×1024
2. Grid columns: 6
3. Column width: 128px
4. Gutter: 16px

### Mobile Grid (375px)

1. Create artboard: 375×667
2. Grid columns: 1
3. Padding left/right: 16px
4. Full-width content

### Spacing Reference

Create visual guides showing:

- Padding: 16px, 24px, 32px
- Gap: 16px (between elements)
- Margin: 32px (between sections)
- Line height: 1.5x for body
- Letter spacing: normal

---

## 🎨 Design System Documentation

Create a **Design Notes** page in Figma with:

### Color Usage Guidelines

```
Primary Blue (#2563EB):
- Button CTAs
- Active navigation
- Links
- Key metrics highlights
✓ Good contrast with white

Success Green (#10B981):
- Positive status badges
- "Untung" (Profit) indicators
- Achievement indicators

Error Red (#EF4444):
- Negative status badges
- "Rugi" (Loss) indicators
- Alerts and warnings

Warning Orange (#F59E0B):
- Caution badges
- "Stok Menipis" indicators
```

### Typography Guidelines

```
Headings (H1-H3):
- Use for page titles, section headers
- Max line length: ~50 characters
- Line height: 1.2

Body Text:
- 16px for comfortable reading
- Line height: 1.5
- Max line length: ~70 characters
- Color: #0F172A (dark text)

Secondary Text:
- 14px or 12px
- Color: #475569 (gray text)
- Use for descriptions, labels, metadata
```

### Spacing Guidelines

```
Page padding: 24px (mobile), 32px (desktop)
Component gap: 16px
Card padding: 16px (mobile), 24px (desktop)
Border radius: 8px for most elements
Shadow: Always subtle (sm or md)
```

### Component States

For each interactive component, show:

- **Resting state**: Default appearance
- **Hover state**: Slightly darker/lighter
- **Active state**: Different color (usually primary blue)
- **Disabled state**: Grayed out, cursor not-allowed
- **Loading state**: Spinner or skeleton

---

## 🔄 Responsive Design Patterns

Document these patterns on a **Responsive Patterns** page:

### Pattern 1: Card Grid
```
Desktop: 4 columns (280px each)
Tablet: 2 columns (360px each)
Mobile: 1 column (full width - 32px padding)
Gap: 16px consistent across all sizes
```

### Pattern 2: Sidebar Layout
```
Desktop: Main (66.67%) + Sidebar (33.33%)
Tablet: Main (60%) + Sidebar (40%)
Mobile: Stacked (100% width each)
Gap: 24px
```

### Pattern 3: Table
```
Desktop: Full table visible, all columns
Tablet: Horizontal scroll, essential columns
Mobile: Card view or horizontal scroll with minimal columns
Row height: 56px (desktop), 48px (mobile)
```

### Pattern 4: Navigation
```
Desktop: Horizontal navbar, all links visible
Tablet: Horizontal navbar with abbreviated text
Mobile: Hamburger menu, collapsible
Height: 64px (consistent)
```

---

## 📋 Checklist for Figma Handoff

Before sharing your Figma file:

- ✅ All colors have consistent naming
- ✅ All text uses predefined text styles
- ✅ All components are properly grouped
- ✅ Component instances are used (not duplicates)
- ✅ Padding/margins are clearly documented
- ✅ Responsive breakpoints are marked (375, 768, 1920)
- ✅ All layers are properly named
- ✅ Unused layers are deleted
- ✅ Design system colors are created
- ✅ Spacing grid is documented
- ✅ Typography scale is documented
- ✅ Component variations are all created
- ✅ Interactions are documented (hover, active, etc)
- ✅ Ready for developer handoff

---

## 🚀 Sharing with Developers

### Export Components for Dev

1. Select component
2. Right-click → **"Get link"**
3. Share the link with your dev team
4. Developers can see exact specs:
   - Dimensions
   - Colors (RGB/HEX)
   - Typography (font size, weight, line-height)
   - Spacing (padding, margin, gap)
   - Corner radius
   - Shadows

### Export Specifications

For detailed specs, select a frame and:

1. Right-click → **"Inspect"** (or use **Cmd+Option+I**)
2. Shows all CSS-ready values
3. Copy color codes, spacing, sizes
4. Developers can paste directly into code

---

## 💡 Tips for Maintaining Design Consistency

1. **Use the Figma library feature** to sync components across files
2. **Create design tokens** for every reusable value
3. **Document all interactive states** (hover, active, disabled, loading)
4. **Test responsive designs** by resizing frames
5. **Version your design file** (v1, v2, etc) for tracking changes
6. **Add developer comments** on complex components
7. **Keep a change log** documenting design iterations

---

## 🔗 Useful Figma Plugins for Design Systems

Consider installing these plugins:

1. **Typescales Generator**: Create font scales automatically
2. **Color2Code**: Convert colors to CSS
3. **ComponentKit**: Better component organization
4. **Figma to Code**: Export to HTML/CSS/React
5. **Master**: Create master components library

---

## 📞 Questions or Issues?

Reference this guide or check:

- **DESIGN_SYSTEM.md**: Detailed design specifications
- **GETTING_STARTED.md**: Development setup guide
- **Page screenshots**: Visual reference in project folder

---

## 📸 Screenshot File Locations

All screenshots are saved in the project root:

```
/vercel/share/v0-project/
├── desktop-landing.png (1920×1080)
├── mobile-landing.png (375×667)
├── desktop-dashboard.png (1920×1080)
├── mobile-dashboard.png (375×667)
├── desktop-manajemen.png (1920×1080)
├── mobile-manajemen.png (375×667)
├── desktop-kalender.png (1920×1080)
├── mobile-kalender.png (375×667)
├── desktop-tren-pasar.png (coming soon)
└── desktop-hubungi-kami.png (coming soon)
```

---

**Last Updated**: July 20, 2026
**Version**: 1.0

Ready to bring your designs to life in Figma! 🎨
