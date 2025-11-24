# 📱 Responsive Breakpoints - SMA Frontend

## Versión: 2.0 - Mobile-First Design

---

## 🎯 Breakpoint Strategy

### Mobile-First Approach
```
Base styles → Mobile (0px+)
Media queries → Tablet, Desktop (upwards)

Razón:
- Performance: Móvil carga menos CSS
- Progressive enhancement
- Mayority of users en móvil
- Easier to scale up que down
```

### MUI Breakpoints (Default)
```typescript
const breakpoints = {
  xs: 0,      // Extra small: 0px - 599px (Mobile)
  sm: 600,    // Small: 600px - 899px (Tablet)
  md: 900,    // Medium: 900px - 1199px (Desktop)
  lg: 1200,   // Large: 1200px - 1535px (Desktop Large)
  xl: 1536    // Extra large: 1536px+ (Wide screens)
};
```

### Usage en MUI Components
```typescript
// sx prop
<Box sx={{
  width: '100%',           // Mobile (base)
  sm: { width: '50%' },    // Tablet+
  md: { width: '33%' }     // Desktop+
}}>

// useMediaQuery hook
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
```

---

## 📱 Mobile (0px - 599px)

### Layout Principles
- **Single column**: Todo stacked vertical
- **Full width**: Elementos ocupan 100% width
- **Touch-first**: Botones min 44x44px
- **Thumb zones**: Acciones importantes abajo

### Container
```typescript
{
  maxWidth: '100%',
  padding: '16px',
  margin: '0'
}
```

### TopBar (Mobile)
```typescript
Layout: 2 rows

Row 1 (Height: 64px):
┌─────────────────────────────────┐
│ [Logo]          [Cart] [Menu]   │
└─────────────────────────────────┘

Row 2 (Height: 56px):
┌─────────────────────────────────┐
│ [Search bar (full width)]       │
└─────────────────────────────────┘

Total height: 120px
Sticky: Yes
```

### HomePage Grid
```typescript
{
  columns: 1,
  gap: '16px',
  padding: '16px'
}

Card:
- Width: 100%
- Height: Auto (fit content)
- Image: Full width, 160px height
```

### CartPage
```typescript
Layout: Stack vertical

┌─────────────────┐
│ [← Back] Title  │
├─────────────────┤
│ Item Card       │
│ Item Card       │
├─────────────────┤
│ Summary Card    │
│ [PayPal]        │
│ [MercadoPago]   │
└─────────────────┘

Summary: Static (no sticky)
Button: Full width
```

### LoginPage
```typescript
Card:
- Width: 100% (max 440px)
- Padding: 24px
- Centered horizontally

Inputs: Full width
Buttons: Full width
OAuth buttons: Stack vertical
```

### Typography (Mobile)
```typescript
H1: 28px (1.75rem)      // -20px vs desktop
H2: 24px (1.5rem)       // -12px vs desktop
H3: 20px (1.25rem)      // -4px vs desktop
H4: 18px (1.125rem)     // -2px vs desktop
Body: 16px (1rem)       // Same
Caption: 12px (0.75rem) // Same
```

### Touch Targets
```typescript
Minimum: 44x44px (Apple/Google guidelines)
Spacing: Min 8px entre targets

Buttons:
- Height: 48px
- Padding: 12px 24px
- Font: 16px (prevent zoom)

Icon Buttons:
- Size: 48x48px
- Icon: 24px
```

### Navigation
```typescript
Bottom Sheet (optional future):
- Actions en bottom sheet
- Swipe up to reveal
- Overlay con backdrop

Hamburger Menu (if needed):
- Top right
- Slide-in from right
- Full height overlay
```

---

## 💻 Tablet (600px - 899px)

### Layout Principles
- **2-3 columns**: Grids with breathing room
- **Hybrid touch/mouse**: Support both
- **Landscape optimization**: Use horizontal space

### Container
```typescript
{
  maxWidth: '100%',
  padding: '24px',
  margin: '0 auto'
}
```

### TopBar (Tablet)
```typescript
Layout: Single row

┌────────────────────────────────────────┐
│ [Logo] [Search]    [Currency] [Cart] [User] │
└────────────────────────────────────────┘

Height: 72px
Search: Max-width 400px
Currency selector: Visible
```

### HomePage Grid
```typescript
{
  columns: 2,
  gap: '24px',
  padding: '24px'
}

Card:
- Width: ~48% (minus gap)
- Same height as mobile
- Image: 180px height
```

### CartPage
```typescript
Layout: Still stack vertical (mejor UX)

┌─────────────────┐
│ Header          │
├─────────────────┤
│ Item Cards      │
│ (wider)         │
├─────────────────┤
│ Summary Card    │
│ (centered)      │
└─────────────────┘

Summary: Max-width 500px, centered
```

### AdminUploadPage
```typescript
Form:
- 2 columns para inputs relacionados
- Drag & Drop: Wider (better target)

Files List:
- 2 columns cards
- Más info visible por card
```

### Typography (Tablet)
```typescript
Same as mobile, pero:
- Line length max: 70 characters
- Padding lateral aumenta
```

---

## 🖥️ Desktop (900px+)

### Layout Principles
- **3-4 columns**: Maximize screen real estate
- **Mouse-optimized**: Hover states, tooltips
- **Keyboard navigation**: Full support

### Container
```typescript
{
  maxWidth: '1200px',
  padding: '48px 32px',
  margin: '0 auto'
}
```

### TopBar (Desktop)
```typescript
Layout: Single row, expanded

┌──────────────────────────────────────────────┐
│ [Logo]  [Search (expanded)]  [Currency] [Cart] [User] │
└──────────────────────────────────────────────┘

Height: 72px
Search: Max-width 500px
All elements visible
Currency: Toggle buttons visible
```

### HomePage Grid
```typescript
{
  columns: 3,      // 4 if >1400px width
  gap: '32px',
  padding: '32px'
}

Card:
- Width: ~30% (3 cols)
- Height: 450px fixed
- Hover: Lift animation + shadow
```

### CartPage
```typescript
Layout: 2 columns (66% / 33%)

┌─────────────────┬──────────────┐
│                 │              │
│ Items Column    │ Summary Col  │
│ (8/12)          │ (4/12)       │
│                 │ [Sticky]     │
│ ┌─────────────┐ │ ┌──────────┐ │
│ │ Item Card   │ │ │ Summary  │ │
│ └─────────────┘ │ │ Card     │ │
│ ┌─────────────┐ │ │          │ │
│ │ Item Card   │ │ │ [PayPal] │ │
│ └─────────────┘ │ │ [MP]     │ │
│                 │ └──────────┘ │
└─────────────────┴──────────────┘

Summary:
- Position: Sticky (top: 20px)
- Max-height: calc(100vh - 40px)
- Overflow: Auto if needed
```

### AdminUploadPage
```typescript
Layout: Centered single column

Max-width: 900px
Padding: 48px

Form:
- 2 columns para inputs
- Wide drag & drop zone

Files List:
- Table-like layout
- More actions visible
- Inline preview (hover)

Exchange Rates Widget:
- Fixed position
- Bottom-right: 20px
- Expandable card
```

### Typography (Desktop)
```typescript
H1: 48px (3rem)         // Full size
H2: 36px (2.25rem)
H3: 24px (1.5rem)
H4: 20px (1.25rem)
Body: 16px (1rem)
Caption: 12px (0.75rem)

Line height: More generous (1.6-1.8)
Letter spacing: Tighter on large text
```

### Hover States
```typescript
Cards:
- Transform: translateY(-4px)
- Shadow: SHADOW_MD → SHADOW_LG
- Transition: 0.2s ease

Buttons:
- Background: Darken 5%
- Shadow: Elevate
- Cursor: Pointer

Links:
- Underline on hover
- Color: Darken slightly
```

---

## 🎨 Component Responsive Patterns

### ReportCard
```typescript
Mobile (xs):
- Width: 100%
- Stack: Vertical
- Image: 160px height
- Padding: 16px

Tablet (sm):
- Width: ~48% (2 cols)
- Image: 180px height
- Padding: 20px

Desktop (md+):
- Width: ~30% (3 cols)
- Image: 200px height
- Padding: 24px
- Hover: Lift effect
```

### Buttons
```typescript
Mobile:
- Width: 100% (full)
- Height: 48px
- Font: 16px
- Stack vertical in groups

Desktop:
- Width: Auto (fit content)
- Height: 44px
- Font: 16px
- Horizontal groups
- Min width: 120px
```

### Modals/Dialogs
```typescript
Mobile:
- Width: 100%
- Height: 100% (fullscreen)
- Border radius: 0
- Slide from bottom

Tablet:
- Width: 90%
- Height: Auto (max 90vh)
- Border radius: 12px
- Fade in center

Desktop:
- Width: 600px (max)
- Height: Auto
- Border radius: 12px
- Centered
```

### Forms
```typescript
Mobile:
- Full width inputs
- Stack labels above
- Buttons full width

Desktop:
- Inputs max 400px
- Labels can be inline (optional)
- Buttons min 120px
- Multi-column for related fields
```

---

## 📊 Grid System Reference

### MUI Grid2 (Usado en proyecto)
```typescript
import Grid from '@mui/material/Grid';

<Grid container spacing={3}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    {/* 100% mobile, 50% tablet, 33% desktop */}
  </Grid>
</Grid>

Sizes:
- xs, sm, md, lg, xl
- Values: 1-12 (12-column grid)
- Auto: 'auto' (fit content)
```

### Common Patterns
```typescript
// Full width mobile, half tablet, third desktop
size={{ xs: 12, sm: 6, md: 4 }}

// Full width mobile, 2-col desktop
size={{ xs: 12, md: 6 }}

// Sidebar layout (8/4 split desktop)
size={{ xs: 12, md: 8 }}  // Main content
size={{ xs: 12, md: 4 }}  // Sidebar

// Centered card
size={{ xs: 12, md: 6, lg: 4 }}  // Narrower on large screens
```

---

## 🔍 Media Query Examples

### Custom Breakpoints
```typescript
// useMediaQuery
const isMobile = useMediaQuery('(max-width:599px)');
const isTablet = useMediaQuery('(min-width:600px) and (max-width:899px)');
const isDesktop = useMediaQuery('(min-width:900px)');

// MUI theme
const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
const isMediumUp = useMediaQuery(theme.breakpoints.up('md'));
```

### Orientation
```typescript
const isLandscape = useMediaQuery('(orientation: landscape)');
const isPortrait = useMediaQuery('(orientation: portrait)');

// Tablet landscape special case
const isTabletLandscape = useMediaQuery(
  '(min-width: 600px) and (max-width: 899px) and (orientation: landscape)'
);
```

### High DPI Screens
```typescript
const isRetina = useMediaQuery(
  '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'
);

// Use para cargar imágenes @2x
```

---

## ⚡ Performance Tips

### Mobile Optimization
```typescript
1. Images:
   - Usar srcset con diferentes tamaños
   - WebP con fallback
   - Lazy loading por defecto
   
2. Fonts:
   - Subset solo caracteres necesarios
   - font-display: swap
   - Preload critical fonts
   
3. CSS:
   - Minimize animations en mobile
   - Use transform/opacity (GPU)
   - Avoid layout thrashing
   
4. JavaScript:
   - Code splitting por ruta
   - Lazy load non-critical components
   - Debounce scroll/resize handlers
```

### Touch Optimization
```typescript
// Prevent 300ms delay
<meta name="viewport" content="width=device-width, initial-scale=1">

// Disable zoom on inputs (prevent iOS zoom)
input {
  font-size: 16px; // Min 16px previene zoom
}

// Touch callout (iOS)
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

// Allow selection en texto
p, span, div {
  -webkit-user-select: text;
  user-select: text;
}
```

---

## 🧪 Testing Responsive Design

### Browser DevTools
```
Chrome/Edge:
1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Preset devices: iPhone, iPad, etc.
3. Custom dimensions
4. Rotate orientation
5. Throttle network

Firefox:
1. F12 → Responsive Design Mode (Ctrl+Shift+M)
2. Similar features

Safari (macOS):
1. Develop → Enter Responsive Design Mode
2. iOS simulators
```

### Real Device Testing
```
Priority Devices:
- iPhone 13/14 (390x844)
- Samsung Galaxy S21 (360x800)
- iPad (810x1080)
- Desktop 1920x1080

Testing Checklist:
□ Touch targets >44px
□ Text readable sin zoom
□ Forms no trigger zoom
□ Scroll smooth
□ Hover effects disabled mobile
□ Landscape mode functional
```

### Automated Testing
```typescript
// Cypress viewport tests
describe('Responsive', () => {
  it('mobile viewport', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    // Assertions
  });
  
  it('desktop viewport', () => {
    cy.viewport(1920, 1080);
    cy.visit('/');
    // Assertions
  });
});
```

---

## 📱 Platform-Specific Considerations

### iOS Safari
```typescript
Issues:
- Viewport height con address bar
- Fixed positioning buggy
- Input zoom si font < 16px

Solutions:
// Dynamic viewport
height: calc(var(--vh, 1vh) * 100);

// JS
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

// Input zoom prevention
input { font-size: 16px; }
```

### Android Chrome
```typescript
Issues:
- Address bar overlay
- Back button behavior
- Touch delay

Solutions:
// Viewport meta
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

// Touch action
* { touch-action: manipulation; }
```

### PWA Considerations
```typescript
// Standalone mode detection
const isPWA = window.matchMedia('(display-mode: standalone)').matches;

// Adjust layout si es PWA
if (isPWA) {
  // Add safe area insets
  paddingTop: 'env(safe-area-inset-top)';
}
```

---

## ✅ Responsive Checklist

### General
- [ ] Mobile-first CSS approach
- [ ] Touch targets min 44x44px
- [ ] Text size min 14px
- [ ] Contrast ratios meet WCAG AA
- [ ] No horizontal scroll
- [ ] Content readable without zoom

### Images
- [ ] Responsive images (srcset)
- [ ] Lazy loading enabled
- [ ] Alt text present
- [ ] WebP with fallback
- [ ] Optimized file sizes

### Forms
- [ ] Input font-size ≥16px
- [ ] Labels visible
- [ ] Error messages clear
- [ ] Submit buttons prominent
- [ ] Autocomplete attributes

### Navigation
- [ ] Menu accessible mobile
- [ ] Back button works
- [ ] Breadcrumbs on desktop
- [ ] Search accessible
- [ ] Footer links visible

### Performance
- [ ] Load time <3s on 3G
- [ ] Images optimized
- [ ] Fonts subset
- [ ] Code split
- [ ] Lazy components

### Testing
- [ ] Tested on iPhone
- [ ] Tested on Android
- [ ] Tested on tablet
- [ ] Tested landscape
- [ ] Tested with slow network

