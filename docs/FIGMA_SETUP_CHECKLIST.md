# ✅ Figma Setup Checklist - Step by Step

Panduan langkah demi langkah untuk setup Figma design system dari nol.

---

## 📋 FASE 1: Setup Awal (15 menit)

### ☐ 1.1 Buat File Figma Baru

- [ ] Buka figma.com
- [ ] Click "Create new file"
- [ ] Rename: "Siapin Design System v1"
- [ ] Invite team members (opsional)
  
**Screenshot reference:**
```
Figma Dashboard → Create new file → Name it "Siapin Design System v1"
```

---

### ☐ 1.2 Setup Pages

Di panel **Pages** (kiri atas), buat halaman dengan nama ini:

- [ ] Delete default page "Page 1"
- [ ] Create **Page 1**: `🎨 Design System`
- [ ] Create **Page 2**: `📦 Components`
- [ ] Create **Page 3**: `📱 Mobile (375px)`
- [ ] Create **Page 4**: `💻 Desktop (1920px)`
- [ ] Create **Page 5**: `📐 Responsive Patterns`
- [ ] Create **Page 6**: `🎯 Icons & SVG Library`
- [ ] Create **Page 7**: `📋 Specifications`
- [ ] Create **Page 8**: `📖 Handoff Notes`

**How to create page:**
1. Right-click pada Pages panel
2. Select "New page"
3. Rename sesuai list di atas

---

### ☐ 1.3 Set Canvas Background

- [ ] Select semua pages (Cmd+A pada Pages panel)
- [ ] Canvas background: Light gray (#F5F5F5)
  - Right-click canvas → "Canvas settings" → Background color

**Kenapa?** Membuat screenshot terlihat lebih jelas pada canvas

---

## 🎨 FASE 2: Design System Setup (30 menit)

### ☐ 2.1 Create Color Library

**Location:** Page "🎨 Design System"

#### ☐ 2.1.1 Setup Color Swatches

1. Click **+ Board** pada canvas
2. Rename: `Color Library`
3. Set size: 1200×800px

**Inside Color Library board, create these frames:**

#### Frame: "Primary Colors"

- [ ] Create FRAME (300×200px)
- [ ] Add RECTANGLE inside:
  - [ ] Size: 120×120px
  - [ ] Fill: **#2563EB** (Blue)
  - [ ] Radius: 8px
  - [ ] Rename: `Color / Blue / Primary`
  
- [ ] Add TEXT below:
  - [ ] Text content: `Primary Blue\n#2563EB\nRGB(37, 99, 235)`
  - [ ] Font: Geist (or sans-serif)
  - [ ] Size: 12px
  - [ ] Color: #475569

- [ ] Duplicate rectangle & text
  - [ ] Change fill to **#1D4ED8** (Blue Dark)
  - [ ] Rename: `Color / Blue / Dark`
  - [ ] Update text: `Blue Dark\n#1D4ED8`

#### Frame: "Neutral Colors"

- [ ] Create FRAME (300×200px)
- [ ] Add 4 rectangles:

```
1. White (#FFFFFF)
   - Label: "White / Primary"
   - Stroke: 1px #E5E7EB (untuk visibility)

2. Light Gray (#F8F9FA)
   - Label: "Neutral / Light"
   
3. Border Gray (#E5E7EB)
   - Label: "Neutral / Border"
   
4. Dark Text (#0F172A)
   - Label: "Text / Dark"
```

#### Frame: "Status Colors"

- [ ] Create FRAME (300×200px)
- [ ] Add 3 rectangles:

```
1. Success Green (#10B981)
   - Label: "Status / Success"
   
2. Error Red (#EF4444)
   - Label: "Status / Error"
   
3. Warning Orange (#F59E0B)
   - Label: "Status / Warning"
```

---

### ☐ 2.2 Create Typography Styles

**Location:** Same page "🎨 Design System", di bawah colors

#### ☐ 2.2.1 Create Text Style Library

1. Click **+ Board**
2. Rename: `Typography`
3. Set size: 800×600px

#### Frame: "Headings"

- [ ] Create TEXT:
  - [ ] Content: `Heading 1 - The quick brown fox`
  - [ ] Font: Geist
  - [ ] Size: **32px**
  - [ ] Weight: **700** (Bold)
  - [ ] Line-height: **1.2** (38.4px)
  - [ ] Color: **#0F172A**
  - [ ] Right-click → "Create text style" → Name: `H1`

- [ ] Create TEXT:
  - [ ] Content: `Heading 2 - The quick brown fox`
  - [ ] Size: **24px**
  - [ ] Weight: **700**
  - [ ] Line-height: **1.3** (31.2px)
  - [ ] Create text style → Name: `H2`

- [ ] Create TEXT:
  - [ ] Content: `Heading 3 - The quick brown fox`
  - [ ] Size: **18px**
  - [ ] Weight: **600** (Semi-bold)
  - [ ] Line-height: **1.4** (25.2px)
  - [ ] Create text style → Name: `H3`

#### Frame: "Body & Small Text"

- [ ] Create TEXT (Body):
  - [ ] Content: `Body text (16px) - The quick brown fox jumps over the lazy dog`
  - [ ] Size: **16px**
  - [ ] Weight: **400** (Regular)
  - [ ] Line-height: **1.5** (24px)
  - [ ] Create text style → Name: `Body`

- [ ] Create TEXT (Small):
  - [ ] Content: `Small text (14px) - The quick brown fox`
  - [ ] Size: **14px**
  - [ ] Weight: **400**
  - [ ] Line-height: **1.5** (21px)
  - [ ] Create text style → Name: `Body Small`

- [ ] Create TEXT (Label):
  - [ ] Content: `Label (12px) - Caption text`
  - [ ] Size: **12px**
  - [ ] Weight: **500** (Medium)
  - [ ] Line-height: **1.5** (18px)
  - [ ] Create text style → Name: `Label`

---

### ☐ 2.3 Create Spacing Reference

**Location:** Same page, di bawah typography

#### ☐ 2.3.1 Spacing Scale

1. Click **+ Board**
2. Rename: `Spacing & Shadows`
3. Set size: 600×500px

#### Frame: "Spacing Scale"

- [ ] Create 7 RECTANGLES with labels:

```
1. Rectangle 4×4px
   - Label: "xs: 4px"
   - Color: #E5E7EB
   
2. Rectangle 8×8px
   - Label: "sm: 8px"
   
3. Rectangle 12×12px
   - Label: "md: 12px"
   
4. Rectangle 16×16px (highlight ini sebagai default)
   - Label: "base: 16px"
   - Background: #2563EB (blue)
   
5. Rectangle 24×24px
   - Label: "lg: 24px"
   
6. Rectangle 32×32px
   - Label: "xl: 32px"
   
7. Rectangle 48×48px
   - Label: "2xl: 48px"
```

#### Frame: "Shadows"

- [ ] Create 3 RECTANGLEs showing shadows:

```
1. Shadow Small
   - Rectangle: 200×80px, white background
   - Shadow: 0 1px 2px rgba(0,0,0,0.05)
   - Label: "Shadow Small"
   
2. Shadow Medium
   - Rectangle: 200×80px
   - Shadow: 0 4px 6px rgba(0,0,0,0.1)
   - Label: "Shadow Medium"
   
3. Shadow Hover
   - Rectangle: 200×80px
   - Shadow: 0 10px 15px rgba(0,0,0,0.15)
   - Label: "Shadow Hover"
```

---

## 📦 FASE 3: Components Library (45 menit)

### ☐ 3.1 Create Button Components

**Location:** Page "📦 Components"

#### ☐ 3.1.1 Button / Primary

1. Click **+ Board**
2. Rename: `Buttons`
3. Create FRAME (800×600px)

**Inside "Buttons" frame:**

- [ ] Create RECTANGLE:
  - [ ] Size: 120×48px
  - [ ] Fill: **#2563EB**
  - [ ] Radius: **8px**
  - [ ] Rename: `bg-button`

- [ ] Create TEXT on top:
  - [ ] Content: `Button`
  - [ ] Font: Geist
  - [ ] Size: 16px
  - [ ] Weight: 600
  - [ ] Color: White
  - [ ] Align: Center
  - [ ] Rename: `text-label`

- [ ] SELECT BOTH (Cmd+A or drag select)
- [ ] Right-click → **"Group"** (Cmd+G)
- [ ] Rename group: `Button / Primary`

- [ ] Right-click group → **"Create component"**
- [ ] Component created ✓

#### ☐ 3.1.2 Button / Primary / Hover

- [ ] Duplicate `Button / Primary` component
  - [ ] Select component → Cmd+D
  - [ ] Move ke bawah

- [ ] Edit the duplicate:
  - [ ] Double-click untuk edit
  - [ ] Click rectangle (bg)
  - [ ] Change fill: **#1D4ED8** (darker blue)
  - [ ] Add shadow: Medium
  - [ ] Click outside to exit edit
  - [ ] Rename: `Button / Primary / Hover`

#### ☐ 3.1.3 Button / Secondary

- [ ] Duplicate `Button / Primary`

- [ ] Edit:
  - [ ] Double-click
  - [ ] Rectangle: 
    - [ ] Fill: **White**
    - [ ] Stroke: 2px **#2563EB**
  - [ ] Text color: **#2563EB**
  - [ ] Exit edit
  - [ ] Rename: `Button / Secondary`

#### ☐ 3.1.4 Button / Disabled

- [ ] Duplicate `Button / Primary`

- [ ] Edit:
  - [ ] Double-click
  - [ ] Rectangle fill: **#E5E7EB** (gray)
  - [ ] Text color: **#9CA3AF** (lighter gray)
  - [ ] Exit edit
  - [ ] Rename: `Button / Disabled`

#### ☐ 3.1.5 Size Variants

- [ ] Duplicate `Button / Primary` 2x untuk sizes:

```
Button / Primary / Small (96×40px)
Button / Primary / Large (160×56px)
```

- [ ] Adjust:
  - [ ] Rectangle dimensions
  - [ ] Text font-size accordingly

---

### ☐ 3.2 Create Card Components

**Location:** Same "📦 Components" page

#### ☐ 3.2.1 Card / Default

- [ ] Create FRAME (400×300px)
- [ ] Inside, create RECTANGLE:
  - [ ] Size: 350×250px
  - [ ] Fill: **White**
  - [ ] Stroke: 1px **#E5E7EB**
  - [ ] Radius: **8px**
  - [ ] Shadow: **Small**

- [ ] Add content inside:
  - [ ] Create TEXT: "Card Title" (18px, bold)
  - [ ] Create TEXT: "Card description text" (14px, gray)
  - [ ] Group everything

- [ ] Right-click → **"Create component"**
- [ ] Rename: `Card / Default`

#### ☐ 3.2.2 Card / KPI

- [ ] Duplicate `Card / Default`

- [ ] Edit structure:
  - [ ] Add CIRCLE/RECTANGLE for icon area (48×48px, light blue bg)
  - [ ] Add large TEXT for value (32px, bold)
  - [ ] Add TEXT for label (14px)
  - [ ] Add small trend indicator (up/down arrow + percentage)

- [ ] Rename: `Card / KPI`

---

### ☐ 3.3 Create Badge Components

**Location:** Same page

- [ ] Create FRAME (600×200px)
- [ ] Create 4 FRAMEs inside for each badge type:

#### ☐ Success Badge

- [ ] Rectangle: 80×32px
- [ ] Fill: **#F0FDF4** (light green)
- [ ] Radius: **16px**
- [ ] TEXT: "Success" (12px, #10B981)
- [ ] Group & create component: `Badge / Success`

#### ☐ Error Badge

- [ ] Rectangle: 80×32px
- [ ] Fill: **#FEE2E2** (light red)
- [ ] Radius: **16px**
- [ ] TEXT: "Error" (12px, #EF4444)
- [ ] Create component: `Badge / Error`

#### ☐ Warning Badge

- [ ] Rectangle: 80×32px
- [ ] Fill: **#FFFBEB** (light orange)
- [ ] Radius: **16px**
- [ ] TEXT: "Warning" (12px, #F59E0B)
- [ ] Create component: `Badge / Warning`

#### ☐ Neutral Badge

- [ ] Rectangle: 80×32px
- [ ] Fill: **#F3F4F6** (light gray)
- [ ] Radius: **16px**
- [ ] TEXT: "Neutral" (12px, #6B7280)
- [ ] Create component: `Badge / Neutral`

---

### ☐ 3.4 Create Input Components

**Location:** Same page, bawah

#### ☐ Input / Text (Default)

- [ ] Create FRAME (300×60px)
- [ ] Add RECTANGLE inside:
  - [ ] Size: 280×44px
  - [ ] Fill: **White**
  - [ ] Stroke: 1px **#E5E7EB**
  - [ ] Radius: **6px**
  - [ ] Padding: 12px

- [ ] Add TEXT:
  - [ ] Content: `Enter text...` (placeholder)
  - [ ] Color: **#9CA3AF**
  - [ ] Size: 14px

- [ ] Group & create component: `Input / Text`

#### ☐ Input / Focus

- [ ] Duplicate `Input / Text`
- [ ] Edit:
  - [ ] Rectangle stroke: 2px **#2563EB**
  - [ ] Add blue shadow
  - [ ] TEXT color: **#000000**
- [ ] Create component: `Input / Focus`

#### ☐ Input / Error

- [ ] Duplicate `Input / Text`
- [ ] Edit:
  - [ ] Rectangle stroke: 2px **#EF4444**
  - [ ] Add red shadow
- [ ] Create component: `Input / Error`

---

## 📱 FASE 4: Import Screenshots (20 menit)

### ☐ 4.1 Desktop Screenshots

**Location:** Page "💻 Desktop (1920px)"

- [ ] Create BOARD: `Desktop Views`

#### ☐ For Each Screenshot:

1. [ ] Create FRAME: "Landing - Desktop" (1920×1080)
2. [ ] File → "Upload files" atau Drag-drop
3. [ ] Select `desktop-landing.png`
4. [ ] Resize to 1920×1080
5. [ ] Set constraints: Fix size
6. [ ] Rename layer: `Landing Screenshot`

**Repeat untuk:**

- [ ] `desktop-dashboard.png` → Frame "Dashboard - Desktop"
- [ ] `desktop-manajemen.png` → Frame "Manajemen - Desktop"
- [ ] `desktop-kalender.png` → Frame "Kalender - Desktop"
- [ ] `desktop-tren-pasar.png` → Frame "Tren Pasar - Desktop"
- [ ] `desktop-hubungi-kami.png` → Frame "Hubungi Kami - Desktop"

---

### ☐ 4.2 Mobile Screenshots

**Location:** Page "📱 Mobile (375px)"

- [ ] Create BOARD: `Mobile Views`

#### ☐ For Each Screenshot:

1. [ ] Create FRAME: "Landing - Mobile" (375×667)
2. [ ] Upload `mobile-landing.png`
3. [ ] Resize to 375×667
4. [ ] Set constraints: Fix size

**Repeat untuk:**

- [ ] `mobile-dashboard.png` → Frame "Dashboard - Mobile"
- [ ] `mobile-manajemen.png` → Frame "Manajemen - Mobile"
- [ ] `mobile-kalender.png` → Frame "Kalender - Mobile"
- [ ] Dst...

---

### ☐ 4.3 Add Annotations

**For each screenshot, add TEXT annotations:**

- [ ] Double-click FRAME to enter
- [ ] Click **+ Text** tool
- [ ] Add annotations:

**Example untuk Desktop Dashboard:**

```
Annotation 1 (top):
"KPI Grid: 4 columns
Column width: 280px
Gap: 16px"

Annotation 2 (sidebar):
"Sidebar: 33% width
Padding: 24px"

Annotation 3 (chart):
"Chart area: Full width
Height: 400px"
```

- [ ] Font: 12px
- [ ] Color: #6B7280 (gray)
- [ ] Click outside to exit

---

## 📐 FASE 5: Responsive Patterns (30 menit)

### ☐ 5.1 Grid Patterns

**Location:** Page "📐 Responsive Patterns"

#### ☐ Pattern: Card Grid

- [ ] Create FRAME: "Desktop - 4 Columns" (1600×400px)
- [ ] Inside, create 4 RECTANGLES:
  - [ ] Size each: 280×200px
  - [ ] Fill: #F3F4F6
  - [ ] Radius: 8px
  - [ ] Gap between: 16px
  - [ ] Add TEXT "Card" di tengah
- [ ] Add ANNOTATION:
  - [ ] TEXT: "Desktop: 4 columns (280px) Gap: 16px"

- [ ] Duplicate FRAME
  - [ ] Rename: "Tablet - 2 Columns" (768×400px)
  - [ ] Edit: 2 RECTANGLES (360px each)
  - [ ] Add ANNOTATION: "Tablet: 2 columns (360px)"

- [ ] Duplicate FRAME
  - [ ] Rename: "Mobile - 1 Column" (375×400px)
  - [ ] Edit: 1 RECTANGLE (full width)
  - [ ] Add ANNOTATION: "Mobile: 1 column, full width"

---

### ☐ 5.2 Sidebar Patterns

- [ ] Create FRAME: "Desktop Sidebar" (1600×600px)
- [ ] Inside:
  - [ ] RECTANGLE (66% width): Main content area
  - [ ] RECTANGLE (33% width): Sidebar
  - [ ] Add labels & annotations

---

### ☐ 5.3 Breakpoint Reference

- [ ] Create FRAME: "Responsive Breakpoints" (800×400px)
- [ ] Create 3 RECTANGLES with widths:
  - [ ] 375px (Mobile) - label below
  - [ ] 768px (Tablet) - label below
  - [ ] 1920px (Desktop) - label below
- [ ] Add TEXT annotations for each

---

## 🎯 FASE 6: Icons & SVG Library (20 menit)

### ☐ 6.1 UI Icons (24×24)

**Location:** Page "🎯 Icons & SVG Library"

#### ☐ Create Icon Components

For each icon (Dashboard, Settings, Menu, Search, Close, etc.):

1. [ ] Create FRAME: "Icon / [Name]" (48×48px)
2. [ ] Option A: **Upload SVG file**
   - [ ] File → "Upload files"
   - [ ] Select .svg
   - [ ] Drag to frame
   
3. [ ] Option B: **Copy SVG code**
   - [ ] Copy SVG from Lucide React
   - [ ] Paste (Cmd+V) ke Figma
   - [ ] Resize to 24×24px

4. [ ] Right-click → "Create component"
5. [ ] Rename: `Icon / Dashboard` (contoh)

**Icons untuk create:**

- [ ] `Icon / Dashboard` (house)
- [ ] `Icon / Settings` (gear)
- [ ] `Icon / Menu` (hamburger)
- [ ] `Icon / Close` (X)
- [ ] `Icon / Search` (magnifying glass)
- [ ] `Icon / ArrowUp` (green, for trends)
- [ ] `Icon / ArrowDown` (red, for trends)
- [ ] `Icon / CheckCircle` (green)
- [ ] `Icon / AlertCircle` (red)
- [ ] `Icon / Clock` (gray)

---

## 📋 FASE 7: Specifications (15 menit)

### ☐ 7.1 Create Specification Frames

**Location:** Page "📋 Specifications"

#### ☐ Colors Specification

- [ ] Create FRAME: "Color Specs" (600×800px)
- [ ] For each color, add:

```
NAME: Primary Blue
HEX: #2563EB
RGB: 37, 99, 235
HSL: 219°, 88%, 50%
USAGE: Buttons, links, active states
CONTRAST: ✓ WCAG AA (4.5:1 on white)
```

#### ☐ Typography Specification

- [ ] Create FRAME: "Typography Specs"
- [ ] For each style:

```
H1 (32px Bold)
├─ Font: Geist
├─ Weight: 700
├─ Line-height: 1.2
├─ Letter-spacing: normal
└─ Usage: Page titles

Body (16px Regular)
├─ Font: Geist
├─ Weight: 400
├─ Line-height: 1.5
└─ Usage: Main content
```

#### ☐ Spacing Specification

- [ ] Create FRAME: "Spacing Specs"
- [ ] List:

```
Padding (Card): 16px mobile, 24px desktop
Gap (Grid): 16px
Margin (Section): 32px
Radius (Corner): 8px
Border Width: 1px
```

---

## 📖 FASE 8: Handoff Notes (10 menit)

### ☐ 8.1 Add Developer Notes

**Location:** Page "📖 Handoff Notes"

#### ☐ CSS Exports

- [ ] Create FRAME: "CSS Classes"
- [ ] Add TEXT:

```
Tailwind Classes Used:

Buttons:
├─ bg-blue-600 hover:bg-blue-700
├─ text-white px-4 py-2
├─ rounded-lg font-medium
└─ transition-colors

Cards:
├─ bg-white border border-gray-200
├─ rounded-lg shadow-sm
├─ hover:shadow-md
└─ p-4 md:p-6

Grids:
├─ grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4
├─ gap-4 md:gap-6
└─ responsive container
```

#### ☐ Component Variants

- [ ] Create FRAME: "Component States"
- [ ] Document:

```
Button States:
├─ Default (bg-blue-600)
├─ Hover (bg-blue-700 + shadow)
├─ Active (scale-98)
├─ Focus (ring-2 ring-blue-300)
├─ Disabled (bg-gray-300 cursor-not-allowed)
└─ Loading (spinner animation)
```

#### ☐ Breakpoints

- [ ] Create FRAME: "Responsive Breakpoints"
- [ ] Add:

```
Mobile:    0px - 639px    (default Tailwind)
Tablet:    640px - 1023px (md: prefix in Tailwind)
Desktop:   1024px+        (lg: prefix in Tailwind)

Our Implementation:
├─ 375px viewport (mobile)
├─ 768px viewport (tablet)
└─ 1920px viewport (desktop)
```

---

## ✅ FINAL CHECKLIST

**Sebelum sharing ke team:**

- [ ] Semua 8 pages sudah dibuat
- [ ] Colors sudah di-setup (primary, neutral, status)
- [ ] Typography sudah di-setup (6 text styles)
- [ ] Components sudah di-create (buttons, cards, badges, inputs)
- [ ] Screenshots sudah di-import (desktop & mobile)
- [ ] Annotations sudah di-add
- [ ] Responsive patterns sudah di-document
- [ ] Icons sudah di-create (minimal 10 icons)
- [ ] Specifications sudah di-write
- [ ] Handoff notes sudah di-complete
- [ ] Semua layers sudah di-name dengan benar
- [ ] Unused layers sudah di-delete
- [ ] File sudah di-save

---

## 🎉 DONE!

Figma design system Anda siap untuk:

✅ Design refinements
✅ Component library reference
✅ Developer handoff
✅ Design consistency
✅ Future iterations

**Next steps:**
1. Share link ke team
2. Set permissions (View/Edit)
3. Add comments untuk collaboration
4. Export components untuk development
5. Update design system saat ada perubahan

---

**Estimated Total Time: 2-3 hours**

Good luck! 🚀

