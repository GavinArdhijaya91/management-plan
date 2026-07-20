# 🎨 START HERE - Figma Export Guide untuk Siapin

Panduan lengkap untuk mengexport design Siapin ke Figma dengan struktur frame, vector, element, dan SVG yang jelas.

---

## 📌 QUICK ANSWER: STRUKTUR FIGMA YANG BENAR

Ini adalah jawaban langsung untuk pertanyaan Anda tentang bagaimana cara export ke Figma dengan struktur yang jelas:

```
FILE: "Siapin Design System v1"
│
├─ PAGES (8 halaman terorganisir)
│  ├─ 🎨 Design System        → Colors, typography, spacing
│  ├─ 📦 Components            → Buttons, cards, badges, inputs
│  ├─ 📱 Mobile (375px)        → Mobile screenshots + specs
│  ├─ 💻 Desktop (1920px)      → Desktop screenshots + specs
│  ├─ 📐 Responsive Patterns   → Grid, sidebar, form patterns
│  ├─ 🎯 Icons & SVG Library   → All icons (SVG/vector)
│  ├─ 📋 Specifications        → Color specs, typography specs
│  └─ 📖 Handoff Notes         → CSS classes, breakpoints
│
├─ BOARDS (pada setiap page)
│  └─ Organizer untuk group related frames
│
├─ FRAMES (container untuk content)
│  ├─ Desktop screenshots (1920×1080px)
│  ├─ Mobile screenshots (375×667px)
│  ├─ Color samples
│  ├─ Typography samples
│  └─ Component showcases
│
├─ ELEMENTS dalam setiap FRAME:
│  ├─ RECTANGLES (color swatches, placeholders)
│  ├─ TEXT (labels, annotations, specifications)
│  ├─ VECTORS/SVGs (icons, patterns)
│  └─ IMAGES (screenshots)
│
└─ COMPONENTS (reusable):
   ├─ Button / Primary
   ├─ Button / Primary / Hover
   ├─ Card / Default
   ├─ Card / KPI
   ├─ Badge / Success
   ├─ Input / Text
   ├─ Icon / Dashboard / 24
   └─ ... (20+ components total)
```

---

## 🎯 HIERARCHY EXPLANATION

### Apa itu FILE?
- **FILE** = Seluruh Figma document yang bisa di-share
- Nama: "Siapin Design System v1"
- Bisa di-invite members untuk collaborate

### Apa itu PAGES (8 halaman)?
- **PAGE** = Tab utama seperti di PowerPoint
- Setiap page punya tema berbeda
- Contoh: "Design System" page, "Components" page

### Apa itu BOARDS (di dalam page)?
- **BOARD** = Organizer untuk group related frames
- Tidak di-export, hanya untuk organizing
- Seperti folder dalam folder

### Apa itu FRAMES?
- **FRAME** = Container/artboard untuk content
- Ukuran fixed (1920×1080 untuk desktop, 375×667 untuk mobile)
- Bisa di-export sebagai satu unit

### Apa itu ELEMENTS (dalam frame)?
- **RECTANGLE** = Shape untuk color swatches, backgrounds
- **TEXT** = Typography untuk labels, annotations
- **VECTOR/SVG** = Icons, lines, patterns (bukan raster)
- **IMAGE** = Raster images (screenshots, photos)
- **COMPONENT** = Reusable UI parts (buttons, cards, etc)

---

## 📐 STRUKTUR LENGKAP DENGAN CONTOH

### FILE Level

```
Siapin Design System v1 (FILE)
```

### PAGES Level (8 halaman)

```
Siapin Design System v1
├── 🎨 Design System          ← PAGE
├── 📦 Components              ← PAGE
├── 📱 Mobile (375px)          ← PAGE
├── 💻 Desktop (1920px)        ← PAGE
├── 📐 Responsive Patterns     ← PAGE
├── 🎯 Icons & SVG Library     ← PAGE
├── 📋 Specifications          ← PAGE
└── 📖 Handoff Notes           ← PAGE
```

### BOARDS & FRAMES Level (contoh dari "Design System" page)

```
🎨 Design System (PAGE)
│
├── Color Library (BOARD)
│   ├── Primary Colors (FRAME 300×200px)
│   │   ├── Rectangle "Color / Blue / Primary" (120×120px filled with #2563EB)
│   │   └── Text "Primary Blue #2563EB"
│   │
│   ├── Neutral Colors (FRAME 300×200px)
│   │   ├── Rectangle "Color / White" (120×120px filled)
│   │   └── Text "White #FFFFFF"
│   │
│   └── Status Colors (FRAME 300×200px)
│       ├── Rectangle "Color / Green / Success" (filled #10B981)
│       └── Text "Success #10B981"
│
├── Typography (BOARD)
│   ├── Headings (FRAME 600×200px)
│   │   ├── Text "H1 - 32px Bold" (32px, weight 700, line-height 1.2)
│   │   ├── Text "H2 - 24px Bold" (24px, weight 700)
│   │   └── Text "H3 - 18px SemiBold" (18px, weight 600)
│   │
│   └── Body (FRAME 600×200px)
│       ├── Text "Body - 16px Regular" (16px, weight 400)
│       └── Text "Label - 12px Medium" (12px, weight 500)
│
└── Spacing & Shadows (BOARD)
    ├── Spacing Scale (FRAME 600×200px)
    │   ├── Rectangle "Spacing / 4px" (4×4px)
    │   ├── Rectangle "Spacing / 8px" (8×8px)
    │   ├── Rectangle "Spacing / 16px" (16×16px)
    │   └── ... (7 spacing values)
    │
    └── Shadows (FRAME 600×200px)
        ├── Rectangle with shadow "Shadow / Small" (0 1px 2px)
        ├── Rectangle with shadow "Shadow / Medium" (0 4px 6px)
        └── Rectangle with shadow "Shadow / Hover" (0 10px 15px)
```

### COMPONENTS Level (contoh dari "Components" page)

```
📦 Components (PAGE)
│
├── Buttons (BOARD)
│   ├── COMPONENT "Button / Primary"
│   │   ├── RECTANGLE "Background" (120×48px, fill #2563EB, radius 8px)
│   │   ├── TEXT "Label" (white, 16px bold, centered)
│   │   └── GROUP (both layers grouped)
│   │
│   ├── COMPONENT "Button / Primary / Hover"
│   │   ├── RECTANGLE "Background" (120×48px, fill #1D4ED8, shadow medium)
│   │   ├── TEXT "Label"
│   │   └── GROUP
│   │
│   ├── COMPONENT "Button / Secondary"
│   ├── COMPONENT "Button / Disabled"
│   ├── COMPONENT "Button / Primary / Small"
│   └── COMPONENT "Button / Primary / Large"
│
├── Cards (BOARD)
│   ├── COMPONENT "Card / Default"
│   │   ├── RECTANGLE "Card Container" (white, border 1px, radius 8px, shadow)
│   │   ├── TEXT "Title" (18px bold)
│   │   ├── TEXT "Description" (14px gray)
│   │   └── GROUP
│   │
│   ├── COMPONENT "Card / KPI"
│   │   ├── RECTANGLE "Background"
│   │   ├── GROUP "Header"
│   │   │   ├── CIRCLE "Icon Background" (48×48px, light blue)
│   │   │   └── TEXT "Title"
│   │   ├── TEXT "Value" (32px bold)
│   │   ├── GROUP "Footer"
│   │   │   ├── VECTOR "Arrow Up" (SVG, green color)
│   │   │   └── TEXT "+12.5%"
│   │   └── GROUP
│   │
│   └── COMPONENT "Card / Transaction"
│
├── Badges (BOARD)
│   ├── COMPONENT "Badge / Success"
│   │   ├── RECTANGLE (80×32px, fill #F0FDF4, radius 16px)
│   │   ├── TEXT "Success" (12px, color #10B981)
│   │   └── GROUP
│   │
│   ├── COMPONENT "Badge / Error"
│   ├── COMPONENT "Badge / Warning"
│   └── COMPONENT "Badge / Neutral"
│
├── Inputs (BOARD)
│   ├── COMPONENT "Input / Text"
│   │   ├── RECTANGLE "Background & Border" (280×44px, white fill, gray stroke)
│   │   ├── TEXT "Placeholder" (gray text)
│   │   └── GROUP
│   │
│   ├── COMPONENT "Input / Focus"
│   ├── COMPONENT "Input / Error"
│   └── COMPONENT "Input / Disabled"
│
└── Icons (BOARD)
    ├── COMPONENT "Icon / Dashboard / 24"
    │   ├── VECTOR (SVG path for dashboard icon, 24×24px)
    │   └── COMPONENT
    │
    ├── COMPONENT "Icon / Settings / 24"
    │   └── VECTOR
    │
    ├── COMPONENT "Icon / TrendUp / 16" (green color)
    │   └── VECTOR
    │
    └── ... (10+ icons total)
```

---

## 🎨 LAYER TYPES EXPLAINED

### 1. RECTANGLE (Shape Element)

```
Digunakan untuk:
✅ Color swatches
✅ Button backgrounds
✅ Card backgrounds
✅ Placeholder boxes
✅ Section dividers

Properties:
- Fill color (contoh: #2563EB)
- Stroke (border) - width & color
- Corner radius (contoh: 8px)
- Shadow
- Size (width × height)
```

**Example dalam Figma:**

```
FRAME "Primary Colors"
├── RECTANGLE "Color / Blue / Primary"
│   ├── Fill: #2563EB
│   ├── Size: 120×120px
│   ├── Radius: 8px
│   └─ Stroke: none
```

### 2. TEXT (Typography Element)

```
Digunakan untuk:
✅ Labels
✅ Headings
✅ Body text
✅ Captions
✅ Annotations

Properties:
- Font family (Geist)
- Font size (16px, 24px, etc)
- Font weight (400, 600, 700)
- Line height (1.5, 1.2, etc)
- Color
- Text alignment
- Letter spacing
```

**Example dalam Figma:**

```
TEXT "Button Label"
├── Font: Geist
├── Size: 16px
├── Weight: 700 (bold)
├── Color: #FFFFFF (white)
├── Align: Center
└── Line-height: 1
```

### 3. VECTOR/SVG (Path Element)

```
Digunakan untuk:
✅ Icons (dashboard, settings, menu)
✅ Lines dan patterns
✅ Custom shapes
✅ Logos
✅ Illustrations

Format:
- SVG path data (dibuat via Illustrator atau paste SVG code)
- Bisa scalable tanpa lose quality
- Bisa di-color dengan fill/stroke

Beda dengan IMAGE:
- VECTOR: Scalable, editable, dapat stroke/fill
- IMAGE: Raster, tidak scalable, fixed resolution
```

**Example dalam Figma:**

```
VECTOR "Icon / Dashboard / 24"
├── Path data: M12 2L... (SVG code)
├── Size: 24×24px
├── Fill: #2563EB
├── Stroke: none
└── COMPONENT (buat reusable)
```

### 4. IMAGE (Raster Element)

```
Digunakan untuk:
✅ Screenshots
✅ Photos
✅ Complex illustrations
✅ Background images
✅ Mockups

Format:
- PNG, JPG, WebP, SVG file upload
- Fixed resolution
- Tidak bisa scale without quality loss
- Bisa mask atau crop
```

**Example dalam Figma:**

```
FRAME "Landing - Desktop" (1920×1080px)
├── IMAGE "Landing Screenshot"
│   ├── Source: desktop-landing.png
│   ├── Dimensions: 1920×1080
│   ├── Constraints: Fix size
│   └── Opacity: 100%
```

### 5. COMPONENT (Reusable Master)

```
Digunakan untuk:
✅ Buttons (dengan variants)
✅ Cards (dengan variants)
✅ Input fields
✅ Badges
✅ Icons
✅ Any repeating UI pattern

Benefits:
- Create once, use many times
- Change master, all instances update
- Create variants (hover, disabled, sizes)
- Can use as instances

How to create:
1. Create shape + text (GROUP)
2. Right-click → "Create component"
3. Use as instances throughout design
4. Changes auto-sync
```

**Example dalam Figma:**

```
COMPONENT "Button / Primary"
├── RECTANGLE "Background"
├── TEXT "Label"
└── GROUP

Then:
├── COMPONENT "Button / Primary / Hover" (variant)
├── COMPONENT "Button / Primary / Disabled" (variant)
├── INSTANCE (use in mockups)
└── INSTANCE (auto-updates when master changes)
```

### 6. GROUP (Container, Not Master)

```
Digunakan untuk:
✅ Organizing layers
✅ Moving multiple elements together
✅ Temporary grouping

Beda dari COMPONENT:
- GROUP: Simple folder, no sync
- COMPONENT: Master with synced instances

Ketika gunakan:
- Use GROUP untuk organizing during design
- Convert GROUP → COMPONENT ketika sudah final
```

---

## 📸 LAYER NAMING CONVENTION

Harus pakai format konsisten:

```
[Type] / [Component] / [Variant]

✅ CORRECT:
- Button / Primary
- Button / Primary / Hover
- Card / KPI
- Icon / Dashboard / 24
- Color / Blue / Primary
- Text / H1

❌ WRONG:
- Button1, Button2
- Rectangle 1, shape 2
- Component copy
- element, layer, group
```

---

## 📐 RESPONSIVE VIEWPORT SIZES

Untuk screenshot dan responsive patterns:

```
Mobile: 375×667px
Tablet: 768×1024px (optional)
Desktop: 1920×1080px
```

---

## 🎯 COMPLETE CHECKLIST

Sebelum share Figma file:

```
STRUCTURE:
☐ 8 pages created (Design System, Components, Mobile, Desktop, etc)
☐ Color boards & frames (10+ colors)
☐ Typography boards & frames (6 styles)
☐ Spacing & shadow references

COMPONENTS:
☐ Buttons (6+ variants)
☐ Cards (3+ types)
☐ Badges (4 colors)
☐ Inputs (3+ states)
☐ Icons (10+ icons)

SCREENSHOTS:
☐ Desktop screenshots imported (6 pages)
☐ Mobile screenshots imported (6 pages)
☐ Annotations added

RESPONSIVE:
☐ Card grid patterns
☐ Sidebar patterns
☐ Form patterns
☐ Navigation patterns

DOCUMENTATION:
☐ Color specifications
☐ Typography specifications
☐ Spacing specifications
☐ Component states documented
☐ Developer handoff notes

ORGANIZATION:
☐ All layers named correctly
☐ Unused layers deleted
☐ File saved
☐ Shared with team
```

---

## 📚 DOCUMENTATION FILES

Anda memiliki 7+ file dokumentasi:

```
1. FIGMA_COMPLETE_WORKFLOW.md ⭐
   → Step-by-step dari awal (MULAI DARI SINI!)

2. FIGMA_SETUP_CHECKLIST.md
   → Checklist-friendly format

3. FIGMA_STRUCTURE_GUIDE.md
   → Deep dive architecture

4. FIGMA_LAYER_NAMING.md
   → Naming conventions lengkap

5. FIGMA_QUICK_REFERENCE.md
   → Quick cheat sheet

6. FIGMA_DOCUMENTATION_INDEX.md
   → Map dari semua docs

7. DESIGN_SYSTEM.md
   → Design specifications (not Figma-specific)

Mulai dengan: FIGMA_COMPLETE_WORKFLOW.md
```

---

## ✅ NEXT STEPS

1. **Baca file ini sampai habis** ✓ (Anda sedang membaca!)

2. **Buka FIGMA_COMPLETE_WORKFLOW.md**
   - Ikuti Phase 1 hingga Phase 8
   - Estimated: 2-3 hours

3. **Reference docs saat butuh:**
   - Naming help → FIGMA_LAYER_NAMING.md
   - Quick lookup → FIGMA_QUICK_REFERENCE.md
   - Understanding → FIGMA_STRUCTURE_GUIDE.md

4. **Start building!**
   - Open figma.com
   - Create new file
   - Follow the workflow

---

## 🎓 RINGKASAN

**Struktur Figma yang benar:**

```
FILE (Siapin Design System v1)
├── PAGES (8 halaman)
│   └── BOARDS (organizer)
│       └── FRAMES (containers 1920×1080 atau 375×667)
│           └── ELEMENTS
│               ├── RECTANGLE (color swatches, backgrounds)
│               ├── TEXT (labels, annotations)
│               ├── VECTOR/SVG (icons, patterns)
│               ├── IMAGE (screenshots)
│               └── COMPONENT (reusable buttons, cards, etc)
```

**Key differences:**
- **FILE** = Whole project
- **PAGE** = Tabs (Design System, Components, Mobile, Desktop)
- **BOARD** = Organizer (not exported)
- **FRAME** = Container (can export)
- **RECTANGLE** = Shape (colors, backgrounds)
- **TEXT** = Typography
- **VECTOR** = SVG icons/patterns
- **IMAGE** = Raster screenshots
- **COMPONENT** = Reusable with auto-sync

**Naming format:**
- `Button / Primary` ✅
- `Button / Primary / Hover` ✅
- `Button1` ❌

---

## 🚀 START NOW!

Siap untuk mulai?

1. Go to FIGMA_COMPLETE_WORKFLOW.md
2. Follow Phase 1
3. Take 2-3 hours
4. Buat design system yang awesome!

---

**Good luck! 🎨✨**

Jika ada pertanyaan, lihat file dokumentasi yang tersedia atau search dengan Cmd+F.

