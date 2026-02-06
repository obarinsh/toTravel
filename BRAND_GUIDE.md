# LaLúz Brand Style Guide

## 1. Brand Identity

**Vision:** A "Quiet Luxury" interactive fiction platform. The design captures the optimistic anticipation of travel—specifically the "golden hour" before a journey begins.

**Aesthetic:** Editorial Sketch / Warm Minimalism. It should feel like a high-end travel magazine or a cinematic planning tool.

---

## 2. Color Palette

### CSS Variables (defined in `globals.css`)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `#FDFCF7` (Buttery cream) | `#1A1A1A` | Page background |
| `--foreground` | `#1A1A1A` (Deep charcoal) | `#FDFCF7` | Primary text, dark buttons |
| `--primary` | `#94A3B8` (Dusty sky blue) | `#A5B4FC` | Primary accents, icons |
| `--primary-light` | `#A5B4FC` | `#C7D2FE` | Hover states, highlights |
| `--secondary` | `#F59E0B` (Honey gold) | `#F59E0B` | CTAs, highlights, accents |
| `--card` | `#FFFFFF` | `#262626` | Card backgrounds |
| `--border` | `#E5E2D9` (Warm border) | `#3D3D3D` | Borders, dividers |
| `--muted` | `#78716C` (Warm gray) | `#A8A29E` | Secondary text, labels |

### Tailwind Usage

```jsx
// Backgrounds
className="bg-background"      // Page background
className="bg-card"            // Card surfaces
className="bg-foreground"      // Dark buttons
className="bg-primary"         // Primary accent areas
className="bg-secondary"       // Honey gold highlights

// Text
className="text-foreground"    // Primary text
className="text-muted"         // Secondary/subtle text
className="text-background"    // Text on dark backgrounds

// Borders
className="border-border"      // Standard borders
className="border-border/50"   // Subtle borders
```

### Glassmorphism

```jsx
// Light glass effect
className="glass"              // backdrop-blur-xl + bg-white/5

// Dark glass effect  
className="glass-dark"         // backdrop-blur-xl + bg-black/20
```

---

## 3. Typography

### Font Families

| Font | Variable | Usage |
|------|----------|-------|
| **Instrument Sans** | `font-heading` | Headings, titles, navigation |
| **Inter** | `font-body` | Body text, descriptions, labels |

### Font Weights

- **Headings:** Semibold (600) for main titles, Bold (700) for small branding
- **Body:** Light (300) for descriptions, Medium (500) for labels
- **Avoid:** "Black" or "Extrabold" weights

### Label Style (Premium Look)

```jsx
// Use for metadata, category tags, small labels
className="label-premium"
// Produces: uppercase, tracking-[0.4em], text-[10px], font-weight-500
```

### Typography Examples

```jsx
// Page title
<h1 className="font-heading text-4xl font-semibold text-foreground tracking-tight">
  Plan Your Trip
</h1>

// Subtitle
<p className="text-muted font-body font-light">
  Discover amazing destinations
</p>

// Premium label
<p className="label-premium text-muted">YOUR COLLECTION</p>

// Card title
<h3 className="font-heading font-semibold text-xl text-foreground tracking-tight">
  Paris
</h3>
```

---

## 4. UI Components & Layout

### Corner Radius

| Element | Radius |
|---------|--------|
| Large cards, panels | `rounded-[2rem]` |
| Buttons, inputs | `rounded-[2rem]` or `rounded-full` |
| Small elements | `rounded-2xl` |
| Icons containers | `rounded-2xl` |

### Spacing

Use **generous whitespace** to create an airy, premium feel:

```jsx
// Major sections
className="p-16" or className="gap-20"

// Card padding
className="p-6" or className="p-8"

// Between sections
className="space-y-8" or className="space-y-10"

// Grid gaps
className="gap-6" or className="gap-8"
```

### Shadows

Use soft, warm shadows. Avoid harsh blacks:

```jsx
// Standard warm shadow
className="shadow-warm"        // 0 25px 50px -12px rgba(26, 26, 26, 0.05)

// Large warm shadow
className="shadow-warm-lg"     // 0 35px 60px -15px rgba(26, 26, 26, 0.08)
```

### Buttons

```jsx
// Primary button (dark)
<button className="px-6 py-3 bg-foreground text-background rounded-[2rem] hover:scale-[1.02] transition-all duration-300">
  <span className="label-premium">ACTION</span>
</button>

// Secondary button (outline)
<button className="px-6 py-3 bg-card border border-border/50 text-foreground rounded-[2rem] hover:border-primary hover:scale-[1.02] transition-all duration-300">
  Secondary
</button>

// Accent button (honey gold)
<button className="px-6 py-3 bg-secondary text-white rounded-[2rem] hover:scale-[1.02] transition-all duration-300">
  Highlight Action
</button>
```

### Cards

```jsx
<div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-warm">
  {/* Card content */}
</div>
```

### Inputs

```jsx
<input 
  className="w-full px-5 py-4 border border-border/50 rounded-[2rem] bg-background 
             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 
             font-body font-light transition-all duration-300"
/>
```

---

## 5. Motion & Animation

### Library

Use `motion/react` (imported as `motion` from `'motion/react'`).

### Principles

- Elegant and "weightless"
- Slightly longer transitions (duration: 0.6-0.8)
- Use `easeOut` for natural deceleration

### Entry Animations

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
```

### Hover Effects

```jsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
```

### Staggered Lists

```jsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    {/* Content */}
  </motion.div>
))}
```

### Exit Animations

```jsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## 6. Iconography

### Library

Use `lucide-react` for all icons.

### Style Guidelines

- **Stroke width:** 1.5 (thin/default) for elegant look
- **Size:** 16-24px for UI elements, 32-40px for decorative/empty states

### Usage Pattern

```jsx
import { MapPin, Calendar, Sparkles } from 'lucide-react';

// Standard icon
<MapPin size={18} strokeWidth={1.5} />

// Icon with label (studio look)
<div className="flex items-center gap-2">
  <MapPin size={16} strokeWidth={1.5} className="text-secondary" />
  <span className="label-premium text-muted">LOCATION</span>
</div>

// Icon in container
<div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
  <Sparkles size={22} className="text-secondary" strokeWidth={1.5} />
</div>
```

---

## 7. Component Patterns

### Page Header

```jsx
<div>
  <p className="label-premium text-muted mb-2">SECTION LABEL</p>
  <h1 className="font-heading text-4xl font-semibold text-foreground tracking-tight">
    Page Title
  </h1>
  <p className="text-muted font-body font-light mt-2">
    Supporting description text
  </p>
</div>
```

### Tab Navigation

```jsx
<div className="flex gap-2 p-2 bg-card border border-border/50 rounded-[2rem] shadow-warm">
  <button className={`flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-[1.5rem] 
    font-body font-medium transition-all duration-300 
    ${isActive ? 'bg-foreground text-background shadow-md' : 'text-muted hover:text-foreground hover:bg-background'}`}>
    <Icon size={18} strokeWidth={1.5} />
    <span className="label-premium">TAB NAME</span>
  </button>
</div>
```

### Filter Pills

```jsx
<button className={`px-5 py-3 rounded-[2rem] text-sm font-body transition-all duration-300
  ${isSelected 
    ? 'bg-foreground text-background shadow-warm' 
    : 'bg-card border border-border/50 text-foreground hover:border-primary hover:scale-[1.02]'
  }`}>
  Filter Option
</button>
```

### Empty State

```jsx
<div className="text-center py-16">
  <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
    <Icon size={32} className="text-primary" strokeWidth={1} />
  </div>
  <p className="font-heading text-xl font-semibold mb-2 text-foreground">
    Empty State Title
  </p>
  <p className="text-muted font-body font-light">
    Supporting message
  </p>
</div>
```

---

## 8. File Structure Reference

```
src/
├── app/
│   ├── globals.css          # Color variables, custom utilities
│   ├── layout.tsx           # Fonts, navigation
│   ├── page.tsx             # Home page
│   ├── trips/page.tsx       # Trips list
│   └── trip/[id]/page.tsx   # Trip detail
├── components/
│   ├── SearchBar.tsx        # Search with autocomplete
│   ├── TripCard.tsx         # Editorial trip card
│   ├── AttractionCard.tsx   # Attraction with image
│   ├── DayColumn.tsx        # Day container for drag-drop
│   ├── DayBasedItinerary.tsx # Multi-day planner
│   ├── FoodTab.tsx          # Restaurant finder
│   ├── ActivitiesTab.tsx    # Activity suggestions
│   ├── QueryChat.tsx        # Floating AI chat
│   └── ...
```

---

## 9. Do's and Don'ts

### Do's ✓

- Use generous whitespace and padding
- Apply soft, warm shadows
- Use subtle animations (scale 1.02, opacity fades)
- Pair icons with uppercase spaced labels
- Use the honey gold (`secondary`) for important CTAs
- Keep typography hierarchy clear (heading vs body fonts)

### Don'ts ✗

- Don't use harsh black shadows
- Don't use sharp corners (always round)
- Don't use heavy font weights (Black, Extrabold)
- Don't overcrowd UI elements
- Don't use bright/saturated colors outside the palette
- Don't skip the motion animations on interactive elements

---

## 10. Quick Reference

```jsx
// Import pattern
import { motion } from 'motion/react';
import { IconName } from 'lucide-react';

// Common class combinations
"font-heading font-semibold text-foreground tracking-tight"  // Headings
"font-body font-light text-muted"                            // Body text
"label-premium text-muted"                                    // Labels
"bg-card border border-border/50 rounded-[2rem] shadow-warm" // Cards
"bg-foreground text-background rounded-[2rem]"               // Primary buttons
"hover:scale-[1.02] transition-all duration-300"             // Hover effects
```
