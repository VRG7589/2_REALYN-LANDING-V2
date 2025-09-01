## Table of Contents
1. [Brand Identity](#brand-identity)
2. [Typography](#typography)
3. [Color Palette](#color-palette)
4. [Layout & Spacing](#layout--spacing)
5. [Component Library](#component-library)
6. [Interactive Elements](#interactive-elements)
7. [Animations & Transitions](#animations--transitions)
8. [Responsive Design](#responsive-design)
9. [Accessibility](#accessibility)
10. [Implementation Guidelines](#implementation-guidelines)
11. [Application-Specific Components](#application-specific-components)

---

## Application-Specific Components

### Filter Components
```css
/* Filter Container */
.elegant-card.p-6.rounded-lg.panel-container.flex-panel

/* Filter Section Headers */
.text-base.font-semibold.mb-3.text-brand-navy.flex.items-center.gap-2

/* Filter Labels */
.block.text-sm.font-medium.text-gray-700.mb-1

/* Filter Inputs & Selects */
.w-full.p-2.text-sm.border.border-gray-300.rounded-md.focus:ring-2.focus:ring-brand-green.focus:border-transparent.transition-all

/* Filter Help Text */
.text-xs.text-gray-500.mt-1

/* Filter Groups */
.mb-3, .mb-4, .mb-6
```

### Application Buttons
```css
/* Primary Action Button (Gradient) */
.w-full.modern-button.bg-gradient-to-r.from-brand-green.to-brand-blue.text-white.py-3.px-4.rounded-md.font-semibold.text-sm.hover:shadow-md.transition-all.duration-300.transform.hover:scale-[1.02].mt-auto.flex-shrink-0

/* Unlock/CTA Button */
.bg-gradient-to-r.from-brand-green.to-brand-blue.text-white.px-3.py-1.rounded-md.hover:from-brand-green/90.hover:to-brand-blue/90.transition-all.duration-300.font-semibold.text-xs.whitespace-nowrap.shadow-sm

/* Export Button */
.text-xs.bg-gray-100.hover:bg-gray-200.px-3.py-2.rounded-md.transition-colors

/* Tab Navigation Buttons */
.flex-1.py-2.px-4.text-sm.font-medium.text-brand-navy.border-b-2.border-brand-green.transition-colors
```

### Data Tables
```css
/* Table Container */
.bg-white.rounded-lg.border.border-gray-200.overflow-hidden.flex-1.flex.flex-col

/* Table Header */
.px-4.py-3.bg-gray-50.border-b.border-gray-200.flex.justify-between.items-center.flex-shrink-0

/* Table Headers */
.bg-gray-50.border-b.border-gray-200.sticky.top-0
.px-4.py-2.text-left.font-semibold.text-gray-700.text-xs

/* Table Rows */
.divide-y.divide-gray-200
.hover:bg-gray-50.transition-colors

/* Table Cells */
.px-4.py-3
.text-right.text-gray-700
.font-semibold.text-brand-navy
.font-semibold.text-brand-green

/* Rank Badges */
.w-6.h-6.bg-gradient-to-r.from-brand-green.to-brand-blue.text-white.rounded-full.flex.items-center.justify-center.text-xs.font-bold

/* Revenue Rank Badges */
.px-2.py-1.rounded-full.text-xs.font-semibold
.bg-blue-100.text-blue-800
.bg-green-100.text-green-800
.bg-yellow-100.text-yellow-800
.bg-gray-100.text-gray-800
```

### Map & Visualization Components
```css
/* Map Container */
.bg-white.rounded-lg.border.border-gray-200.p-3.flex-1.flex.flex-col.overflow-hidden

/* Map Legend */
.flex.items-center.justify-center.space-x-4.text-xs.flex-shrink-0.overflow-hidden

/* Legend Items */
.flex.items-center.space-x-2
.w-2.h-2.bg-red-100.border.border-red-300.rounded-sm
.w-2.h-2.bg-yellow-200.border.border-yellow-400.rounded-sm
.w-2.h-2.bg-green-400.border.border-green-600.rounded-sm
.w-2.h-2.bg-blue-500.border.border-blue-700.rounded-sm

/* Map Tooltip */
#mapTooltip {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  line-height: 1.4;
  max-width: 200px;
  word-wrap: break-word;
}

/* State Hover Effects */
.state-path:hover {
  cursor: pointer;
}
```

### Panel Layout System
```css
/* Panel Container */
.panel-container {
  height: 700px;
  min-height: 700px;
}

@media (max-width: 1024px) {
  .panel-container {
    height: auto;
    min-height: 600px;
  }
}

/* Flex Panel System */
.flex-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.flex-panel > * {
  flex-shrink: 0;
}

.flex-panel > .flex-1 {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
```

### Email Gate Components
```css
/* Email Gate Notice */
.mb-2.p-2.bg-gradient-to-r.from-blue-50.to-indigo-50.border.border-blue-200.rounded-lg.flex-shrink-0

/* Email Input */
.px-2.py-1.text-xs.border.border-gray-300.rounded-md.focus:ring-2.focus:ring-brand-green.focus:border-transparent.min-w-[160px]

/* Email Gate Layout */
.flex.items-center.justify-between.flex-wrap.gap-2
.flex-1
.flex.gap-2
```

### Scrollbar Styling
```css
/* Custom Scrollbars */
.overflow-auto {
  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 #F1F5F9;
}

.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #F1F5F9;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}
```

### Status & Message Components
```css
/* Loading Spinner */
.loading-spinner {
  border: 2px solid #f3f4f6;
  border-top: 2px solid #10B981;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Messages */
.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin: 0.75rem 0;
  font-size: 0.875rem;
}

/* Success Messages */
.success-message {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin: 0.75rem 0;
  font-size: 0.875rem;
  animation: slideInDown 0.3s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### FAQ Components
```css
/* FAQ Container */
.elegant-card.p-6.rounded-lg

/* FAQ Toggle Button */
.faq-toggle.w-full.text-left.flex.items-center.justify-between

/* FAQ Toggle Hover */
.faq-toggle:hover {
  background-color: rgba(16, 185, 129, 0.05);
}

/* FAQ Icon */
.text-brand-green.text-xl.font-bold

/* FAQ Content */
.faq-content.hidden.mt-4.text-gray-700

/* FAQ Lists */
.list-decimal.list-inside.space-y-2
.list-disc.list-inside.space-y-2

/* FAQ Info Boxes */
.p-3.bg-blue-50.rounded-lg
.p-3.bg-green-50.rounded-lg
.p-3.bg-yellow-50.rounded-lg
```

### Data Visualization Patterns
```css
/* Heat Map Color Scale */
/* Continuous blue scale from light to dark */
--light-blue: #BFDBFE
--medium-blue: #3B82F6  
--dark-blue: #1E40AF

/* State Path Styling */
.state-path {
  stroke: #ffffff;
  stroke-width: 1;
  transition: all 0.2s ease;
}

.state-path:hover {
  stroke: #F59E0B;
  stroke-width: 2;
  fill: #1F2937;
}
```

### Application Layout Grid
```css
/* Main Application Grid */
.grid.grid-cols-1.lg:grid-cols-[28%_72%].gap-4.lg:gap-6.items-start

/* Input Panel */
.lg:grid-cols-[28%_72%] /* 28% for filters, 72% for results */

/* Responsive Breakpoints */
@media (max-width: 1024px) {
  .lg:grid-cols-[28%_72%] {
    grid-template-columns: 1fr; /* Stack on mobile */
  }
}
```

### Data Blur Effects (Premium Features)
```css
/* Blurred Data (Premium Lock) */
.blur-sm.select-none.text-gray-400

/* Unlocked Data */
.text-gray-700
.font-semibold.text-brand-green
.font-semibold.text-brand-blue
```

### Export & Download Components
```css
/* Export Button */
.text-xs.bg-gray-100.hover:bg-gray-200.px-3.py-2.rounded-md.transition-colors

/* Export Icon */
📥 Export Data
📥 Export ZIP Data
```

---

## Brand Identity

### Brand Personality
- **Professional yet approachable** - Enterprise-grade solutions with human-centered design
- **Data-driven** - Clean, analytical aesthetic that reflects intelligence and precision
- **Modern & innovative** - Contemporary design patterns with subtle sophistication
- **Trustworthy** - Stable, reliable visual language that builds confidence

### Design Principles
- **Clarity over complexity** - Information hierarchy that guides users naturally
- **Consistency** - Unified visual language across all touchpoints
- **Elegance** - Refined details that enhance without distracting
- **Performance** - Smooth interactions that feel responsive and polished

---

## Typography

### Font Family
```css
font-family: 'Inter', sans-serif;
```

### Font Weights
- **300** - Light (for subtle text, captions)
- **400** - Regular (body text, default)
- **500** - Medium (emphasis, labels)
- **600** - Semi-bold (headings, buttons)
- **700** - Bold (main headings, strong emphasis)
- **800** - Extra-bold (hero text, key messaging)
- **900** - Black (rare use, maximum impact)

### Type Scale
```css
/* Headings */
.text-2xl    /* 24px - Section headings */
.text-3xl    /* 30px - Main section titles */
.text-4xl    /* 36px - Page titles */
.text-5xl    /* 48px - Hero headings */

/* Body text */
.text-sm     /* 14px - Small text, captions */
.text-base   /* 16px - Body text, paragraphs */
.text-lg     /* 18px - Large body text */
.text-xl     /* 20px - Subheadings */

/* Special classes */
.text-elegant {
  font-weight: 400;
  letter-spacing: -0.02em;
}

.text-elegant-bold {
  font-weight: 600;
  letter-spacing: -0.025em;
}
```

### Line Heights
- **1.6** - Body text (comfortable reading)
- **1.5** - Compact text
- **1.33** - Headings
- **1.25** - Tight headings

---

## Color Palette

### Primary Colors
```css
/* Brand Greens */
'brand-green': '#10B981'        /* Primary CTA, success states */
'brand-green/90': '#0EA371'     /* Hover states */
'brand-green/10': '#ECFDF5'     /* Light backgrounds */

/* Brand Blues */
'brand-blue': '#3B82F6'         /* Secondary actions, links */
'brand-logoblue': '#1A5CB2'     /* Logo, brand elements */
'brand-navy': '#1E3A8A'         /* Text, headings */
```

### Secondary Colors
```css
/* Accent Colors */
'brand-orange': '#FF5733'       /* Warnings, highlights */
'brand-red': '#FF0000'          /* Errors, alerts */
'brand-yellow': '#FFD700'       /* Highlights, CTAs */
'brand-yellow-300': '#FDE047'   /* Hero text emphasis */
```

### Neutral Colors
```css
/* Grays */
'brand-light': '#F9FAFB'        /* Light backgrounds */
'brand-gray': '#6B7280'         /* Secondary text */
'brand-darkgray': '#344054'     /* Primary text */
'brand-navy': '#0E1420'         /* Dark backgrounds */
```

### Semantic Colors
```css
/* Success */
.success-green: '#40960C'

/* Backgrounds */
.bg-white                       /* Primary backgrounds */
.bg-gray-100                   /* Secondary backgrounds */
.bg-gradient-to-br             /* Gradient backgrounds */

/* Text Colors */
.text-white                     /* Light text on dark backgrounds */
.text-brand-navy               /* Primary text */
.text-brand-darkgray           /* Secondary text */
.text-white/90                 /* Muted white text */
.text-white/80                 /* Further muted white */
```

---

## Layout & Spacing

### Container System
```css
/* Main containers */
.max-w-4xl                     /* Content sections */
.max-w-5xl                     /* Wide content */
.max-w-6xl                     /* Feature grids */
.max-w-7xl                     /* Full-width sections */

/* Section padding */
.section-padding {
  padding: 4rem 1.5rem;        /* 64px vertical, 24px horizontal */
}

/* Responsive padding */
@media (max-width: 768px) {
  .section-padding {
    padding: 2rem 1rem;        /* 32px vertical, 16px horizontal */
  }
}
```

### Grid Systems
```css
/* Feature grids */
.grid.md:grid-cols-2          /* 2-column on medium+ screens */
.grid.md:grid-cols-3          /* 3-column on medium+ screens */
.grid.md:grid-cols-4          /* 4-column on medium+ screens */

/* Gap spacing */
.gap-4                         /* 16px between grid items */
.gap-6                         /* 24px between grid items */
.gap-8                         /* 32px between grid items */
```

### Spacing Scale
```css
/* Margin & Padding */
.mb-2, .p-2                   /* 8px */
.mb-3, .p-3                   /* 12px */
.mb-4, .p-4                   /* 16px */
.mb-5, .p-5                   /* 20px */
.mb-6, .p-6                   /* 24px */
.mb-8, .p-8                   /* 32px */
.mb-10, .p-10                 /* 40px */
.mb-12, .p-12                 /* 48px */
```

---

## Component Library

### Navigation Bar
```css
/* Fixed navigation */
nav.fixed.w-full.z-50.bg-white.shadow-sm.border-b.border-gray-200/50

/* Logo container */
.flex.items-center.gap-3.hover:opacity-80.transition-opacity.duration-300

/* Navigation links */
.nav-link.text-brand-darkgray.hover:text-brand-green.transition-all.duration-300.rounded-md.px-3.py-2.hover:bg-gray-50

/* CTA buttons in nav */
.bg-brand-green.text-white.px-4.py-2.rounded-lg.hover:bg-brand-green/90.transition-all.duration-300.text-sm

/* Secondary nav buttons */
.border.border-brand-green.text-brand-green.px-4.py-2.rounded-lg.hover:bg-brand-green/10.transition-all.duration-300.text-sm
```

### Hero Section
```css
/* Hero container */
.bg-gradient-to-br.from-brand-green.to-brand-blue.text-white.min-h-screen.flex.flex-col.items-center.justify-center.px-6.pt-20.pb-12

/* Hero text */
.text-3xl.sm:text-4xl.md:text-5xl.max-w-6xl.mx-auto.font-bold.leading-tight.mb-4.text-yellow-300

/* Hero CTA button */
.inline-flex.items-center.justify-center.px-8.py-4.rounded-xl.font-semibold.text-base.sm:text-lg.bg-white.text-brand-navy.shadow-lg.transition.transform.hover:scale-[1.02].hover:shadow-xl
```

### Feature Cards
```css
/* Card container */
.hover-card.elegant-card.p-5.rounded-xl.text-left

/* Card hover effects */
.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}

/* Icon container */
.flex-shrink-0.flex.items-center.justify-center.w-10.h-10.bg-gradient-to-br.from-brand-green/10.to-brand-blue/10.rounded-lg

/* Card content */
.flex.items-start.gap-4
```

### Form Elements
```css
/* Form container */
.demo-form {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 90%;
  max-width: 480px;
  min-height: 400px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* Form inputs */
.form-group input {
  width: 100%;
  height: 42px;
  padding: 0 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  font-size: 16px;
  transition: border-color 0.3s ease, background 0.3s ease;
}

/* Submit buttons */
.submit-button {
  background: #FFFFFF;
  color: #4299E1;
  border: none;
  padding: 0 2rem;
  height: 42px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease;
}
```

---

## Interactive Elements

### Buttons
```css
/* Primary buttons */
.modern-button.bg-brand-green.text-white.px-8.py-3.rounded-xl.font-semibold.hover:bg-brand-green/90.transition-all.duration-300.transform.hover:scale-105.shadow-lg.hover:shadow-xl

/* Secondary buttons */
.border.border-brand-green.text-brand-green.px-4.py-2.rounded-lg.hover:bg-brand-green/10.transition-all.duration-300

/* White buttons on colored backgrounds */
.bg-white.text-brand-navy.px-8.py-3.rounded-xl.font-semibold.hover:bg-yellow-100.transition-all.duration-300.transform.hover:scale-105.shadow-lg.hover:shadow-xl
```

### Links
```css
/* Navigation links */
.nav-link.text-brand-darkgray.hover:text-brand-green.transition-all.duration-300

/* Text links */
.text-brand-navy.hover:text-brand-green.transition-colors

/* Gradient text links */
.gradient-text {
  background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Hover Effects
```css
/* Card hover */
.hover-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Button hover */
.modern-button:hover::after {
  width: 300px;
  height: 300px;
}
```

---

## Animations & Transitions

### CSS Animations
```css
/* Fade animations */
@keyframes fade-in-up {
  '0%': { opacity: '0', transform: 'translateY(30px)' },
  '100%': { opacity: '1', transform: 'translateY(0)' }
}

@keyframes fade-in {
  '0%': { opacity: '0' },
  '100%': { opacity: '1' }
}

@keyframes slide-up {
  '0%': { transform: 'translateY(20px)', opacity: '0' },
  '100%': { transform: 'translateY(0)', opacity: '1' }
}

@keyframes scale-in {
  '0%': { transform: 'scale(0.95)', opacity: '0' },
  '100%': { transform: 'scale(1)', opacity: '1' }
}

/* Animation classes */
.animate-fade-in-up
.animate-fade-in
.animate-slide-up
.animate-scale-in
```

### Transition Classes
```css
/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Specific transitions */
.transition-opacity.duration-300
.transition-colors
.transition-transform
.transition-shadow
```

### JavaScript Animations
```css
/* Rotating qualifier text */
#rotating-qualifier {
  transition: all 0.5s ease-in-out;
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

/* Carousel animations */
.alert-card {
  transition: opacity 0.5s ease-in-out;
  opacity: 0;
}

.alert-card:not(.hidden) {
  opacity: 1;
}
```

---

## Responsive Design

### Breakpoint System
```css
/* Mobile first approach */
/* Base styles for mobile */

/* Small tablets and up */
@media (min-width: 640px) { /* sm: */ }

/* Medium tablets and up */
@media (min-width: 768px) { /* md: */ }

/* Large tablets and up */
@media (min-width: 1024px) { /* lg: */ }

/* Desktop and up */
@media (min-width: 1280px) { /* xl: */ }
```

### Responsive Patterns
```css
/* Responsive text sizing */
.text-3xl.sm:text-4xl.md:text-5xl

/* Responsive grid layouts */
.grid.md:grid-cols-2.lg:grid-cols-3

/* Responsive spacing */
.px-6.md:px-8.lg:px-12

/* Responsive padding adjustments */
@media (max-width: 768px) {
  .use-case-card {
    padding: 1rem;  /* 16px on screens ≤ 768px */
  }
}
```

### Mobile Considerations
```css
/* Mobile navigation */
.hidden.md:flex              /* Hide on mobile, show on medium+ */

/* Mobile-friendly touch targets */
.min-h-[44px]               /* Minimum touch target size */

/* Mobile-optimized spacing */
.px-4.md:px-6               /* Tighter padding on mobile */
```

---

## Accessibility

### Color Contrast
- Ensure sufficient contrast ratios (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
- Use semantic colors for status indicators
- Provide alternative text for color-coded information

### Focus States
```css
/* Focus indicators */
.focus:outline-none.focus-visible:ring-2.focus-visible:ring-offset-2.focus-visible:ring-white/80

/* Focus for buttons */
.focus:outline-none.focus:ring-2.focus:ring-offset-2.focus:ring-brand-green
```

### Reduced Motion
```css
/* Respect user preferences */
@media (prefers-reduced-motion: no-preference) {
  #hero-heading { animation: fadeUp .6s ease-out both; }
  [aria-labelledby="hero-heading"] p { animation: fadeUp .7s ease-out both; }
  .laptop-frame { animation: fadeUp .8s ease-out both; }
}
```

### Semantic HTML
- Use proper heading hierarchy (h1, h2, h3, etc.)
- Include alt text for images
- Use ARIA labels where appropriate
- Ensure keyboard navigation works properly

---

## Implementation Guidelines

### CSS Framework
- **Primary**: Tailwind CSS (via CDN)
- **Custom CSS**: `shared.css` for component-specific styles
- **Theme Configuration**: `tailwind-theme.js` for brand colors and fonts

### File Structure
```
assets/
├── shared.css              # Component styles, animations
├── tailwind-theme.js       # Tailwind configuration
├── Logo.svg               # Brand logo
└── favicon.ico            # Site icon
```

### CSS Classes to Use
```css
/* Layout */
.container, .max-w-*, .mx-auto, .px-*, .py-*
.grid, .flex, .items-*, .justify-*

/* Typography */
.text-*, .font-*, .leading-*, .tracking-*
.gradient-text, .text-elegant, .text-elegant-bold

/* Colors */
.bg-brand-*, .text-brand-*, .border-brand-*
.bg-gradient-to-*, .from-*, .to-*

/* Spacing */
.m-*, .p-*, .gap-*, .space-*

/* Effects */
.shadow-*, .rounded-*, .backdrop-blur-*
.transition-*, .hover:*, .focus:*
```

### JavaScript Integration
```javascript
// Tailwind configuration
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'brand-green': '#10B981',
        'brand-blue': '#3B82F6',
        'brand-logoblue': '#1A5CB2',
        'brand-navy': '#1E3A8A',
        // ... other brand colors
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out both',
        'fade-in': 'fade-in 0.5s ease-out both',
        // ... other animations
      }
    }
  }
};
```

### Performance Considerations
- Use CSS transforms and opacity for animations (GPU accelerated)
- Implement lazy loading for images and videos
- Minimize layout shifts with proper sizing
- Use `will-change` sparingly and only when needed

---

## Component Examples

### Feature Card Template
```html
<div class="hover-card elegant-card p-5 rounded-xl text-left">
  <div class="flex items-start gap-4">
    <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-gradient-to-br from-brand-green/10 to-brand-blue/10 rounded-lg">
      <!-- Icon here -->
    </div>
    <div>
      <h3 class="text-base font-semibold mb-2 text-brand-navy">Card Title</h3>
      <p class="text-sm leading-relaxed text-brand-darkgray text-elegant">
        Card description text goes here.
      </p>
    </div>
  </div>
</div>
```

### Button Template
```html
<!-- Primary button -->
<button class="modern-button bg-brand-green text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-green/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
  Button Text
</button>

<!-- Secondary button -->
<button class="border border-brand-green text-brand-green px-4 py-2 rounded-lg hover:bg-brand-green/10 transition-all duration-300">
  Button Text
</button>
```

### Section Template
```html
<section class="relative bg-white text-brand-navy section-padding overflow-hidden">
  <div class="max-w-6xl mx-auto text-center animate-fade-in-up">
    <h2 class="text-2xl md:text-3xl font-bold mb-5 gradient-text text-elegant-bold">
      Section Title
    </h2>
    <p class="text-base mb-8 leading-relaxed max-w-3xl mx-auto text-brand-darkgray text-elegant">
      Section description text.
    </p>
    <!-- Content goes here -->
  </div>
</section>
```

### Application Filter Template
```html
<div class="elegant-card p-6 rounded-lg panel-container flex-panel">
  <div class="mb-6 flex-shrink-0">
    <h3 class="text-base font-semibold mb-3 text-brand-navy flex items-center gap-2">
      Filter Section Title
    </h3>
    
    <div class="mb-3">
      <label class="block text-sm font-medium text-gray-700 mb-1">Filter Label</label>
      <select class="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all">
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </select>
    </div>
  </div>
  
  <button class="w-full modern-button bg-gradient-to-r from-brand-green to-brand-blue text-white py-3 px-4 rounded-md font-semibold text-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] mt-auto flex-shrink-0">
    Action Button
  </button>
</div>
```

### Data Table Template
```html
<div class="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 flex flex-col">
  <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
    <h4 class="font-semibold text-gray-700">Table Title</h4>
    <button class="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md transition-colors">
      📥 Export Data
    </button>
  </div>
  
  <div class="flex-1 overflow-auto min-h-0">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200 sticky top-0">
        <tr>
          <th class="px-4 py-2 text-left font-semibold text-gray-700 text-xs">Header 1</th>
          <th class="px-4 py-2 text-left font-semibold text-gray-700 text-xs">Header 2</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-4 py-3">
            <div class="w-6 h-6 bg-gradient-to-r from-brand-green to-brand-blue text-white rounded-full flex items-center justify-center text-xs font-bold">
              1
            </div>
          </td>
          <td class="px-4 py-3 font-semibold text-brand-navy">Data Value</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

This style guide provides a comprehensive foundation for building applications that maintain the Realyn.ai brand aesthetic. Use these patterns consistently to ensure a cohesive user experience across all touchpoints.
