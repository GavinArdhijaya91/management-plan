# Siapin Platform - Getting Started

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Install dependencies**:
```bash
pnpm install
```

2. **Start the development server**:
```bash
pnpm dev
```

3. **Open in browser**:
```
http://localhost:3000
```

---

## 📁 Project Structure

```
siapin/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard page
│   ├── manajemen/
│   │   └── page.tsx          # Management page (Transaksi)
│   ├── kalender/
│   │   └── page.tsx          # Calendar page
│   ├── tren-pasar/
│   │   └── page.tsx          # Market trends page
│   └── hubungi-kami/
│       └── page.tsx          # Contact page
├── components/
│   ├── header.tsx            # Main header/navigation
│   ├── kpi-card.tsx          # KPI card component
│   ├── sales-chart.tsx       # Chart component (Recharts)
│   └── status-badge.tsx      # Status badge component
├── lib/
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
```

---

## 🎨 Design Files

### Responsive Breakpoints
- **Mobile**: 375px (iPhone SE)
- **Tablet**: 768px
- **Desktop**: 1920px

### Pages Available

1. **Landing Page** (`/`)
   - Hero section with value proposition
   - 6 feature cards
   - Email signup CTA
   - Footer with links

2. **Dashboard** (`/dashboard`)
   - 4 KPI cards with trend indicators
   - Sales vs Modal bar chart (4-week view)
   - Quick insights cards
   - Weekly tasks and status summary

3. **Manajemen** (`/manajemen`)
   - Transaction summary cards
   - Advanced search and filters
   - Sortable transaction table
   - Edit/delete actions

4. **Kalender** (`/kalender`)
   - Interactive calendar view
   - Event sidebar
   - Upcoming events list
   - Event type indicators

5. **Tren Pasar** (`/tren-pasar`)
   - 6-month trend line chart
   - Market insights cards
   - Product trends table
   - Recommendations

6. **Hubungi Kami** (`/hubungi-kami`)
   - Contact information cards
   - Contact form with validation
   - FAQ section
   - Live chat integration ready

---

## 🛠️ Key Technologies

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui (base setup)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Language**: TypeScript

---

## 🔧 Configuration Files

### `next.config.mjs`
Next.js configuration with Turbopack

### `tailwind.config.js` (if v3)
or embedded in `globals.css` (if v4)

### `components.json`
shadcn/ui configuration

### `tsconfig.json`
TypeScript configuration with path aliases

---

## 📱 Responsive Testing

### Mobile View (375px)
```bash
# Set viewport in browser DevTools
# iPhone SE: 375x667
```

All components stack vertically:
- KPI cards: 1 column
- Navigation: Hamburger menu
- Table: Horizontal scroll
- Forms: Full width fields

### Tablet View (768px)
```bash
# iPad view
# 768x1024
```

Components begin to expand:
- KPI cards: 2 columns
- Navigation: Start showing desktop nav
- Sidebar may appear

### Desktop View (1920px)
```bash
# Full desktop experience
# 1920x1080
```

Full multi-column layouts:
- KPI cards: 4 columns
- Sidebars: Visible and functional
- Full table with all columns

---

## 🎨 Color Palette

All colors are defined using Tailwind classes:

```jsx
// Primary
bg-blue-600          // CTA buttons
text-blue-600        // Links, highlights

// Status
bg-emerald-100       // Success backgrounds
text-emerald-700     // Success text
bg-red-100           // Error backgrounds
text-red-700         // Error text
bg-orange-100        // Warning backgrounds
text-orange-700      // Warning text

// Neutral
bg-gray-50           // Light backgrounds
bg-gray-100          // Slightly darker backgrounds
text-gray-900        // Primary text
text-gray-600        // Secondary text
border-gray-200      // Subtle borders
```

---

## 📊 Mock Data

All pages use mock data defined in the component files:

### Dashboard
- 4 KPI cards with sample metrics
- 4-week sales data for charts
- Sample tasks and insights

### Manajemen
- 5 sample transactions
- Transaction history with various statuses

### Kalender
- 5 sample events with dates
- Event type categorization

### Tren Pasar
- 6-month trend data
- 4 product samples with trends
- Market recommendations

**To use real data**:
1. Replace mock data with API calls
2. Use React hooks (useState, useEffect) or SWR
3. Add error states and loading indicators
4. Consider pagination for large datasets

---

## 🔄 Component Customization

### KPI Card
```jsx
<KPICard
  title="Total Penjualan"
  value="Rp 206.000"
  icon={<DollarSign className="w-6 h-6" />}
  trend={{ direction: 'up', percentage: 12 }}
  bgColor="bg-blue-50"
/>
```

### Status Badge
```jsx
<StatusBadge status="untung" label="Untung" />
// Status options: untung | rugi | aman | tercapai | warning | urgent
```

### Sales Chart
```jsx
<SalesChart
  data={chartData}
  type="bar"  // or "line"
  title="Penjualan vs Modal"
/>
```

---

## 🚀 Deployment

### Deploy to Vercel
```bash
vercel deploy
```

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=your_api_url
```

### Production Build
```bash
pnpm build
pnpm start
```

---

## 🐛 Troubleshooting

### Pages not loading
1. Check if dev server is running: `pnpm dev`
2. Clear `.next` folder: `rm -rf .next`
3. Restart dev server

### Styles not applying
1. Make sure Tailwind CSS is configured correctly
2. Check `globals.css` is imported in layout
3. Verify `tailwind.config.js` exists (v3) or styles in `globals.css` (v4)

### Charts not rendering
1. Verify Recharts is installed: `pnpm list recharts`
2. Check data format matches expected structure
3. Ensure chart component gets proper data prop

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org/)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 📝 Development Tips

1. **Use the Tailwind CSS IntelliSense** extension for VS Code
2. **Check responsive designs** using browser DevTools
3. **Test all pages** on both mobile and desktop
4. **Use Figma** for design handoff and component reference
5. **Keep components small** and composable

---

## 🎯 Next Steps

1. ✅ Run `pnpm dev` to start development
2. ✅ Review all pages in browser (desktop + mobile)
3. ✅ Export designs to Figma for team reference
4. ✅ Connect real API endpoints for data
5. ✅ Add authentication (if needed)
6. ✅ Deploy to Vercel

---

**Last Updated**: July 20, 2026
**Version**: 1.0
