# 🎨 Panduan Struktur Figma dengan Frame, Vector, Element & SVG

Panduan lengkap cara mengorganisir export ke Figma dengan struktur yang jelas dan professional.

---

## 📊 STRUKTUR FIGMA YANG BENAR

### Hierarchy Figma (dari atas ke bawah):

```
FILE
├── PAGE 1: "🎨 Design System"
│   ├── BOARD: "Color Library"
│   │   ├── FRAME: "Primary Colors"
│   │   │   ├── ELEMENT: Rectangle (Blue #2563EB)
│   │   │   ├── ELEMENT: Rectangle (Blue Dark #1D4ED8)
│   │   │   └── ELEMENT: Text "Primary Blue"
│   │   ├── FRAME: "Neutral Colors"
│   │   │   ├── ELEMENT: Rectangle (White)
│   │   │   ├── ELEMENT: Rectangle (Gray #F8F9FA)
│   │   │   └── TEXT: Color names
│   │   └── FRAME: "Status Colors"
│   │       ├── ELEMENT: Rectangle (Green #10B981)
│   │       ├── ELEMENT: Rectangle (Red #EF4444)
│   │       └── TEXT: Labels
│   │
│   ├── BOARD: "Typography Styles"
│   │   ├── FRAME: "Headings"
│   │   │   ├── TEXT: "H1 - 32px Bold"
│   │   │   ├── TEXT: "H2 - 24px Bold"
│   │   │   └── TEXT: "H3 - 18px SemiBold"
│   │   └── FRAME: "Body Text"
│   │       ├── TEXT: "Body - 16px Regular"
│   │       └── TEXT: "Caption - 14px Regular"
│   │
│   ├── BOARD: "Spacing Reference"
│   │   ├── FRAME: "Spacing Scale"
│   │   │   ├── RECTANGLE: "4px" (labeled xs)
│   │   │   ├── RECTANGLE: "8px" (labeled sm)
│   │   │   ├── RECTANGLE: "12px" (labeled md)
│   │   │   ├── RECTANGLE: "16px" (labeled base)
│   │   │   ├── RECTANGLE: "24px" (labeled lg)
│   │   │   ├── RECTANGLE: "32px" (labeled xl)
│   │   │   └── RECTANGLE: "48px" (labeled 2xl)
│   │   └── FRAME: "Common Sizes"
│   │       ├── RECTANGLE: "44px" (min touch target)
│   │       ├── RECTANGLE: "56px" (button height)
│   │       └── RECTANGLE: "64px" (header height)
│   │
│   └── BOARD: "Shadows & Effects"
│       ├── FRAME: "Shadow Small"
│       │   └── RECTANGLE: With shadow (0 1px 2px rgba(0,0,0,0.05))
│       ├── FRAME: "Shadow Medium"
│       │   └── RECTANGLE: With shadow (0 4px 6px rgba(0,0,0,0.1))
│       └── FRAME: "Shadow Hover"
│           └── RECTANGLE: With shadow (0 10px 15px rgba(0,0,0,0.15))
│
│
├── PAGE 2: "📦 Components"
│   ├── SECTION: "Buttons"
│   │   ├── COMPONENT: "Button / Primary"
│   │   │   ├── RECTANGLE: Background (blue #2563EB, radius 8)
│   │   │   ├── TEXT: "Label" (white, 16px bold)
│   │   │   └── ICON: Optional left icon
│   │   ├── COMPONENT: "Button / Primary / Hover"
│   │   │   ├── RECTANGLE: Background (blue #1D4ED8)
│   │   │   ├── TEXT: "Label"
│   │   │   └── EFFECT: Hover shadow
│   │   ├── COMPONENT: "Button / Secondary"
│   │   ├── COMPONENT: "Button / Disabled"
│   │   └── VARIANT: All size variants (sm, md, lg)
│   │
│   ├── SECTION: "Cards"
│   │   ├── COMPONENT: "Card / Default"
│   │   │   ├── RECTANGLE: Background (white, border #E5E7EB, radius 8)
│   │   │   ├── VECTOR/RECTANGLE: Border stroke (1px)
│   │   │   ├── FRAME: "Content Area"
│   │   │   │   ├── TEXT: Title
│   │   │   │   └── TEXT: Description
│   │   │   └── SHADOW: sm
│   │   ├── COMPONENT: "Card / KPI"
│   │   │   ├── RECTANGLE: Background
│   │   │   ├── FRAME: "Header"
│   │   │   │   ├── TEXT: Title
│   │   │   │   ├── ICON: Metric icon (48x48)
│   │   │   │   └── ELEMENT: Trend indicator
│   │   │   └── FRAME: "Value"
│   │   │       ├── TEXT: Large number
│   │   │       └── TEXT: Percentage change
│   │   └── COMPONENT: "Card / Transaction"
│   │       ├── FRAME: "Left"
│   │       │   ├── ICON: Category icon
│   │       │   └── TEXT: Description
│   │       └── FRAME: "Right"
│   │           ├── TEXT: Amount
│   │           └── BADGE: Status
│   │
│   ├── SECTION: "Badges"
│   │   ├── COMPONENT: "Badge / Success"
│   │   │   ├── RECTANGLE: bg-emerald-100, radius 20
│   │   │   └── TEXT: Label (emerald-700)
│   │   ├── COMPONENT: "Badge / Error"
│   │   ├── COMPONENT: "Badge / Warning"
│   │   └── COMPONENT: "Badge / Neutral"
│   │
│   ├── SECTION: "Inputs"
│   │   ├── COMPONENT: "Input / Text"
│   │   │   ├── RECTANGLE: Background (white, border #E5E7EB)
│   │   │   ├── TEXT: Placeholder text
│   │   │   └── VECTOR: Focus state border
│   │   ├── COMPONENT: "Input / Focus State"
│   │   ├── COMPONENT: "Input / Error State"
│   │   └── COMPONENT: "Input / Disabled State"
│   │
│   └── SECTION: "Icons & Indicators"
│       ├── COMPONENT: "Icon / Trend Up"
│       │   └── SVG: Upward arrow (green, 24x24)
│       ├── COMPONENT: "Icon / Trend Down"
│       │   └── SVG: Downward arrow (red, 24x24)
│       ├── COMPONENT: "Status / Loading"
│       │   └── VECTOR: Spinner animation-ready
│       └── COMPONENT: "Indicator / Dot"
│           ├── CIRCLE: 8px radius
│           └── VARIANT: Color variants (green, red, yellow)
│
│
├── PAGE 3: "📱 Mobile (375px)"
│   ├── BOARD: "Mobile Views"
│   │   ├── FRAME: "Landing - Mobile"
│   │   │   ├── IMAGE: Screenshot (mobile-landing.png)
│   │   │   └── ANNOTATION: Responsive notes
│   │   ├── FRAME: "Dashboard - Mobile"
│   │   │   ├── IMAGE: Screenshot (mobile-dashboard.png)
│   │   │   ├── ANNOTATION: Stacked layout
│   │   │   └── ANNOTATION: Touch targets (44px min)
│   │   ├── FRAME: "Manajemen - Mobile"
│   │   │   ├── IMAGE: Screenshot (mobile-manajemen.png)
│   │   │   └── ANNOTATION: Table scroll behavior
│   │   └── FRAME: "Kalender - Mobile"
│   │       ├── IMAGE: Screenshot (mobile-kalender.png)
│   │       └── ANNOTATION: Calendar responsive
│   │
│   └── BOARD: "Mobile Specifications"
│       ├── FRAME: "Mobile Grid (375px)"
│       │   ├── RECTANGLE: Viewport (375x667)
│       │   ├── VECTOR/LINE: Padding guides (16px)
│       │   ├── VECTOR/LINE: Column guides (1 column)
│       │   └── TEXT: Annotations
│       ├── FRAME: "Safe Areas"
│       │   ├── RECTANGLE: Content area (343px width)
│       │   ├── TEXT: "Padding: 16px left/right"
│       │   └── TEXT: "Bottom safe area: 34px (iPhone notch)"
│       └── FRAME: "Touch Targets"
│           ├── RECTANGLE: 44x44 (minimum)
│           ├── RECTANGLE: 56x56 (recommended)
│           └── RECTANGLE: 64x64 (comfortable)
│
│
├── PAGE 4: "💻 Desktop (1920px)"
│   ├── BOARD: "Desktop Views"
│   │   ├── FRAME: "Landing - Desktop"
│   │   │   ├── IMAGE: Screenshot (desktop-landing.png)
│   │   │   ├── ANNOTATION: Hero section
│   │   │   └── ANNOTATION: Feature grid (3 columns)
│   │   ├── FRAME: "Dashboard - Desktop"
│   │   │   ├── IMAGE: Screenshot (desktop-dashboard.png)
│   │   │   ├── ANNOTATION: KPI grid (4 columns)
│   │   │   ├── ANNOTATION: Sidebar layout
│   │   │   └── ANNOTATION: Chart area
│   │   ├── FRAME: "Manajemen - Desktop"
│   │   │   ├── IMAGE: Screenshot (desktop-manajemen.png)
│   │   │   └── ANNOTATION: Full table visible
│   │   └── FRAME: "Kalender - Desktop"
│   │       ├── IMAGE: Screenshot (desktop-kalender.png)
│   │       └── ANNOTATION: Calendar + event sidebar
│   │
│   └── BOARD: "Desktop Specifications"
│       ├── FRAME: "Desktop Grid (1920px)"
│       │   ├── RECTANGLE: Viewport (1920x1080)
│       │   ├── VECTOR/LINES: 12-column grid (160px per column)
│       │   ├── VECTOR/LINES: Gutter guides (16px)
│       │   └── TEXT: Annotations
│       ├── FRAME: "Layout Patterns"
│       │   ├── RECTANGLE: 2-column (66% + 33%)
│       │   ├── RECTANGLE: 3-column equal
│       │   ├── RECTANGLE: 4-column equal
│       │   └── RECTANGLE: Full width
│       └── FRAME: "Responsive Breakpoints"
│           ├── TEXT: "Mobile: 375px (1 col)"
│           ├── TEXT: "Tablet: 768px (2 col)"
│           └── TEXT: "Desktop: 1920px (3-4 col)"
│
│
├── PAGE 5: "📐 Responsive Patterns"
│   ├── SECTION: "Pattern: Card Grid"
│   │   ├── FRAME: "Desktop - 4 Columns"
│   │   │   ├── RECTANGLE: Card 1
│   │   │   ├── RECTANGLE: Card 2
│   │   │   ├── RECTANGLE: Card 3
│   │   │   ├── RECTANGLE: Card 4
│   │   │   └── ANNOTATION: "280px width, 16px gap"
│   │   ├── FRAME: "Tablet - 2 Columns"
│   │   │   ├── RECTANGLE: Card 1
│   │   │   ├── RECTANGLE: Card 2
│   │   │   └── ANNOTATION: "360px width, 16px gap"
│   │   └── FRAME: "Mobile - 1 Column"
│   │       ├── RECTANGLE: Card 1
│   │       └── ANNOTATION: "Full width - 32px padding"
│   │
│   ├── SECTION: "Pattern: Sidebar Layout"
│   │   ├── FRAME: "Desktop (66% + 33%)"
│   │   │   ├── RECTANGLE: Main content area
│   │   │   ├── RECTANGLE: Sidebar
│   │   │   └── ANNOTATION: "24px gap"
│   │   ├── FRAME: "Tablet (60% + 40%)"
│   │   └── FRAME: "Mobile (100% Stacked)"
│   │
│   ├── SECTION: "Pattern: Header / Navigation"
│   │   ├── FRAME: "Desktop Navigation"
│   │   │   ├── RECTANGLE: Logo
│   │   │   ├── FRAME: "Nav Links"
│   │   │   │   ├── TEXT: "Home"
│   │   │   │   ├── TEXT: "Dashboard"
│   │   │   │   └── TEXT: "More..."
│   │   │   └── ANNOTATION: "Height: 64px"
│   │   ├── FRAME: "Mobile Navigation"
│   │   │   ├── RECTANGLE: Logo
│   │   │   ├── ICON: Hamburger menu
│   │   │   └── ANNOTATION: "Touch target: 56x56"
│   │   └── FRAME: "Mobile Menu (Expanded)"
│   │       ├── RECTANGLE: Menu background (overlay)
│   │       ├── TEXT: "Home"
│   │       ├── TEXT: "Dashboard"
│   │       └── TEXT: "More..."
│   │
│   └── SECTION: "Pattern: Forms & Inputs"
│       ├── FRAME: "Desktop Form"
│       │   ├── LABEL: "Email"
│       │   ├── INPUT: Text field (44px height)
│       │   ├── LABEL: "Message"
│       │   ├── TEXTAREA: Text area (120px height)
│       │   └── BUTTON: Submit
│       ├── FRAME: "Mobile Form"
│       │   ├── LABEL: "Email"
│       │   ├── INPUT: Full width
│       │   ├── LABEL: "Message"
│       │   ├── TEXTAREA: Full width
│       │   └── BUTTON: Full width (56px height)
│       └── ANNOTATION: "Mobile inputs: 56px min height for keyboard compatibility"
│
│
├── PAGE 6: "🎯 Icons & SVG Library"
│   ├── SECTION: "UI Icons (24x24)"
│   │   ├── COMPONENT: "Icon / Dashboard"
│   │   │   └── SVG: House/Dashboard icon
│   │   ├── COMPONENT: "Icon / Settings"
│   │   │   └── SVG: Gear icon
│   │   ├── COMPONENT: "Icon / Menu"
│   │   │   └── SVG: Hamburger menu
│   │   ├── COMPONENT: "Icon / Search"
│   │   │   └── SVG: Magnifying glass
│   │   └── COMPONENT: "Icon / Close"
│   │       └── SVG: X icon
│   │
│   ├── SECTION: "Status Icons (24x24)"
│   │   ├── COMPONENT: "Icon / Success"
│   │   │   └── SVG: Checkmark (green)
│   │   ├── COMPONENT: "Icon / Error"
│   │   │   └── SVG: X mark (red)
│   │   ├── COMPONENT: "Icon / Warning"
│   │   │   └── SVG: Exclamation (orange)
│   │   └── COMPONENT: "Icon / Info"
│   │       └── SVG: Info circle (blue)
│   │
│   ├── SECTION: "Trend Icons (16x16)"
│   │   ├── COMPONENT: "Icon / Trend Up"
│   │   │   └── SVG: Arrow up (green)
│   │   ├── COMPONENT: "Icon / Trend Down"
│   │   │   └── SVG: Arrow down (red)
│   │   └── COMPONENT: "Icon / Trend Neutral"
│   │       └── SVG: Dash (gray)
│   │
│   ├── SECTION: "Feature Icons (48x48)"
│   │   ├── COMPONENT: "Icon / Analytics"
│   │   │   └── SVG: Chart/graph icon
│   │   ├── COMPONENT: "Icon / Security"
│   │   │   └── SVG: Lock icon
│   │   ├── COMPONENT: "Icon / Users"
│   │   │   └── SVG: Multiple users
│   │   ├── COMPONENT: "Icon / Clock"
│   │   │   └── SVG: Clock icon
│   │   ├── COMPONENT: "Icon / Rocket"
│   │   │   └── SVG: Rocket icon
│   │   └── COMPONENT: "Icon / Globe"
│   │       └── SVG: Globe icon
│   │
│   └── SECTION: "SVG Patterns (tiling)"
│       ├── VECTOR: Dot pattern (4x4)
│       ├── VECTOR: Line pattern (horizontal)
│       ├── VECTOR: Gradient pattern
│       └── VECTOR: Grid pattern
│
│
├── PAGE 7: "📋 Specifications & Annotations"
│   ├── SECTION: "Color Specifications"
│   │   ├── FRAME: "Primary Blue"
│   │   │   ├── RECTANGLE: #2563EB (filled)
│   │   │   ├── TEXT: "HEX: #2563EB"
│   │   │   ├── TEXT: "RGB: 37, 99, 235"
│   │   │   ├── TEXT: "HSL: 219°, 88%, 50%"
│   │   │   └── TEXT: "Usage: Buttons, links, active states"
│   │   ├── FRAME: "Neutral White"
│   │   │   ├── RECTANGLE: #FFFFFF
│   │   │   └── TEXT: "HEX: #FFFFFF"
│   │   └── FRAME: "Success Green"
│   │       ├── RECTANGLE: #10B981
│   │       └── TEXT: "HEX: #10B981"
│   │
│   ├── SECTION: "Typography Specifications"
│   │   ├── FRAME: "H1 (32px / 700)"
│   │   │   ├── TEXT: "The quick brown fox"
│   │   │   ├── TEXT: "Font: Geist"
│   │   │   ├── TEXT: "Size: 32px"
│   │   │   ├── TEXT: "Weight: 700 (Bold)"
│   │   │   ├── TEXT: "Line-height: 1.2 (38.4px)"
│   │   │   └── TEXT: "Letter-spacing: normal"
│   │   ├── FRAME: "Body (16px / 400)"
│   │   │   ├── TEXT: "The quick brown fox jumps over the lazy dog"
│   │   │   ├── TEXT: "Font: Geist"
│   │   │   ├── TEXT: "Size: 16px"
│   │   │   ├── TEXT: "Weight: 400 (Regular)"
│   │   │   ├── TEXT: "Line-height: 1.5 (24px)"
│   │   │   └── TEXT: "Letter-spacing: normal"
│   │   └── FRAME: "Caption (12px / 500)"
│   │
│   ├── SECTION: "Spacing Specifications"
│   │   ├── TEXT: "Padding (Card): 16px mobile, 24px desktop"
│   │   ├── TEXT: "Gap (Grid): 16px consistent"
│   │   ├── TEXT: "Margin (Section): 32px"
│   │   ├── TEXT: "Border Radius: 8px standard"
│   │   └── TEXT: "Border Width: 1px standard"
│   │
│   └── SECTION: "Interaction Specifications"
│       ├── FRAME: "Button Hover"
│       │   ├── TEXT: "Background color darkens (from #2563EB to #1D4ED8)"
│       │   ├── TEXT: "Shadow increases (sm to md)"
│       │   └── TEXT: "Transition: 150ms ease-in-out"
│       ├── FRAME: "Button Active"
│       │   └── TEXT: "Slight scale down (98%)"
│       ├── FRAME: "Card Hover"
│       │   └── TEXT: "Shadow increases (sm to md)"
│       └── FRAME: "Input Focus"
│           ├── TEXT: "Border color changes to blue"
│           ├── TEXT: "Shadow added (focus state)"
│           └── TEXT: "Outline: none"
│
│
└── PAGE 8: "📖 Developer Handoff Notes"
    ├── SECTION: "CSS Export"
    │   ├── TEXT: "Tailwind Classes Used:"
    │   ├── TEXT: "- bg-blue-600, hover:bg-blue-700"
    │   ├── TEXT: "- rounded-lg, shadow-sm, shadow-md"
    │   ├── TEXT: "- px-4 py-2, gap-4, gap-6"
    │   └── TEXT: "- md:grid-cols-2, lg:grid-cols-4"
    │
    ├── SECTION: "Component Variants"
    │   ├── TEXT: "Button variants:"
    │   ├── TEXT: "- Primary (blue)"
    │   ├── TEXT: "- Secondary (white/blue border)"
    │   ├── TEXT: "- Disabled (gray)"
    │   └── TEXT: "- Size: sm, md, lg"
    │
    ├── SECTION: "Responsive Breakpoints"
    │   ├── TEXT: "Mobile: < 640px (Tailwind: default)"
    │   ├── TEXT: "Tablet: 768px (Tailwind: md:)"
    │   └── TEXT: "Desktop: 1024px+ (Tailwind: lg:)"
    │
    ├── SECTION: "Animation Specifications"
    │   ├── TEXT: "Hover effects: 150-200ms ease-in-out"
    │   ├── TEXT: "Transitions: color, shadow, transform"
    │   ├── TEXT: "No heavy animations (CLS sensitive)"
    │   └── TEXT: "Loading spinner: Continuous rotation"
    │
    └── SECTION: "Links & Resources"
        ├── TEXT: "Code Repository: [link to GitHub]"
        ├── TEXT: "Deployment: Vercel"
        ├── TEXT: "Package Manager: pnpm"
        └── TEXT: "Design Tool: Figma (this file)"
```

---

## 🛠️ CARA MEMBUAT STRUKTUR INI DI FIGMA

### Step 1: Setup Pages

1. Buka Figma → **Create new file** → "Siapin Design System v1"
2. Di panel kiri **Pages**, hapus default page
3. Buat halaman baru dengan nama:
   - 🎨 Design System
   - 📦 Components
   - 📱 Mobile (375px)
   - 💻 Desktop (1920px)
   - 📐 Responsive Patterns
   - 🎯 Icons & SVG Library
   - 📋 Specifications & Annotations
   - 📖 Developer Handoff Notes

### Step 2: Create Boards & Frames

**Pada setiap page, buat BOARD dulu (drag ke canvas), lalu FRAME di dalamnya:**

```
📱 Mobile (375px) PAGE
└── BOARD: "Mobile Views"
    ├── FRAME: "Landing" (375×1800px)
    │   └── IMAGE: Screenshot
    ├── FRAME: "Dashboard" (375×2000px)
    │   └── IMAGE: Screenshot
    └── FRAME: "Kalender" (375×1500px)
        └── IMAGE: Screenshot
```

### Step 3: Import Screenshots Sebagai Images

1. **Pilih FRAME**
2. **Drag-drop** file PNG ke canvas
3. **Right-click** → **"Mask image"** (opsional, untuk membersihkan)
4. **Set constraints**: Fix width & height
5. **Rename layer** sesuai page name

### Step 4: Create Color Library dengan Rectangles

**Di "Design System" page:**

1. Buat FRAME baru: "Color Library" (800×600px)
2. Di dalamnya, buat FRAME: "Primary Colors" (300×150px)
3. Tambahkan RECTANGLE:
   - Ukuran: 120×120px
   - Fill: #2563EB
   - Rename: "Blue Primary"
4. Tambahkan TEXT di bawahnya:
   - Text: "#2563EB"
   - Font size: 12px

**Struktur folder di Layers:**

```
Frame "Color Library"
├── Frame "Primary Colors"
│   ├── Rectangle "Blue Primary" (120x120, #2563EB)
│   ├── Rectangle "Blue Dark" (120x120, #1D4ED8)
│   └── Text "#2563EB"
├── Frame "Neutral Colors"
│   ├── Rectangle "White" (120x120, #FFFFFF)
│   └── Text "White"
└── Frame "Status Colors"
    ├── Rectangle "Green" (120x120, #10B981)
    └── Text "Green"
```

### Step 5: Create Components dengan Variants

**Untuk Button component:**

1. **Buat shape:**
   - Rectangle: 120×48px, radius 8, fill #2563EB
   - Text layer: "Button", white, 14px bold, centered

2. **Group kedua layer** (Cmd+G atau Ctrl+G)

3. **Right-click group** → **"Create component"**

4. **Rename di panel kanan**: `Button / Primary`

5. **Buat state variants:**
   - Duplicate component
   - Ubah fill ke #1D4ED8
   - Rename: `Button / Primary / Hover`

6. **Buat size variants:**
   - Duplicate primary button
   - Ubah ukuran ke 96×40px
   - Rename: `Button / Primary / Small`

### Step 6: Add SVG Icons

**Dua cara menambahkan SVG:**

#### Cara 1: Upload SVG file langsung
1. File → "Upload files"
2. Pilih .svg file dari komputer
3. Drag ke canvas

#### Cara 2: Paste SVG code
1. Copy SVG code (dari Lucide React atau UI kit)
2. Paste ke Figma (Cmd+V)
3. Figma akan auto-convert ke vector path

**Example SVG icon:**

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M12 2v20M2 12h20" stroke-width="2" stroke-linecap="round"/>
</svg>
```

### Step 7: Create Vector Shapes untuk Patterns

**Untuk grid/pattern:**

1. **Tools → Line** (atau Vector)
2. Draw garis horizontal dari atas ke bawah
3. Duplicate dan space dengan consistent
4. **Right-click** → **"Create component"** → `Pattern / Grid`

### Step 8: Organize dengan Section Dividers

**Untuk memudahkan navigasi:**

1. Tambahkan TEXT besar sebagai "Section Header"
2. Format: "🎯 SECTION NAME"
3. Font: 18px, bold, gray color
4. **Jangan buat component** - hanya penanda

---

## 📐 DETAILED ELEMENT BREAKDOWN

### 1. FRAME (Artboard)

**Apa itu?**
- Container utama untuk segala sesuatu
- Seperti "slide" di PowerPoint
- Bisa di-export sebagai satu unit

**Kapan gunakan?**
```
✅ Screenshot wrapper (1920×1080 untuk desktop)
✅ Component state showcase
✅ Grid/spacing reference
✅ Responsive breakpoint comparison
```

**Contoh:**
```
FRAME "Desktop Dashboard" (1920×1080)
├── IMAGE: dashboard screenshot
├── ANNOTATION: "KPI Grid: 4 columns"
└── ANNOTATION: "Sidebar: 33% width"
```

### 2. RECTANGLE (Element)

**Apa itu?**
- Shape dasar untuk membuat visual
- Bisa filled, stroked, atau dihitam-putihkan
- Bisa di-round corners

**Kapan gunakan?**
```
✅ Card backgrounds
✅ Color swatches
✅ Placeholder untuk content
✅ Button backgrounds
✅ Spacing references
```

**Contoh:**
```
RECTANGLE "Card Background"
├── Fill: White (#FFFFFF)
├── Stroke: 1px #E5E7EB
├── Corner radius: 8px
└── Shadow: 0 1px 2px rgba(0,0,0,0.05)
```

### 3. TEXT (Element)

**Apa itu?**
- Layer untuk typography
- Bisa apply text styles/components
- Bisa di-export sebagai variable

**Kapan gunakan?**
```
✅ Headlines, body text
✅ Labels dan captions
✅ Annotations dan notes
✅ Form labels
```

**Contoh dengan typography style:**
```
TEXT "H1 Heading"
├── Font: Geist
├── Size: 32px
├── Weight: 700
├── Line height: 1.2
└── Color: #0F172A
```

### 4. VECTOR/PATH (Element)

**Apa itu?**
- Custom shapes dari stroke/path
- Bisa complex shapes (tidak hanya rectangle)
- Digunakan untuk icons, lines, patterns

**Kapan gunakan?**
```
✅ SVG icons (checkmark, arrow, dll)
✅ Custom illustrations
✅ Grid lines
✅ Decorative patterns
✅ Logos
```

**Contoh:**
```
VECTOR "Icon Arrow Up"
├── Path: M12 19V5M5 12l7-7 7 7
├── Stroke: #10B981
├── Stroke width: 2px
├── Stroke linecap: round
└── Size: 24×24px
```

### 5. GROUP (Container)

**Apa itu?**
- Mengelompokkan multiple layers jadi satu
- Bukan component, tapi organizing tool

**Kapan gunakan?**
```
✅ Grouping button (rect + text)
✅ Grouping form element
✅ Grouping card content
```

**Contoh:**
```
GROUP "Button Primary"
├── RECTANGLE: Background
├── TEXT: "Click me"
└── ICON: (optional)
```

### 6. COMPONENT (Reusable)

**Apa itu?**
- Special group yang bisa dipakai ulang
- Changes apply ke semua instances
- Bisa punya variants

**Kapan gunakan?**
```
✅ Buttons (semua variant)
✅ Cards
✅ Input fields
✅ Badges
✅ Icons
```

**Contoh:**
```
COMPONENT "Button"
├── Variant: Primary (blue)
├── Variant: Secondary (white)
├── Variant: Disabled (gray)
├── Size: Small (96×40)
├── Size: Medium (120×48)
└── Size: Large (160×56)
```

### 7. IMAGE (Element)

**Apa itu?**
- Imported raster image
- PNG, JPG, WebP, SVG
- Bisa di-mask atau di-crop

**Kapan gunakan?**
```
✅ Screenshots dari aplikasi
✅ Product photos
✅ Background images
✅ UI mockups
```

**Contoh:**
```
IMAGE "Landing Screenshot"
├── Source: desktop-landing.png
├── Dimensions: 1920×1080
├── Constraints: Fix size
└── Mask: None (full screenshot)
```

---

## 📊 LAYER NAMING CONVENTION

**Format yang benar untuk naming layers:**

```
[Type] / [Purpose] / [State]

Examples:
✅ Button / Primary / Hover
✅ Card / KPI / Default
✅ Badge / Success
✅ Icon / TrendUp / 24x24
✅ Pattern / Grid / Desktop
✅ Input / Text / Focus
```

**Jangan:**
```
❌ Button1, Button2, Button3
❌ Rectangle 1, Shape 2
❌ Frame copy 3
❌ group123
```

---

## 🎯 BEST PRACTICES

### ✅ DO:

1. **Use consistent naming** - mudah dicari & di-organize
2. **Create components** untuk reusable elements
3. **Use text styles** untuk typography consistency
4. **Organize dengan sections** - gunakan heading text
5. **Add annotations** - jelaskan intent designer
6. **Keep layers tidy** - delete unused layers
7. **Use color variables** - untuk maintenance
8. **Document everything** - ada page khusus untuk specs

### ❌ DON'T:

1. **Jangan duplicate components** - gunakan instances
2. **Jangan left loose shapes** - group dan label
3. **Jangan mix sizes** - maintain consistent scale
4. **Jangan hidden layers** - visible untuk collaboration
5. **Jangan magic numbers** - document spacing/sizing

---

## 🚀 EXPORT WORKFLOW

### Langkah Export untuk Developers:

1. **Select component/frame**
2. **Right-click** → **"Inspect"** (atau Cmd+Option+I)
3. **Figma akan show:**
   - Dimensions (width, height)
   - Position (x, y)
   - Colors (HEX, RGB, CSS)
   - Typography (font, size, weight)
   - Spacing (padding, margin)
   - Shadows, borders, effects

### Copy ke CSS:

1. **Right-click element** → **"Copy all properties"**
2. Paste ke code editor
3. Tailwind akan auto-complete

---

## 📸 SCREENSHOT PLACEMENT

**Dimana tempat optimal untuk setiap screenshot:**

```
Desktop Screenshots (1920×1080):
📍 Page: "💻 Desktop (1920px)"
📍 Board: "Desktop Views"
📍 Frame: "Landing - Desktop"

Mobile Screenshots (375×667):
📍 Page: "📱 Mobile (375px)"
📍 Board: "Mobile Views"
📍 Frame: "Landing - Mobile"
```

---

## 💾 SAVE & SHARE

### Save Figma File:

1. **File** → **Save** (auto-saves)
2. **Share** → **Copy link** → bagikan ke team
3. **Set permissions:**
   - View: untuk stakeholders
   - Edit: untuk designers
   - Own: untuk design lead

### Export dari Figma:

**Untuk HTML/CSS:**
1. Select frame/component
2. Right-click → **"Export"**
3. Pilih format (PNG, SVG, PDF)

**Untuk development:**
- Use **Figma to Code** plugin
- Or manual CSS translation dari inspect panel

---

## 🎓 SUMMARY

**Struktur Figma yang benar:**

```
FILE (Siapin Design System v1)
│
├── PAGES (8 halaman)
│   ├── Page 1: Design System (color, typography, spacing)
│   ├── Page 2: Components (buttons, cards, inputs, badges)
│   ├── Page 3: Mobile Views (375px screenshots & specs)
│   ├── Page 4: Desktop Views (1920px screenshots & specs)
│   ├── Page 5: Responsive Patterns (grid, sidebar, form)
│   ├── Page 6: Icons & SVG Library (24px, 48px, patterns)
│   ├── Page 7: Specifications (colors, typography, spacing)
│   └── Page 8: Developer Handoff (CSS, variants, breakpoints)
│
├── BOARDS (on each page)
│   └── FRAMES (multiple frames per board)
│       ├── IMAGES (screenshots)
│       ├── RECTANGLES (color swatches, placeholders)
│       ├── TEXT (labels, annotations)
│       ├── VECTORS/SVGs (icons, patterns)
│       └── COMPONENTS (reusable parts)
│
└── COMPONENTS LIBRARY (global, accessible from all pages)
    ├── Button (4 states × 3 sizes = 12 variants)
    ├── Card (4 types)
    ├── Badge (4 colors)
    ├── Input (3 states)
    └── Icons (20+ icons)
```

**Setiap element memiliki tujuan:**
- **FRAME**: Container/artboard
- **RECTANGLE**: Shape/background
- **TEXT**: Typography
- **VECTOR**: Icons/patterns
- **IMAGE**: Screenshots/photos
- **COMPONENT**: Reusable UI

---

**Ready untuk di-implement di Figma! 🎨**

Mulai dengan creating pages, kemudian setup design system, lalu import screenshots, akhirnya create components library.

Good luck! ✨
