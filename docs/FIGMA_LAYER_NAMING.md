# 📛 Figma Layer Naming Convention & Organization

Panduan lengkap untuk naming dan organizing layers di Figma dengan konsisten.

---

## 🎯 NAMING CONVENTION FORMAT

### Basic Formula:

```
[Type] / [Component] / [Variant] / [State]

Examples:
✅ Button / Primary / Large / Hover
✅ Icon / Dashboard / 24
✅ Badge / Success
✅ Card / KPI / Default
✅ Input / Text / Focus
✅ Text / H1 / Default
```

### Simplified Format (untuk element sederhana):

```
[Purpose] / [State]

Examples:
✅ Button Label
✅ Card Background
✅ Trend Arrow
✅ Success Badge
```

---

## 📊 COMPLETE LAYER STRUCTURE EXAMPLES

### EXAMPLE 1: Button Component Structure

```
📦 COMPONENT: "Button / Primary"
│
├── 🔲 RECTANGLE: "Background"
│   ├─ Fill: #2563EB
│   ├─ Radius: 8px
│   ├─ Size: 120×48px
│   └─ Constraints: Fix width & height
│
├── 📝 TEXT: "Label"
│   ├─ Content: "Button"
│   ├─ Font: Geist 600
│   ├─ Size: 16px
│   ├─ Color: White
│   ├─ Align: Center
│   └─ Constraints: Fix size
│
└── 🎨 EFFECT: Shadow
    └─ 0 2px 4px rgba(0,0,0,0.1)
```

**Correct naming di Figma layers panel:**

```
Button / Primary (COMPONENT)
├── Background
├── Label
└── Shadow
```

**❌ WRONG naming:**

```
✗ Button 1
✗ Rectangle 1
✗ Group copy 3
✗ shape2
✗ text label copy
```

---

### EXAMPLE 2: Card Component Structure

```
📦 COMPONENT: "Card / KPI"
│
├── 🔲 RECTANGLE: "Card Container"
│   ├─ Fill: White
│   ├─ Stroke: 1px #E5E7EB
│   ├─ Radius: 8px
│   └─ Shadow: 0 1px 2px rgba(0,0,0,0.05)
│
├── 🎨 GROUP: "Header"
│   ├── 🔵 CIRCLE: "Icon Background"
│   │   ├─ Fill: #EBF8FF
│   │   └─ Size: 48×48px
│   │
│   ├── 📝 TEXT: "Title"
│   │   ├─ Content: "Total Capital"
│   │   ├─ Font: Geist 500
│   │   ├─ Size: 14px
│   │   └─ Color: #6B7280
│   │
│   └── 📝 TEXT: "Value"
│       ├─ Content: "Rp 50,000,000"
│       ├─ Font: Geist 700
│       ├─ Size: 28px
│       └─ Color: #0F172A
│
├── 🎨 GROUP: "Footer"
│   ├── 📈 VECTOR: "Trend Arrow"
│   │   ├─ Icon: Arrow Up
│   │   └─ Color: #10B981 (green)
│   │
│   └── 📝 TEXT: "Trend Percentage"
│       ├─ Content: "+12.5%"
│       ├─ Color: #10B981
│       └─ Size: 12px
│
└── 🔲 RECTANGLE: "Border" (stroke only)
    └─ Stroke: 1px #E5E7EB
```

**Correct Figma layers panel:**

```
Card / KPI (COMPONENT)
├── Card Container
├── Header
│   ├── Icon Background
│   ├── Title
│   └── Value
├── Footer
│   ├── Trend Arrow
│   └── Trend Percentage
└── Border
```

---

### EXAMPLE 3: Input Field Structure

```
📦 COMPONENT: "Input / Text"
│
├── 🔲 RECTANGLE: "Background & Border"
│   ├─ Fill: White
│   ├─ Stroke: 1px #E5E7EB
│   ├─ Radius: 6px
│   └─ Padding: 12px
│
├── 📝 TEXT: "Placeholder"
│   ├─ Content: "Enter email..."
│   ├─ Font: Geist 400
│   ├─ Size: 14px
│   ├─ Color: #9CA3AF (gray)
│   └─ Opacity: 100%
│
└── 🎯 COMPONENT (instance): "Icon / Search" (optional)
    └─ Position: Left 12px
```

**Figma layers:**

```
Input / Text (COMPONENT)
├── Background & Border
├── Placeholder
└── Icon / Search (instance)
```

---

## 🎨 COLOR ELEMENT NAMING

### For Color Swatches:

```
Format: Color / [Name] / [Variant]

Examples:
✅ Color / Blue / Primary     → #2563EB
✅ Color / Blue / Dark        → #1D4ED8
✅ Color / Blue / Light       → #DBEAFE
✅ Color / Gray / Neutral     → #E5E7EB
✅ Color / Green / Success    → #10B981
✅ Color / Red / Error        → #EF4444
```

**In Figma layers:**

```
Color Library (BOARD)
├── Primary Colors (FRAME)
│   ├── Rectangle "Color / Blue / Primary"
│   ├── Rectangle "Color / Blue / Dark"
│   └── Rectangle "Color / Blue / Light"
├── Neutral Colors (FRAME)
│   ├── Rectangle "Color / Gray / Neutral"
│   ├── Rectangle "Color / Gray / Border"
│   └── Rectangle "Color / Gray / Text"
└── Status Colors (FRAME)
    ├── Rectangle "Color / Green / Success"
    └── Rectangle "Color / Red / Error"
```

---

## 📝 TEXT STYLE NAMING

### For Typography:

```
Format: Text / [Type] / [Size]

Or use Figma Text Styles directly:
- H1
- H2
- H3
- Body
- Body Small
- Label
- Caption
```

**In Figma layers (before applying style):**

```
Typography (BOARD)
├── Headings (FRAME)
│   ├── TEXT "H1 - 32px Bold" (apply H1 style)
│   ├── TEXT "H2 - 24px Bold" (apply H2 style)
│   └── TEXT "H3 - 18px SemiBold" (apply H3 style)
├── Body (FRAME)
│   ├── TEXT "Body - 16px Regular" (apply Body style)
│   └── TEXT "Caption - 14px Regular" (apply Label style)
└── Spec (FRAME)
    └── TEXT "Usage notes..."
```

---

## 🎯 ICON NAMING

### Single Icons:

```
Format: Icon / [Name] / [Size]

Examples:
✅ Icon / Dashboard / 24
✅ Icon / Settings / 24
✅ Icon / ArrowUp / 16
✅ Icon / Check / 24
✅ Icon / Close / 24
```

### Icon Sets (grouped):

```
Format: Icons / [Category]

Examples:
✅ Icons / Navigation (group)
   ├── Icon / Dashboard / 24
   ├── Icon / Settings / 24
   └── Icon / Profile / 24

✅ Icons / Status (group)
   ├── Icon / Success / 24
   ├── Icon / Error / 24
   └── Icon / Warning / 24
```

**In Figma:**

```
Icons & SVG Library (BOARD)
├── Navigation Icons (FRAME)
│   ├── COMPONENT "Icon / Dashboard / 24"
│   │   └── VECTOR: Dashboard SVG
│   ├── COMPONENT "Icon / Settings / 24"
│   │   └── VECTOR: Settings SVG
│   └── COMPONENT "Icon / Menu / 24"
│       └── VECTOR: Menu SVG
├── Status Icons (FRAME)
│   ├── COMPONENT "Icon / Success / 24"
│   │   └── VECTOR: Checkmark SVG
│   ├── COMPONENT "Icon / Error / 24"
│   │   └── VECTOR: X SVG
│   └── COMPONENT "Icon / Warning / 24"
│       └── VECTOR: Alert SVG
└── Trend Icons (FRAME)
    ├── COMPONENT "Icon / TrendUp / 16"
    └── COMPONENT "Icon / TrendDown / 16"
```

---

## 🧩 COMPONENT INSTANCE NAMING

### When using component instances:

```
Format: Instance of [Component Name]

Examples (Figma auto-names):
✅ Button / Primary#2 (instance of Button / Primary)
✅ Badge / Success#1
✅ Input / Text#3

Or manual rename for clarity:
✅ Email Input
✅ Message Button
✅ Success Status Badge
```

---

## 📐 FRAME NAMING

### For organizing designs:

```
Format: [Page Content] / [Component Type] / [Variant]

Examples:
✅ Desktop / Landing / Hero Section
✅ Mobile / Dashboard / KPI Cards
✅ Pattern / Card Grid / 4 Columns
✅ Specification / Colors / Primary
✅ Responsive / Header / Desktop
```

**In Figma panels:**

```
Page: 💻 Desktop (1920px)
├── BOARD "Desktop Views"
│   ├── FRAME "Landing - Desktop" (1920×1080)
│   │   └── IMAGE "Landing Screenshot"
│   ├── FRAME "Dashboard - Desktop" (1920×1080)
│   │   └── IMAGE "Dashboard Screenshot"
│   └── FRAME "Manajemen - Desktop" (1920×1080)
│       └── IMAGE "Manajemen Screenshot"
│
└── BOARD "Desktop Specifications"
    ├── FRAME "Grid (12 columns)" (1920×100)
    └── FRAME "Layout Patterns" (1600×400)
```

---

## 🏗️ FULL FOLDER STRUCTURE IN FIGMA

```
FILE: "Siapin Design System v1"
│
├─ PAGE: "🎨 Design System"
│  │
│  ├─ BOARD: "Color Library" (1200×800)
│  │  ├─ FRAME: "Primary Colors" (300×200)
│  │  │  ├─ RECTANGLE: "Color / Blue / Primary"
│  │  │  └─ TEXT: "Blue\n#2563EB"
│  │  ├─ FRAME: "Neutral Colors" (300×200)
│  │  │  ├─ RECTANGLE: "Color / Gray / Light"
│  │  │  └─ TEXT: "Gray Light\n#F8F9FA"
│  │  └─ FRAME: "Status Colors" (300×200)
│  │     ├─ RECTANGLE: "Color / Green / Success"
│  │     └─ TEXT: "Success\n#10B981"
│  │
│  ├─ BOARD: "Typography" (800×600)
│  │  ├─ FRAME: "Headings" (600×200)
│  │  │  ├─ TEXT: "H1 - 32px Bold" [apply H1 style]
│  │  │  ├─ TEXT: "H2 - 24px Bold" [apply H2 style]
│  │  │  └─ TEXT: "H3 - 18px SemiBold" [apply H3 style]
│  │  └─ FRAME: "Body & Small" (600×200)
│  │     ├─ TEXT: "Body - 16px Regular" [apply Body style]
│  │     └─ TEXT: "Caption - 12px Medium" [apply Label style]
│  │
│  ├─ BOARD: "Spacing & Shadows" (600×500)
│  │  ├─ FRAME: "Spacing Scale" (600×200)
│  │  │  ├─ RECTANGLE: "Spacing / 4px"
│  │  │  ├─ RECTANGLE: "Spacing / 8px"
│  │  │  └─ RECTANGLE: "Spacing / 16px"
│  │  └─ FRAME: "Shadows" (600×200)
│  │     ├─ RECTANGLE: "Shadow / Small"
│  │     ├─ RECTANGLE: "Shadow / Medium"
│  │     └─ RECTANGLE: "Shadow / Hover"
│  │
│  └─ BOARD: "Effects & Radius" (400×300)
│     ├─ RECTANGLE: "Radius / 6px"
│     ├─ RECTANGLE: "Radius / 8px"
│     └─ RECTANGLE: "Radius / 16px"
│
├─ PAGE: "📦 Components"
│  │
│  ├─ BOARD: "Buttons" (1200×600)
│  │  ├─ FRAME: "Primary States" (400×300)
│  │  │  ├─ COMPONENT "Button / Primary"
│  │  │  │  ├─ RECTANGLE: "Background"
│  │  │  │  ├─ TEXT: "Label"
│  │  │  │  └─ GROUP: "Container"
│  │  │  ├─ COMPONENT "Button / Primary / Hover"
│  │  │  ├─ COMPONENT "Button / Primary / Disabled"
│  │  │  └─ COMPONENT "Button / Primary / Loading"
│  │  └─ FRAME: "Sizes" (400×300)
│  │     ├─ COMPONENT "Button / Primary / Small"
│  │     ├─ COMPONENT "Button / Primary / Medium"
│  │     └─ COMPONENT "Button / Primary / Large"
│  │
│  ├─ BOARD: "Cards" (1200×600)
│  │  ├─ FRAME: "Card Variations" (600×300)
│  │  │  ├─ COMPONENT "Card / Default"
│  │  │  │  ├─ RECTANGLE: "Card Container"
│  │  │  │  ├─ TEXT: "Title"
│  │  │  │  └─ TEXT: "Description"
│  │  │  ├─ COMPONENT "Card / KPI"
│  │  │  │  ├─ GROUP: "Header"
│  │  │  │  │  ├─ CIRCLE: "Icon Background"
│  │  │  │  │  └─ TEXT: "Title"
│  │  │  │  ├─ TEXT: "Value"
│  │  │  │  └─ GROUP: "Footer"
│  │  │  │     └─ VECTOR: "Trend Arrow"
│  │  │  └─ COMPONENT "Card / Transaction"
│  │  └─ FRAME: "Card States" (600×300)
│  │     ├─ COMPONENT "Card / Hover"
│  │     └─ COMPONENT "Card / Active"
│  │
│  ├─ BOARD: "Badges" (800×300)
│  │  ├─ COMPONENT "Badge / Success"
│  │  │  ├─ RECTANGLE: "Background"
│  │  │  └─ TEXT: "Label"
│  │  ├─ COMPONENT "Badge / Error"
│  │  ├─ COMPONENT "Badge / Warning"
│  │  └─ COMPONENT "Badge / Neutral"
│  │
│  ├─ BOARD: "Inputs" (800×400)
│  │  ├─ COMPONENT "Input / Text"
│  │  │  ├─ RECTANGLE: "Background & Border"
│  │  │  └─ TEXT: "Placeholder"
│  │  ├─ COMPONENT "Input / Focus"
│  │  ├─ COMPONENT "Input / Error"
│  │  └─ COMPONENT "Input / Disabled"
│  │
│  └─ BOARD: "Form Elements" (600×300)
│     ├─ COMPONENT "Label / Default"
│     ├─ COMPONENT "Checkbox / Default"
│     └─ COMPONENT "Radio / Default"
│
├─ PAGE: "📱 Mobile (375px)"
│  │
│  ├─ BOARD: "Mobile Views" (400×3000)
│  │  ├─ FRAME: "Landing - Mobile" (375×1800)
│  │  │  ├─ IMAGE: "Landing Screenshot"
│  │  │  └─ TEXT: "Annotation: Mobile hero section"
│  │  ├─ FRAME: "Dashboard - Mobile" (375×2000)
│  │  │  ├─ IMAGE: "Dashboard Screenshot"
│  │  │  └─ TEXT: "Annotation: Stacked cards"
│  │  └─ FRAME: "Kalender - Mobile" (375×1500)
│  │     ├─ IMAGE: "Calendar Screenshot"
│  │     └─ TEXT: "Annotation: Full-width calendar"
│  │
│  └─ BOARD: "Mobile Specifications" (600×600)
│     ├─ FRAME: "Mobile Grid (375px)" (375×200)
│     │  ├─ RECTANGLE: "Viewport"
│     │  ├─ VECTOR/LINES: "Padding guides"
│     │  └─ TEXT: "Padding: 16px left/right"
│     ├─ FRAME: "Safe Areas" (375×200)
│     │  ├─ RECTANGLE: "Content area (343px)"
│     │  └─ TEXT: "Safe area notes"
│     └─ FRAME: "Touch Targets" (200×300)
│        ├─ RECTANGLE: "44×44 (min)"
│        ├─ RECTANGLE: "56×56 (recommended)"
│        └─ TEXT: "Touch target sizes"
│
├─ PAGE: "💻 Desktop (1920px)"
│  │
│  ├─ BOARD: "Desktop Views" (2000×5000)
│  │  ├─ FRAME: "Landing - Desktop" (1920×1080)
│  │  │  ├─ IMAGE: "Landing Screenshot"
│  │  │  └─ TEXT: "Annotation: 3-column feature grid"
│  │  ├─ FRAME: "Dashboard - Desktop" (1920×1080)
│  │  │  ├─ IMAGE: "Dashboard Screenshot"
│  │  │  ├─ TEXT: "Annotation: KPI grid (4 columns)"
│  │  │  └─ TEXT: "Annotation: Sidebar layout (33%)"
│  │  └─ FRAME: "Kalender - Desktop" (1920×1080)
│  │     ├─ IMAGE: "Calendar Screenshot"
│  │     └─ TEXT: "Annotation: Calendar + sidebar"
│  │
│  └─ BOARD: "Desktop Specifications" (1600×800)
│     ├─ FRAME: "Desktop Grid (1920px)" (1600×150)
│     │  ├─ RECTANGLE: "Viewport (1920px)"
│     │  ├─ VECTOR/LINES: "12-column grid"
│     │  ├─ VECTOR/LINES: "Gutter guides (16px)"
│     │  └─ TEXT: "Grid specifications"
│     ├─ FRAME: "Layout Patterns" (1600×300)
│     │  ├─ RECTANGLE: "2-column (66% + 33%)"
│     │  ├─ RECTANGLE: "3-column equal"
│     │  ├─ RECTANGLE: "4-column equal"
│     │  └─ RECTANGLE: "Full width"
│     └─ FRAME: "Breakpoint Reference" (800×200)
│        ├─ RECTANGLE: "Mobile: 375px"
│        ├─ RECTANGLE: "Tablet: 768px"
│        └─ RECTANGLE: "Desktop: 1920px"
│
├─ PAGE: "📐 Responsive Patterns"
│  │
│  ├─ BOARD: "Layout Patterns" (1800×1200)
│  │  ├─ FRAME: "Card Grid - Desktop" (600×300)
│  │  │  ├─ RECTANGLE: "Card 1" (280×200)
│  │  │  ├─ RECTANGLE: "Card 2" (280×200)
│  │  │  ├─ RECTANGLE: "Card 3" (280×200)
│  │  │  ├─ RECTANGLE: "Card 4" (280×200)
│  │  │  └─ TEXT: "Gap: 16px"
│  │  ├─ FRAME: "Card Grid - Tablet" (500×300)
│  │  │  ├─ RECTANGLE: "Card 1" (360×200)
│  │  │  ├─ RECTANGLE: "Card 2" (360×200)
│  │  │  └─ TEXT: "Gap: 16px"
│  │  └─ FRAME: "Card Grid - Mobile" (375×300)
│  │     ├─ RECTANGLE: "Card 1" (full-width)
│  │     └─ TEXT: "Full width - 16px padding"
│  │
│  ├─ BOARD: "Sidebar Patterns" (1600×800)
│  │  ├─ FRAME: "Desktop - 66/33" (1600×400)
│  │  │  ├─ RECTANGLE: "Main content (66%)"
│  │  │  └─ RECTANGLE: "Sidebar (33%)"
│  │  ├─ FRAME: "Tablet - 60/40" (800×400)
│  │  │  ├─ RECTANGLE: "Main (60%)"
│  │  │  └─ RECTANGLE: "Sidebar (40%)"
│  │  └─ FRAME: "Mobile - Stacked" (375×400)
│  │     ├─ RECTANGLE: "Main (100%)"
│  │     └─ RECTANGLE: "Sidebar (100%)"
│  │
│  └─ BOARD: "Form Patterns" (1200×600)
│     ├─ FRAME: "Desktop Form" (600×400)
│     │  ├─ TEXT: "Label 1"
│     │  ├─ INSTANCE "Input / Text"
│     │  ├─ TEXT: "Label 2"
│     │  ├─ RECTANGLE: "Textarea"
│     │  └─ INSTANCE "Button / Primary"
│     └─ FRAME: "Mobile Form" (375×400)
│        ├─ TEXT: "Label 1"
│        ├─ INSTANCE "Input / Text" (full-width)
│        ├─ TEXT: "Label 2"
│        ├─ RECTANGLE: "Textarea" (full-width)
│        └─ INSTANCE "Button / Primary" (full-width)
│
├─ PAGE: "🎯 Icons & SVG Library"
│  │
│  ├─ BOARD: "UI Icons" (800×600)
│  │  ├─ FRAME: "Navigation Icons" (400×300)
│  │  │  ├─ COMPONENT "Icon / Dashboard / 24"
│  │  │  │  └─ VECTOR: SVG path
│  │  │  ├─ COMPONENT "Icon / Settings / 24"
│  │  │  │  └─ VECTOR: SVG path
│  │  │  └─ COMPONENT "Icon / Menu / 24"
│  │  │     └─ VECTOR: SVG path
│  │  └─ FRAME: "Status Icons" (400×300)
│  │     ├─ COMPONENT "Icon / Success / 24"
│  │     ├─ COMPONENT "Icon / Error / 24"
│  │     └─ COMPONENT "Icon / Warning / 24"
│  │
│  ├─ BOARD: "Trend Icons" (400×300)
│  │  ├─ COMPONENT "Icon / TrendUp / 16" (green)
│  │  └─ COMPONENT "Icon / TrendDown / 16" (red)
│  │
│  └─ BOARD: "SVG Patterns" (800×400)
│     ├─ VECTOR: "Dot Pattern"
│     ├─ VECTOR: "Line Pattern"
│     └─ VECTOR: "Grid Pattern"
│
├─ PAGE: "📋 Specifications & Annotations"
│  │
│  ├─ BOARD: "Color Specs" (800×1000)
│  │  ├─ FRAME: "Primary Blue" (600×150)
│  │  │  ├─ RECTANGLE: "Color swatch"
│  │  │  └─ TEXT: "HEX: #2563EB | RGB: 37, 99, 235 | HSL: 219°, 88%, 50% | Usage: Buttons..."
│  │  ├─ FRAME: "Success Green" (600×150)
│  │  │  ├─ RECTANGLE: "Color swatch"
│  │  │  └─ TEXT: "HEX: #10B981 | RGB: 16, 185, 129 | Usage: Success states..."
│  │  └─ FRAME: "Error Red" (600×150)
│  │     ├─ RECTANGLE: "Color swatch"
│  │     └─ TEXT: "HEX: #EF4444 | RGB: 239, 68, 68 | Usage: Error states..."
│  │
│  ├─ BOARD: "Typography Specs" (800×800)
│  │  ├─ FRAME: "H1 Specification" (600×200)
│  │  │  ├─ TEXT: "The quick brown fox" (32px bold)
│  │  │  └─ TEXT: "Font: Geist | Weight: 700 | Size: 32px | Line-height: 1.2 | Usage: Page titles"
│  │  ├─ FRAME: "Body Specification" (600×200)
│  │  │  ├─ TEXT: "The quick brown fox jumps over the lazy dog" (16px regular)
│  │  │  └─ TEXT: "Font: Geist | Weight: 400 | Size: 16px | Line-height: 1.5"
│  │  └─ FRAME: "Caption Specification" (600×200)
│  │     ├─ TEXT: "Caption text" (12px medium)
│  │     └─ TEXT: "Font: Geist | Weight: 500 | Size: 12px"
│  │
│  └─ BOARD: "Spacing & Effect Specs" (600×600)
│     ├─ FRAME: "Spacing Scale" (600×200)
│     │  └─ TEXT: "xs: 4px | sm: 8px | md: 12px | base: 16px | lg: 24px | xl: 32px | 2xl: 48px"
│     └─ FRAME: "Shadow Effects" (600×200)
│        └─ TEXT: "sm: 0 1px 2px | md: 0 4px 6px | hover: 0 10px 15px"
│
└─ PAGE: "📖 Developer Handoff Notes"
   │
   ├─ BOARD: "CSS & Code Reference" (1000×1200)
   │  ├─ FRAME: "Tailwind Classes" (900×400)
   │  │  └─ TEXT: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg..."
   │  ├─ FRAME: "Component Variants" (900×400)
   │  │  └─ TEXT: "Button variants: Primary, Secondary, Disabled, Loading"
   │  └─ FRAME: "Responsive Breakpoints" (900×400)
   │     └─ TEXT: "Mobile: 0-639px | Tablet: 640-1023px | Desktop: 1024px+"
   │
   ├─ BOARD: "Interaction Specs" (1000×600)
   │  ├─ FRAME: "Button Hover" (450×300)
   │  │  ├─ TEXT: "Before: #2563EB"
   │  │  ├─ TEXT: "After: #1D4ED8"
   │  │  ├─ TEXT: "Transition: 150ms ease-in-out"
   │  │  └─ TEXT: "Shadow increases (sm → md)"
   │  └─ FRAME: "Card Hover" (450×300)
   │     └─ TEXT: "Shadow increases slightly"
   │
   └─ BOARD: "Links & Resources" (800×400)
      ├─ TEXT: "Code: github.com/..."
      ├─ TEXT: "Deploy: vercel.com"
      └─ TEXT: "Design: figma.com/..."
```

---

## ✨ BEST PRACTICES SUMMARY

### ✅ DO USE:

```
✅ Button / Primary
✅ Button / Primary / Hover
✅ Card / KPI
✅ Badge / Success
✅ Icon / Dashboard / 24
✅ Color / Blue / Primary
✅ Input / Text / Focus
✅ Text / H1
✅ Pattern / Grid / Desktop
✅ Frame / Landing - Desktop
```

### ❌ DON'T USE:

```
❌ Button1, Button2, Button3
❌ Rectangle 1, Rectangle 2
❌ Group copy 3, Group copy 4
❌ shape, text, element
❌ Frame 123, Frame copy
❌ Layer, Layer 2, Layer 3
❌ Component 1, Component 2
❌ Image, Image copy
❌ button-primary, button_primary
❌ BtnPrimary, BTN_PRIMARY
```

---

## 🎯 KEY PRINCIPLES

### 1. **Hierarchical Naming**

```
Specific → General

✅ Button / Primary / Hover
   ↑        ↑         ↑
   What    Which     State
```

### 2. **Consistency Across All Layers**

Gunakan naming yang sama di:
- Figma layers
- Design tokens
- CSS classes
- Component props

```
Figma:      Button / Primary / Hover
CSS class:  button-primary-hover
Tailwind:   bg-blue-700 hover:shadow-md
Component:  variant="primary" state="hover"
```

### 3. **Avoid Magic Numbers**

```
❌ Wrong:
Layer name: Rectangle 1 (tapi dimensinya 120x48px)

✅ Right:
Layer name: Background (ukuran jelas dari besar layer)
```

### 4. **Use Separators Consistently**

```
Primary separator: / (slash)
   Button / Primary / Hover

Alternative separators:
- Dash: button-primary-hover
- Underscore: button_primary_hover
- Camel case: buttonPrimaryHover

Pick ONE dan gunakan di semua file!
```

---

## 📦 APPLYING TO YOUR FIGMA FILE

**Mulai dari sini:**

1. [ ] Baca panduan ini
2. [ ] Lihat contoh struktur di atas
3. [ ] Ikuti FIGMA_SETUP_CHECKLIST.md
4. [ ] Apply naming convention pada semua layers
5. [ ] Dokumentasikan naming standard di project

**Test naming konsistensi:**

- [ ] Buka Layers panel
- [ ] Search sebuah element (Cmd+F)
- [ ] Apakah nama deskriptif dan mudah dicari?
- [ ] Apakah mengikuti format [Type] / [Component] / [Variant]?

---

**Good luck! 🚀 Consistent naming = better collaboration!**
