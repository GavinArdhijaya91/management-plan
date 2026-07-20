# 🚀 Figma Quick Reference Card

One-page cheat sheet untuk setup dan organize Figma dengan cepat.

---

## 📋 CHECKLIST CEPAT

```
☐ Create new file: "Siapin Design System v1"
☐ Create 8 pages (lihat di bawah)
☐ Setup colors (5-7 colors utama)
☐ Setup typography (6 text styles)
☐ Create components (buttons, cards, badges, inputs)
☐ Import screenshots (desktop & mobile)
☐ Add annotations
☐ Create responsive patterns
☐ Add icons (SVG library)
☐ Document specifications
☐ Share with team
```

**Estimated time: 2-3 hours**

---

## 🎨 PAGES TO CREATE (8 total)

1. **🎨 Design System** - Colors, typography, spacing
2. **📦 Components** - Button, card, badge, input components
3. **📱 Mobile (375px)** - Mobile screenshots & mobile specs
4. **💻 Desktop (1920px)** - Desktop screenshots & desktop specs
5. **📐 Responsive Patterns** - Grid, sidebar, form patterns
6. **🎯 Icons & SVG Library** - All icons (24px, 48px, etc)
7. **📋 Specifications** - Color specs, typography specs, spacing
8. **📖 Handoff Notes** - CSS classes, variants, breakpoints

---

## 🎯 BOARDS & FRAMES STRUCTURE

### Each page contains multiple BOARDS:

```
PAGE
├── BOARD 1
│   ├── FRAME 1.1
│   ├── FRAME 1.2
│   └── FRAME 1.3
├── BOARD 2
│   ├── FRAME 2.1
│   └── FRAME 2.2
└── BOARD 3
    └── FRAME 3.1
```

**Difference:**
- **BOARD**: Organizer/folder (not exported)
- **FRAME**: Container for content (can export)
- **GROUP**: Simple grouping (rarely use, prefer components)

---

## 🛠️ LAYER NAMING FORMULA

### Standard format:

```
[Type] / [Component] / [Variant]

✅ Button / Primary / Hover
✅ Badge / Success
✅ Icon / Dashboard / 24
✅ Card / KPI / Default
✅ Input / Text / Focus
```

### For elements inside components:

```
Component: Button / Primary
├─ Background (jangan "rectangle1")
├─ Label (jangan "text1")
└─ Icon (jangan "element1")
```

---

## 🎨 DESIGN SYSTEM COMPONENTS

### Buttons (create 6 variants minimum)

```
✅ Button / Primary (blue, default state)
✅ Button / Primary / Hover (darker blue)
✅ Button / Primary / Disabled (gray)
✅ Button / Secondary (white background, blue border)
✅ Button / Small (96×40px)
✅ Button / Large (160×56px)
```

### Cards (create 4 types)

```
✅ Card / Default (white, border, shadow)
✅ Card / KPI (with icon, value, trend)
✅ Card / Transaction (icon + amount + badge)
✅ Card / Hover (shadow increases)
```

### Badges (create 4 colors)

```
✅ Badge / Success (green)
✅ Badge / Error (red)
✅ Badge / Warning (orange)
✅ Badge / Neutral (gray)
```

### Inputs (create 3+ states)

```
✅ Input / Text (default)
✅ Input / Focus (blue border + shadow)
✅ Input / Error (red border)
✅ Input / Disabled (gray background)
```

### Icons (create 10-20 icons)

```
✅ Icon / Dashboard / 24
✅ Icon / Settings / 24
✅ Icon / Menu / 24
✅ Icon / Close / 24
✅ Icon / Search / 24
✅ Icon / TrendUp / 16 (green)
✅ Icon / TrendDown / 16 (red)
✅ Icon / Success / 24 (green checkmark)
✅ Icon / Error / 24 (red X)
✅ Icon / Warning / 24 (orange alert)
```

---

## 🎨 COLORS TO SET UP

### Primary Colors

```
Color / Blue / Primary       #2563EB
Color / Blue / Dark          #1D4ED8
Color / Blue / Light         #DBEAFE (optional)
```

### Neutral Colors

```
Color / White / Primary      #FFFFFF
Color / Gray / Light         #F8F9FA
Color / Gray / Border        #E5E7EB
Color / Gray / Text          #6B7280
Color / Gray / Dark Text     #0F172A
```

### Status Colors

```
Color / Green / Success      #10B981
Color / Red / Error          #EF4444
Color / Orange / Warning     #F59E0B
```

### Light Variants (for backgrounds)

```
Color / Green / Light        #F0FDF4
Color / Red / Light          #FEE2E2
Color / Orange / Light       #FFFBEB
```

---

## 📝 TYPOGRAPHY TO SET UP

### Create 6 Text Styles:

```
Style: H1
├─ Font: Geist
├─ Size: 32px
├─ Weight: 700 (Bold)
└─ Line-height: 1.2

Style: H2
├─ Size: 24px
├─ Weight: 700
└─ Line-height: 1.3

Style: H3
├─ Size: 18px
├─ Weight: 600
└─ Line-height: 1.4

Style: Body
├─ Size: 16px
├─ Weight: 400
└─ Line-height: 1.5

Style: Body Small
├─ Size: 14px
├─ Weight: 400
└─ Line-height: 1.5

Style: Label
├─ Size: 12px
├─ Weight: 500
└─ Line-height: 1.5
```

---

## 📏 SPACING REFERENCE

```
4px   (xs)   - Micro spacing
8px   (sm)   - Small spacing
12px  (md)   - Medium spacing
16px  (base) - Default/standard ⭐
24px  (lg)   - Large spacing
32px  (xl)   - Extra large
48px  (2xl)  - Section spacing
```

### Common usages:

```
Component padding:    12px
Card padding:         16px or 24px
Gap between items:    16px
Section margin:       32px
Border radius:        8px (standard)
Border width:         1px
```

---

## 🎯 SHADOWS

```
Shadow / Small
├─ Offset: 0 1px 2px
└─ Color: rgba(0,0,0,0.05)

Shadow / Medium
├─ Offset: 0 4px 6px
└─ Color: rgba(0,0,0,0.1)

Shadow / Hover
├─ Offset: 0 10px 15px
└─ Color: rgba(0,0,0,0.15)
```

---

## 📸 SCREENSHOT LOCATIONS

### Desktop Screenshots (1920×1080)

Place pada page **"💻 Desktop (1920px)"**:

```
Frame: "Landing - Desktop"
│── desktop-landing.png

Frame: "Dashboard - Desktop"
│── desktop-dashboard.png

Frame: "Manajemen - Desktop"
│── desktop-manajemen.png

Frame: "Kalender - Desktop"
│── desktop-kalender.png

Frame: "Tren Pasar - Desktop"
│── desktop-tren-pasar.png

Frame: "Hubungi Kami - Desktop"
│── desktop-hubungi-kami.png
```

### Mobile Screenshots (375×667)

Place pada page **"📱 Mobile (375px)"**:

```
Frame: "Landing - Mobile"
│── mobile-landing.png

Frame: "Dashboard - Mobile"
│── mobile-dashboard.png

... (repeat untuk semua pages)
```

---

## 🔧 COMPONENT CREATION QUICK STEPS

### Step 1: Draw Shapes

```
1. Draw RECTANGLE (background)
2. Draw TEXT (label)
3. Optional: Add ICON
```

### Step 2: Group Layers

```
Cmd+G (or Ctrl+G)
├─ Selects all layers
└─ Creates GROUP
```

### Step 3: Create Component

```
Right-click GROUP
→ "Create component"
→ Rename in right panel
→ Done! ✓
```

### Step 4: Create Variants

```
Duplicate component
Edit duplicate (colors, sizes, states)
Rename variant (e.g., add "/Hover")
Figma auto-links as variant
```

---

## 📤 EXPORT FOR DEVELOPMENT

### Get Component Specs:

```
1. Right-click component
2. Select "Inspect"
3. Shows: size, colors, spacing, typography
4. Copy CSS values
5. Paste into code
```

### Export as Image:

```
1. Select FRAME
2. Right-click
3. "Export"
4. Choose PNG, SVG, or PDF
5. Download
```

### Share Link:

```
1. Right-click component
2. "Get link"
3. Share with dev team
4. Developers see live specs
```

---

## 🏗️ ORGANIZATION TIPS

### 1. Clean Up Layers

```
❌ Delete unused layers
❌ Rename cryptic names
❌ Organize with sections
✅ Keep file tidy
```

### 2. Use Section Headers

```
Add large TEXT as separator:

"━━━━━━━━ 🎯 BUTTONS ━━━━━━━━"
├─ Component 1
├─ Component 2
└─ Component 3

"━━━━━━━━ 🎨 CARDS ━━━━━━━━"
├─ Component 1
└─ Component 2
```

### 3. Pin Frequently Used Items

```
Right-click component
→ "Pin to components"
→ Appears at top of component menu
```

### 4. Use Color Library

```
Assets panel
→ Colors tab
→ Right-click component
→ "Edit color library"
→ Save custom color
```

---

## ⚡ KEYBOARD SHORTCUTS

```
Cmd+G          Group layers
Cmd+D          Duplicate
Cmd+A          Select all
Cmd+Option+K   Create component
Cmd+Shift+O    Show design system
Cmd+F          Search layers
V              Select tool
T              Text tool
R              Rectangle tool
L              Line tool
Shift+I        Image tool
Cmd+Option+I   Inspect mode
```

---

## 🚀 SHARING WITH TEAM

### Before Sharing:

- [ ] All 8 pages created
- [ ] All components named correctly
- [ ] All screenshots imported
- [ ] All layers organized
- [ ] File saved

### How to Share:

1. Click **"Share"** button (top right)
2. Select sharing type:
   - **View** - stakeholders only
   - **Edit** - designers
   - **Owner** - lead designer
3. Copy link
4. Send to team

### Collaboration Features:

```
✅ Comments (click + comment)
✅ Version history (File → Version history)
✅ Real-time editing (multiple people)
✅ Design tokens (shared library)
```

---

## 📊 FINAL CHECKLIST

Before launching to production:

- [ ] 8 pages setup
- [ ] 20+ components created
- [ ] Colors consistent
- [ ] Typography applied
- [ ] All screenshots imported
- [ ] Annotations added
- [ ] Icons uploaded
- [ ] Responsive patterns documented
- [ ] Developer specs complete
- [ ] Layer names standardized
- [ ] File organized & clean
- [ ] Shared with team

---

## 🆘 COMMON ISSUES & FIXES

### Issue: Component changes not syncing

```
❌ Using duplicate instead of instance
✅ Use component instances from Assets
```

### Issue: Naming confusion

```
❌ Random names: Rectangle 1, group copy 3
✅ Use: Button / Primary / Hover
```

### Issue: Slow Figma performance

```
❌ Too many unused layers
✅ Delete unused elements, flatten groups
```

### Issue: Can't find icon

```
❌ Icons scattered randomly
✅ Organize in Icons page with boards
```

---

## 📚 RELATED DOCUMENTS

- **FIGMA_STRUCTURE_GUIDE.md** - Detailed explanation
- **FIGMA_SETUP_CHECKLIST.md** - Step-by-step setup
- **FIGMA_LAYER_NAMING.md** - Naming conventions
- **DESIGN_SYSTEM.md** - Design specifications
- **GETTING_STARTED.md** - Development guide

---

## 🎯 YOUR NEXT STEPS

1. **Read this page** (you're reading!)
2. **Review FIGMA_STRUCTURE_GUIDE.md** (understand structure)
3. **Follow FIGMA_SETUP_CHECKLIST.md** (create step-by-step)
4. **Reference FIGMA_LAYER_NAMING.md** (name consistently)
5. **Launch & share** with team

---

**Congrats! You're ready to build your Figma design system! 🎉**

Questions? Check the detailed guides above.

Good luck! 🚀
