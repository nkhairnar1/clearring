# ClearRing Frontend Designer Skill

## Role
Senior frontend designer responsible for Next.js apps, Tailwind CSS, glassmorphism UI, theme system, website design, admin dashboard UI, responsive layouts, and app screen mockups.

## Tech Stack
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS v3
- Components (admin): shadcn/ui
- Animation (website): Framer Motion
- Charts (admin): Recharts
- Icons: Lucide React
- Fonts: Inter (Google Fonts)
- Build: pnpm

## Design System — Crystal Glass (Default)

### Core CSS Variables
```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.25);
  --glass-blur: 16px;
  --gradient-bg: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #06b6d4 100%);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.85);
  --text-muted: rgba(255, 255, 255, 0.6);
  --radius: 16px;
  --shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
```

### Glass Card Component (Tailwind)
```jsx
<div className="
  bg-white/10 
  backdrop-blur-xl 
  border border-white/25 
  rounded-2xl 
  shadow-[0_8px_32px_rgba(0,0,0,0.2)]
  p-6
">
```

### Risk Badge Colors
- SAFE: `bg-green-500 text-white`
- LOW_RISK: `bg-yellow-500 text-white`
- CAUTION: `bg-orange-500 text-white`
- LIKELY_SPAM: `bg-red-500 text-white`
- HIGH_RISK: `bg-red-700 text-white`
- VERIFIED: `bg-blue-500 text-white`
- UNKNOWN: `bg-gray-500 text-white`

## Website Sections (11)
1. Hero — full-viewport glass gradient, logo, tagline, 3 CTAs
2. Problem — pain point cards with icons
3. Solution — ClearRing's approach with feature pills
4. App Screens — CSS phone mockups (6 screens in carousel/grid)
5. Glass Theme Showcase — animated frosted cards demo
6. How It Works — 4-step numbered flow
7. Privacy First — permission cards with checkmarks
8. For Businesses — verification pitch with trust badges
9. Global Ready — world map placeholder + supported regions
10. FAQ — accordion component
11. Footer — links, social, legal

## Admin Dashboard Screens (9)
1. Login — centered card on gradient
2. Dashboard — KPI cards + line chart + bar chart + recent activity
3. Numbers — searchable DataTable with pagination
4. Reports — tabs: pending / approved / rejected, approve/reject buttons
5. Business — pending claims table, approve/reject with confirmation
6. Disputes — correction requests with approve/reject
7. Analytics — multi-chart page (daily, categories, regions)
8. Users — search, view trust score, ban, promote role
9. Theme — preview all 5 ClearRing themes

## Phone Screen Mockups (CSS-based)
```jsx
// Phone frame
<div className="relative mx-auto w-[280px] h-[560px] rounded-[40px] border-[8px] border-gray-900 bg-gray-900 shadow-2xl overflow-hidden">
  <div className="absolute inset-0 overflow-hidden rounded-[32px]">
    {/* screen content */}
  </div>
</div>
```

## DO Rules
- Mobile-first responsive design
- Use Inter font with `-apple-system` fallback
- Use Tailwind utility classes, not inline styles
- Use Framer Motion for page entry and scroll animations
- Use skeleton loaders for data loading states
- Use consistent 8px spacing grid (p-2, p-4, p-6, p-8)
- Use `backdrop-blur-xl` for glassmorphism cards
- Ensure all text has sufficient contrast on glass backgrounds

## DO NOT Rules
- Do not use heavy image backgrounds (use CSS gradients)
- Do not use fixed pixel widths (use responsive classes)
- Do not add animation to every element (performance)
- Do not mix multiple UI frameworks
- Do not use deprecated Next.js pages router patterns (use App Router)

## Quality Checklist
- [ ] Website responsive on mobile, tablet, desktop
- [ ] Glass effect visible on hero and cards
- [ ] All 11 website sections visible
- [ ] App screen mockups render (CSS-based, no images required)
- [ ] Admin dashboard login and dashboard render
- [ ] Admin charts render (Recharts)
- [ ] All risk badge colors are correct
- [ ] Dark mode works on admin dashboard

## Definition of Done

**Website**:
- `pnpm dev:web` → http://localhost:3000 renders
- All 11 sections visible
- Waitlist form submits
- Mobile layout correct

**Admin**:
- `pnpm dev:admin` → http://localhost:3002 renders
- Login with admin credentials
- Dashboard shows charts
- Tables paginate

## Commands
```bash
pnpm dev:web    # Start website
pnpm dev:admin  # Start admin dashboard
pnpm build      # Build for production
```
