# 🎯 FIGMA COMPLETE WORKFLOW - From Zero to Production Design System

Panduan end-to-end untuk create design system Siapin di Figma dengan structure yang jelas.

---

## 🗂️ STRUKTUR YANG AKAN KITA BUAT

```
FILE: Siapin Design System v1
│
├─ PAGE: 🎨 Design System
│  └─ BOARDS & FRAMES (colors, typography, spacing, shadows)
│
├─ PAGE: 📦 Components
│  └─ BOARDS & FRAMES (buttons, cards, badges, inputs, icons)
│
├─ PAGE: 📱 Mobile (375px)
│  └─ BOARDS & FRAMES (mobile screenshots + mobile specs)
│
├─ PAGE: 💻 Desktop (1920px)
│  └─ BOARDS & FRAMES (desktop screenshots + desktop specs)
│
├─ PAGE: 📐 Responsive Patterns
│  └─ BOARDS & FRAMES (grids, sidebars, forms)
│
├─ PAGE: 🎯 Icons & SVG Library
│  └─ BOARDS & FRAMES (all icons organized)
│
├─ PAGE: 📋 Specifications & Annotations
│  └─ BOARDS & FRAMES (detailed specs for devs)
│
└─ PAGE: 📖 Developer Handoff Notes
   └─ BOARDS & FRAMES (CSS, variants, breakpoints)
```

---

## ⏱️ TIME ALLOCATION

```
Phase 1: Setup Awal                 → 15 minutes
Phase 2: Design System Setup        → 30 minutes  
Phase 3: Components Creation        → 45 minutes
Phase 4: Import Screenshots         → 20 minutes
Phase 5: Responsive Patterns        → 30 minutes
Phase 6: Icons & SVG Library        → 20 minutes
Phase 7: Specifications             → 15 minutes
Phase 8: Handoff Notes              → 10 minutes
────────────────────────────────────────────────
TOTAL                               → 2-3 hours
```

---

## 🎬 STEP-BY-STEP WORKFLOW

### PHASE 1: INITIAL SETUP (15 min)

**Goal:** Create file & setup pages

```
1. Go to figma.com
   └─ Create new file
   └─ Name: "Siapin Design System v1"

2. Create 8 Pages (Delete default "Page 1" first):
   ☐ 🎨 Design System
   ☐ 📦 Components  
   ☐ 📱 Mobile (375px)
   ☐ 💻 Desktop (1920px)
   ☐ 📐 Responsive Patterns
   ☐ 🎯 Icons & SVG Library
   ☐ 📋 Specifications & Annotations
   ☐ 📖 Developer Handoff Notes

3. Set Canvas Background (all pages):
   └─ Light gray #F5F5F5 (easier on eyes)

4. ✅ DONE → Figma file ready with all pages
```

---

### PHASE 2: DESIGN SYSTEM SETUP (30 min)

**Goal:** Create color library, typography, spacing

#### Step 2.1: Color Library (10 min)

**On page "🎨 Design System":**

```
1. Create BOARD: "Color Library" (1200×800px)

2. Inside board, create FRAME: "Primary Colors" (300×200px)
   ├─ Add RECTANGLE (120×120px)
   │  ├─ Fill: #2563EB (blue)
   │  ├─ Rename: "Color / Blue / Primary"
   │  └─ Add TEXT below: "Primary Blue\n#2563EB"
   │
   └─ Add RECTANGLE (120×120px)
      ├─ Fill: #1D4ED8 (dark blue)
      ├─ Rename: "Color / Blue / Dark"
      └─ Add TEXT: "Blue Dark\n#1D4ED8"

3. Repeat untuk "Neutral Colors" frame:
   ├─ White (#FFFFFF)
   ├─ Light Gray (#F8F9FA)
   ├─ Border Gray (#E5E7EB)
   └─ Dark Text (#0F172A)

4. Repeat untuk "Status Colors" frame:
   ├─ Green (#10B981)
   ├─ Red (#EF4444)
   └─ Orange (#F59E0B)

✅ DONE → 3 color frames created with 10 colors total
```

#### Step 2.2: Typography Setup (10 min)

**Still on page "🎨 Design System":**

```
1. Create BOARD: "Typography" (800×600px)

2. Create FRAME: "Headings" (600×200px)
   ├─ TEXT: "H1 - 32px Bold"
   │  ├─ Font: Geist
   │  ├─ Size: 32px
   │  ├─ Weight: 700
   │  ├─ Line-height: 1.2
   │  └─ Right-click → "Create text style" → Name: "H1"
   │
   ├─ TEXT: "H2 - 24px Bold" (repeat dengan size 24px)
   │  └─ Create text style → Name: "H2"
   │
   └─ TEXT: "H3 - 18px SemiBold" (repeat dengan size 18px)
      └─ Create text style → Name: "H3"

3. Create FRAME: "Body & Small" (600×200px)
   ├─ TEXT: "Body - 16px Regular"
   │  └─ Create text style → Name: "Body"
   │
   └─ TEXT: "Caption - 12px Medium"
      └─ Create text style → Name: "Label"

✅ DONE → 6 text styles created (H1, H2, H3, Body, Body Small, Label)
```

#### Step 2.3: Spacing & Shadows (10 min)

**Still on page "🎨 Design System":**

```
1. Create BOARD: "Spacing & Shadows" (600×500px)

2. Create FRAME: "Spacing Scale" (600×200px)
   ├─ RECTANGLE 4×4px → Label: "xs: 4px"
   ├─ RECTANGLE 8×8px → Label: "sm: 8px"
   ├─ RECTANGLE 12×12px → Label: "md: 12px"
   ├─ RECTANGLE 16×16px → Label: "base: 16px" (highlight blue)
   ├─ RECTANGLE 24×24px → Label: "lg: 24px"
   ├─ RECTANGLE 32×32px → Label: "xl: 32px"
   └─ RECTANGLE 48×48px → Label: "2xl: 48px"

3. Create FRAME: "Shadows" (600×200px)
   ├─ RECTANGLE (white)
   │  ├─ Shadow: 0 1px 2px rgba(0,0,0,0.05)
   │  └─ Label: "Shadow Small"
   │
   ├─ RECTANGLE (white)
   │  ├─ Shadow: 0 4px 6px rgba(0,0,0,0.1)
   │  └─ Label: "Shadow Medium"
   │
   └─ RECTANGLE (white)
      ├─ Shadow: 0 10px 15px rgba(0,0,0,0.15)
      └─ Label: "Shadow Hover"

✅ DONE → Design system foundation complete!
```

---

### PHASE 3: COMPONENTS CREATION (45 min)

**Goal:** Create reusable component library

**On page "📦 Components":**

#### Step 3.1: Create Button Components (15 min)

```
1. Create BOARD: "Buttons" (1200×600px)

2. Create Button / Primary component:
   ├─ Create FRAME (400×300px)
   ├─ Draw RECTANGLE inside:
   │  ├─ Size: 120×48px
   │  ├─ Fill: #2563EB
   │  ├─ Radius: 8px
   │  └─ Rename: "Background"
   │
   ├─ Add TEXT on top:
   │  ├─ Content: "Button"
   │  ├─ Color: White
   │  ├─ Size: 16px Bold
   │  ├─ Center align
   │  └─ Rename: "Label"
   │
   ├─ Select BOTH layers (Cmd+A)
   ├─ Group (Cmd+G)
   ├─ Rename group: "Button / Primary"
   ├─ Right-click → "Create component"
   └─ ✅ Component created!

3. Create Button / Primary / Hover variant:
   ├─ Duplicate "Button / Primary"
   ├─ Double-click to edit
   ├─ Change background fill: #1D4ED8 (darker)
   ├─ Add shadow: Medium
   ├─ Exit edit
   ├─ Rename: "Button / Primary / Hover"
   └─ ✅ Variant created!

4. Create Button / Secondary:
   ├─ Duplicate "Button / Primary"
   ├─ Edit: Fill white, Stroke 2px blue
   ├─ Exit & rename: "Button / Secondary"
   └─ ✅ Created!

5. Create Button / Disabled:
   ├─ Duplicate "Button / Primary"
   ├─ Edit: Fill gray, Text lighter gray
   ├─ Exit & rename: "Button / Disabled"
   └─ ✅ Created!

6. Create Size Variants:
   ├─ Duplicate & edit for "Button / Primary / Small" (96×40px)
   ├─ Duplicate & edit for "Button / Primary / Large" (160×56px)
   └─ ✅ All button variants created!

Total: 6 button variations
```

#### Step 3.2: Create Card Components (15 min)

```
1. Create BOARD: "Cards" (1200×600px)

2. Create Card / Default:
   ├─ Create FRAME (400×300px)
   ├─ RECTANGLE inside (350×250px):
   │  ├─ Fill: White
   │  ├─ Stroke: 1px #E5E7EB
   │  ├─ Radius: 8px
   │  └─ Shadow: Small
   │
   ├─ Add TEXT "Card Title" (18px bold)
   ├─ Add TEXT "Description" (14px gray)
   ├─ Group all
   ├─ Right-click → "Create component"
   └─ ✅ Card created!

3. Create Card / KPI (from duplicate):
   ├─ Duplicate Card / Default
   ├─ Edit inside:
   │  ├─ Add CIRCLE (48×48px, light blue bg) for icon
   │  ├─ Add large TEXT (32px bold) for value
   │  ├─ Add TEXT (14px) for label
   │  ├─ Add arrow icon + percentage for trend
   │  └─ Arrange nicely
   ├─ Exit & rename: "Card / KPI"
   └─ ✅ KPI card created!

Total: 2-4 card variations
```

#### Step 3.3: Create Badge Components (10 min)

```
1. Create BOARD: "Badges" (800×300px)

2. For each badge type:
   ├─ RECTANGLE (80×32px)
   ├─ Radius: 16px
   ├─ Add TEXT (12px) centered
   ├─ Group + create component
   ├─ Rename appropriately
   └─ Done!

Create 4 badges:
├─ Badge / Success (green bg, green text)
├─ Badge / Error (red bg, red text)
├─ Badge / Warning (orange bg, orange text)
└─ Badge / Neutral (gray bg, gray text)

✅ 4 badge components created
```

#### Step 3.4: Create Input Components (5 min)

```
1. Create BOARD: "Inputs" (800×400px)

2. Create Input / Text:
   ├─ RECTANGLE (280×44px)
   │  ├─ Fill: White
   │  ├─ Stroke: 1px #E5E7EB
   │  ├─ Radius: 6px
   │  └─ Padding: 12px
   │
   ├─ Add TEXT "Enter text..." (gray placeholder)
   ├─ Group + create component
   └─ ✅ Created!

3. Create Input / Focus (duplicate):
   ├─ Change stroke: 2px #2563EB
   ├─ Add blue shadow
   ├─ Rename: "Input / Focus"
   └─ ✅ Created!

4. Create Input / Error (duplicate):
   ├─ Change stroke: 2px #EF4444
   ├─ Add red shadow
   ├─ Rename: "Input / Error"
   └─ ✅ Created!

Total: 3-4 input states
```

✅ **PHASE 3 COMPLETE:** ~20 components created!

---

### PHASE 4: IMPORT SCREENSHOTS (20 min)

**Goal:** Add visual reference for all pages

**On page "💻 Desktop (1920px)":**

```
1. Create BOARD: "Desktop Views"

2. For each desktop screenshot:
   ├─ Create FRAME (1920×1080px)
   ├─ File → "Upload files" atau drag-drop
   ├─ Select PNG file
   ├─ Resize to 1920×1080
   ├─ Set constraints: Fix size
   ├─ Rename frame: e.g., "Landing - Desktop"
   └─ Done!

Screenshots to import:
├─ desktop-landing.png
├─ desktop-dashboard.png
├─ desktop-manajemen.png
├─ desktop-kalender.png
├─ desktop-tren-pasar.png (jika available)
└─ desktop-hubungi-kami.png (jika available)

3. Add ANNOTATION untuk setiap screenshot:
   ├─ Double-click frame to enter edit mode
   ├─ Tools → Text (T)
   ├─ Add notes about layout
   ├─ Example: "KPI Grid: 4 columns, 16px gap"
   └─ Click outside to exit

✅ DESKTOP PAGE COMPLETE
```

**On page "📱 Mobile (375px)":**

```
Repeat same process dengan mobile screenshots:
├─ mobile-landing.png
├─ mobile-dashboard.png
├─ mobile-manajemen.png
├─ mobile-kalender.png
└─ Etc...

Set frame size: 375×667px (untuk setiap mobile screenshot)

✅ MOBILE PAGE COMPLETE
```

---

### PHASE 5: RESPONSIVE PATTERNS (30 min)

**Goal:** Document responsive design patterns

**On page "📐 Responsive Patterns":**

```
1. Create BOARD: "Layout Patterns"

2. Create Card Grid Pattern:
   ├─ FRAME: "Desktop - 4 Columns" (1600×400px)
   │  ├─ 4 RECTANGLES (280×200px each)
   │  ├─ Gap: 16px between
   │  ├─ Add TEXT: "4 columns @ 280px"
   │  └─ Add annotation labels
   │
   ├─ FRAME: "Tablet - 2 Columns" (800×400px)
   │  ├─ 2 RECTANGLES (360×200px each)
   │  └─ Add annotation: "2 columns @ 360px"
   │
   └─ FRAME: "Mobile - 1 Column" (375×400px)
      ├─ 1 RECTANGLE (full width)
      └─ Add annotation: "1 column full width"

3. Create Sidebar Pattern:
   ├─ FRAME: "Desktop Layout" (1600×600px)
   │  ├─ RECTANGLE (66% width) - main content
   │  ├─ RECTANGLE (33% width) - sidebar
   │  └─ Gap: 24px
   │
   ├─ FRAME: "Tablet Layout" (800×600px)
   │  ├─ RECTANGLE (60% width)
   │  ├─ RECTANGLE (40% width)
   │  └─ Gap: 24px
   │
   └─ FRAME: "Mobile Layout" (375×600px)
      ├─ RECTANGLE 1 (full width)
      ├─ RECTANGLE 2 (full width)
      └─ Stacked vertically

4. Create Form Pattern:
   ├─ FRAME: "Desktop Form" (600×400px)
   │  ├─ TEXT "Email"
   │  ├─ INSTANCE "Input / Text"
   │  ├─ TEXT "Message"
   │  ├─ RECTANGLE "Textarea"
   │  └─ INSTANCE "Button / Primary"
   │
   └─ FRAME: "Mobile Form" (375×400px)
      ├─ TEXT "Email"
      ├─ INSTANCE "Input / Text" (full width)
      ├─ TEXT "Message"
      ├─ RECTANGLE "Textarea" (full width)
      └─ INSTANCE "Button / Primary" (full width)

✅ Responsive patterns documented
```

---

### PHASE 6: ICONS & SVG LIBRARY (20 min)

**Goal:** Create icon components

**On page "🎯 Icons & SVG Library":**

```
1. Create BOARD: "UI Icons"

2. For each icon:
   ├─ Create FRAME (48×48px)
   ├─ Option A: Upload SVG file
   │  └─ File → "Upload files" → Select .svg
   │  └─ Drag to frame
   │
   └─ Option B: Paste SVG code
      └─ Copy SVG from Lucide React
      └─ Paste (Cmd+V)
      └─ Resize to 24×24px
   
   ├─ Right-click → "Create component"
   ├─ Rename: "Icon / [Name] / 24"
   └─ Done!

Icons to create (minimum):
├─ Icon / Dashboard / 24
├─ Icon / Settings / 24
├─ Icon / Menu / 24
├─ Icon / Close / 24
├─ Icon / Search / 24
├─ Icon / TrendUp / 16 (green)
├─ Icon / TrendDown / 16 (red)
├─ Icon / Success / 24 (checkmark)
├─ Icon / Error / 24 (X)
└─ Icon / Warning / 24 (alert)

3. Create BOARD: "SVG Patterns" (for reusable patterns)
   ├─ VECTOR: Dot pattern
   ├─ VECTOR: Line pattern
   └─ VECTOR: Grid pattern

✅ Icon library complete
```

---

### PHASE 7: SPECIFICATIONS (15 min)

**Goal:** Document detailed specs for developers

**On page "📋 Specifications & Annotations":**

```
1. Create BOARD: "Color Specs"
   ├─ FRAME: "Primary Blue"
   │  ├─ RECTANGLE: Color swatch
   │  └─ TEXT: "HEX: #2563EB | RGB(37,99,235) | Usage: Primary CTA"
   │
   ├─ FRAME: "Success Green"
   │  ├─ RECTANGLE: Color swatch
   │  └─ TEXT: "HEX: #10B981 | RGB(16,185,129) | Usage: Success states"
   │
   └─ Repeat untuk semua 10 colors

2. Create BOARD: "Typography Specs"
   ├─ FRAME: "H1 Spec"
   │  ├─ TEXT: "The quick brown fox" (32px bold)
   │  └─ TEXT: "Font: Geist | Weight: 700 | Line-height: 1.2"
   │
   ├─ FRAME: "Body Spec"
   │  ├─ TEXT: "The quick brown fox..." (16px)
   │  └─ TEXT: "Font: Geist | Weight: 400 | Line-height: 1.5"
   │
   └─ Repeat untuk remaining styles

3. Create BOARD: "Spacing Specs"
   └─ TEXT: "xs: 4px | sm: 8px | md: 12px | base: 16px | lg: 24px | xl: 32px | 2xl: 48px"

✅ Specifications documented
```

---

### PHASE 8: DEVELOPER HANDOFF NOTES (10 min)

**Goal:** Provide CSS & technical info for developers

**On page "📖 Developer Handoff Notes":**

```
1. Create BOARD: "CSS Reference"
   └─ FRAME: "Tailwind Classes"
      └─ TEXT content:
         "
         BUTTONS:
         bg-blue-600 hover:bg-blue-700
         text-white px-4 py-2
         rounded-lg font-semibold
         transition-colors
         
         CARDS:
         bg-white border border-gray-200
         rounded-lg shadow-sm
         hover:shadow-md p-4 md:p-6
         
         GRIDS:
         grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4
         gap-4 md:gap-6
         "

2. Create BOARD: "Component States"
   └─ FRAME: "Button States"
      └─ TEXT: "Default | Hover | Focus | Active | Disabled | Loading"

3. Create BOARD: "Breakpoints"
   └─ FRAME: "Responsive"
      └─ TEXT: "Mobile: 0-639px | Tablet: 640-1023px | Desktop: 1024px+"

✅ Handoff notes complete
```

---

## ✅ FINAL CHECKLIST

Before sharing Figma file:

- [ ] 8 pages created with correct names
- [ ] Colors library (10+ colors)
- [ ] Typography (6 text styles)
- [ ] Spacing reference (7 values)
- [ ] Shadows (3 types)
- [ ] Components (20+):
  - [ ] Buttons (6 variants)
  - [ ] Cards (3 types)
  - [ ] Badges (4 colors)
  - [ ] Inputs (3 states)
  - [ ] Icons (10+ icons)
- [ ] Screenshots imported (desktop & mobile)
- [ ] Annotations added
- [ ] Responsive patterns documented
- [ ] Specifications written
- [ ] Handoff notes added
- [ ] All layers named correctly
- [ ] No unused layers
- [ ] File organized
- [ ] File saved

---

## 🚀 SHARING WITH TEAM

```
1. Click "Share" button (top right)
2. Set permissions:
   ☐ View - stakeholders
   ☐ Edit - designers
   ☐ Owner - lead designer
3. Copy link
4. Send to team
```

---

## 📞 SUPPORT DOCS

If you need more details:

1. **FIGMA_STRUCTURE_GUIDE.md** - Full layer hierarchy
2. **FIGMA_SETUP_CHECKLIST.md** - Detailed step-by-step
3. **FIGMA_LAYER_NAMING.md** - Naming conventions
4. **FIGMA_QUICK_REFERENCE.md** - Quick tips
5. **DESIGN_SYSTEM.md** - Design specifications

---

## 🎉 YOU'RE DONE!

Figma design system siap untuk:
- ✅ Design reviews
- ✅ Developer handoff
- ✅ Design consistency
- ✅ Component library
- ✅ Future iterations

---

**Estimated time: 2-3 hours**

**Let's build! 🚀**

