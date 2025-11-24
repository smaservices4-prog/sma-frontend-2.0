# 🧩 Component Library - SMA Frontend

## Versión: 2.0 - Especificaciones Detalladas

---

## 🔘 Buttons

### Primary Button (CTA Principal)

```typescript
Uso: Acciones principales (Agregar al carrito, Pagar, Login, etc.)

Visual:
- Background: PRIMARY_ORANGE (#FF8C42)
- Text: WHITE (#FFFFFF)
- Font: 16px, Weight 600 (SemiBold)
- Padding: 12px 24px
- Border Radius: 8px
- Shadow: SHADOW_SM
- Transition: TRANSITION_DEFAULT

States:
- Hover: Background → ORANGE_DARK (#E67A32), Shadow → SHADOW_MD
- Active: Transform scale(0.98)
- Disabled: Background → #FFB88A (50% opacity), Cursor not-allowed
- Loading: Spinner blanco centrado

Accesibilidad:
- Min height: 44px (touch target)
- Focus: Outline 2px solid PRIMARY_ORANGE, offset 2px
- ARIA: aria-label descriptivo
```

### Secondary Button

```typescript
Uso: Acciones secundarias (Cancelar, Volver, Ver más)

Visual:
- Background: Transparent
- Border: 2px solid PRIMARY_ORANGE
- Text: PRIMARY_ORANGE
- Font: 16px, Weight 600
- Padding: 12px 24px
- Border Radius: 8px
- Transition: TRANSITION_DEFAULT

States:
- Hover: Background → ORANGE_TINT (#FFF4ED)
- Active: Border width → 3px
- Disabled: Border color → NEUTRAL_400, Text → NEUTRAL_400
```

### Text Button

```typescript
Uso: Links, acciones terciarias

Visual:
- Background: Transparent
- Text: PRIMARY_ORANGE
- Font: 16px, Weight 500
- Padding: 8px 12px
- No border
- Transition: TRANSITION_FAST

States:
- Hover: Text → ORANGE_DARK, Underline
- Active: Transform scale(0.95)
```

### Icon Button

```typescript
Uso: Acciones iconográficas (Carrito, Menú, Delete)

Visual:
- Size: 40x40px (círculo)
- Icon size: 24px
- Background: Transparent or NEUTRAL_50
- Icon color: NEUTRAL_600
- Border Radius: RADIUS_FULL

States:
- Hover: Background → NEUTRAL_100
- Active: Background → NEUTRAL_200
```

---

## 🗂️ Cards

### Report Card (Card de Reporte)

```typescript
Uso: Catálogo de reportes en HomePage

Layout:
┌─────────────────────────┐
│   [Preview Image]       │  ← 180px height
│                         │
├─────────────────────────┤
│ Badge (Comprado/Cart)   │  ← Top-right absolute
│                         │
│ Title (H3)              │  ← 2 líneas max con ellipsis
│ Month (Body Small)      │
│                         │
│ Price (H4) | Currency   │  ← Bold + moneda
│                         │
│ [Primary Button]        │  ← Agregar/Quitar
└─────────────────────────┘

Visual:
- Background: WHITE
- Border: 1px solid NEUTRAL_200
- Border Radius: 12px
- Padding: 0 (image full-width) + 24px internal
- Shadow: SHADOW_SM
- Min height: 420px

States:
- Hover: Shadow → SHADOW_MD, Transform translateY(-4px)
- In Cart: Border → 2px solid PRIMARY_ORANGE

Spacing interno:
- Image to content: 0 (flush)
- Title to month: 8px
- Month to price: 16px
- Price to button: 24px
- Button to bottom: 24px
```

### Cart Item Card

```typescript
Uso: Items en CartPage

Layout (Desktop):
┌──────────────────────────────────────────┐
│ [Title (H3)]        [Price]   [Actions]  │
│ [Month subtitle]    [Currency]  [●] [🗑] │
└──────────────────────────────────────────┘

Layout (Mobile): Stack vertical

Visual:
- Background: WHITE
- Border: 1px solid NEUTRAL_200
- Border Radius: 8px
- Padding: 24px
- Shadow: SHADOW_SM

States:
- Excluded: Opacity 0.5, Background → NEUTRAL_50
- Hover: Shadow → SHADOW_MD
```

### Summary Card (Resumen de pedido)

```typescript
Uso: Resumen en CartPage

Layout:
┌────────────────────────┐
│ Resumen del pedido     │  ← H3
├────────────────────────┤
│ Subtotal: $XXX         │  ← Body Regular
│ Items: X               │
├────────────────────────┤  ← Divider
│ Total: $XXX            │  ← H4 Bold, Color PRIMARY_ORANGE
├────────────────────────┤
│ [PayPal Button]        │
│ [MercadoPago Button]   │
└────────────────────────┘

Visual:
- Background: WHITE
- Border: 1px solid NEUTRAL_200
- Border Radius: 8px
- Padding: 24px
- Shadow: SHADOW_SM
- Position: Sticky (top: 20px) en desktop
```

---

## 📝 Form Inputs

### Text Input

```typescript
Visual:
- Height: 48px
- Border: 1px solid NEUTRAL_200
- Border Radius: 8px
- Padding: 12px 16px
- Font: 16px Regular
- Background: WHITE
- Placeholder: NEUTRAL_400

States:
- Focus: Border → 2px solid PRIMARY_ORANGE, Shadow → 0 0 0 3px ORANGE_TINT
- Error: Border → ERROR color, Helper text en rojo
- Disabled: Background → NEUTRAL_50, Text → NEUTRAL_400
- Filled: Border → NEUTRAL_300

Label:
- Font: 14px Medium
- Color: NEUTRAL_700
- Margin bottom: 8px
```

### Select/Dropdown

```typescript
Visual:
- Same as Text Input
- Icon: Chevron down (24px) on right
- Options: Dropdown con SHADOW_MD

States:
- Open: Border → PRIMARY_ORANGE
- Option hover: Background → NEUTRAL_50
- Selected option: Background → ORANGE_TINT, Bold text
```

### Currency Selector (Toggle Group)

```typescript
Uso: Selector USD/ARS/EUR en TopBar

Visual:
- 3 botones conectados
- Width: Auto (fit-content)
- Height: 32px
- Border Radius: 6px (extremos)
- Font: 14px Bold

Inactive button:
- Background: Transparent
- Border: 1px solid NEUTRAL_300
- Text: NEUTRAL_600

Active button:
- Background: ORANGE_TINT
- Border: 1px solid PRIMARY_ORANGE
- Text: PRIMARY_ORANGE
```

---

## 🏷️ Badges & Chips

### Status Badge (Comprado, En Carrito)

```typescript
Visual:
- Height: 24px
- Padding: 4px 12px
- Border Radius: RADIUS_FULL
- Font: 12px Bold
- Icon + Text (optional)

Variants:
- Success (Comprado): Background → SUCCESS, Text → WHITE
- Cart (En carrito): Background → PRIMARY_ORANGE, Text → WHITE
- Default: Background → NEUTRAL_100, Text → NEUTRAL_700
```

### Filter Chip

```typescript
Uso: Indicador de filtros activos

Visual:
- Height: 28px
- Padding: 6px 12px
- Border Radius: RADIUS_FULL
- Font: 13px Medium
- Background: NEUTRAL_100
- Text: NEUTRAL_700
- Close icon: 16px

States:
- Hover: Background → NEUTRAL_200
- Click (remove): Fade out animation
```

---

## 🔍 Search & Filters

### Search Bar (TopBar)

```typescript
Layout:
┌────────────────────────────┐
│ 🔍  [Search input...]      │
└────────────────────────────┘

Visual:
- Height: 40px
- Width: 100% mobile, 400px max desktop
- Border Radius: 8px
- Background: NEUTRAL_50
- Border: 1px solid NEUTRAL_200
- Icon: 20px, Color NEUTRAL_600

States:
- Focus: Border → PRIMARY_ORANGE, Background → WHITE
- Autocomplete open: Shadow → SHADOW_MD
```

### Autocomplete Dropdown

```typescript
Visual:
- Max height: 300px
- Scroll: Auto
- Shadow: SHADOW_MD
- Border Radius: 8px
- Background: WHITE
- Border: 1px solid NEUTRAL_200

Item:
- Height: 44px
- Padding: 12px 16px
- Hover: Background → NEUTRAL_50
- Font: 16px Regular
```

### Filter Panel (Collapsible)

```typescript
Layout:
┌─────────────────────────────┐
│ Filtros ▼ [2 filtros]       │
└─────────────────────────────┘
     ↓ (expanded)
┌─────────────────────────────┐
│ [Año selector]              │
│ [Estado selector]           │
│ [Limpiar filtros]           │
└─────────────────────────────┘

Visual:
- Border: 1px solid NEUTRAL_200
- Border Radius: 8px
- Background: WHITE
- Padding: 16px
- Transition: TRANSITION_SMOOTH (expand/collapse)
```

---

## 🍞 Toast Notifications

```typescript
Uso: Feedback de acciones (Éxito, Error, Info)

Layout:
┌──────────────────────────────┐
│ ✓ [Message text]        [×]  │
└──────────────────────────────┘

Visual:
- Min width: 320px
- Max width: 480px
- Padding: 16px 20px
- Border Radius: 8px
- Shadow: SHADOW_LG
- Position: Top-right, Stack vertical
- Animation: Slide in from right

Variants:
- Success: Border-left 4px solid SUCCESS, Icon verde
- Error: Border-left 4px solid ERROR, Icon rojo
- Info: Border-left 4px solid INFO, Icon azul

Auto-dismiss: 5 segundos
```

---

## 📊 Loading States

### Page Loader

```typescript
Visual:
- Full screen overlay
- Background: rgba(255, 255, 255, 0.9)
- Spinner: 48px, Color PRIMARY_ORANGE
- Centered horizontally y verticalmente
```

### Button Loading

```typescript
Visual:
- Spinner: 20px, Color WHITE (primary) o PRIMARY_ORANGE (secondary)
- Text: "Cargando..." o hidden
- Button disabled durante loading
```

### Card Skeleton

```typescript
Visual:
- Same dimensions as real card
- Background: Linear gradient shimmer animation
- Colors: NEUTRAL_100 → NEUTRAL_200 → NEUTRAL_100
- Border Radius: Match component
```

---

## 🎯 Navigation

### TopBar

```typescript
Layout (Desktop):
┌───────────────────────────────────────────┐
│ [Logo]  [Search]     [Currency] [Cart] [User] │
└───────────────────────────────────────────┘

Layout (Mobile):
┌───────────────────────────────┐
│ [Logo]     [Cart] [Menu]      │
├───────────────────────────────┤
│ [Search (full width)]         │
└───────────────────────────────┘

Visual:
- Height: 72px desktop, 120px mobile (2 rows)
- Background: WHITE
- Border bottom: 1px solid NEUTRAL_200
- Shadow: SHADOW_SM
- Position: Sticky top
- Padding: 0 32px desktop, 0 16px mobile
```

---

## 💳 Payment Buttons

### PayPal Button

```typescript
Visual:
- Use official PayPal SDK styles
- Width: 100% del container
- Height: 48px
- Border Radius: 8px
```

### MercadoPago Button

```typescript
Visual:
- Use official MercadoPago SDK styles
- Width: 100% del container
- Height: 48px
- Border Radius: 8px
- Margin top: 16px (spacing from PayPal)
```

---

## 🔔 Empty States

```typescript
Layout:
┌────────────────────────┐
│                        │
│      [Icon 64px]       │
│   [Title H4]           │
│   [Description]        │
│   [Primary Button]     │
│                        │
└────────────────────────┘

Visual:
- Centered horizontally y verticalmente
- Icon: NEUTRAL_400
- Title: NEUTRAL_900
- Description: NEUTRAL_600
- Max width: 400px
- Padding: 64px vertical
```

---

## ✅ Accessibility Checklist per Component

Cada componente debe cumplir:

- [ ] **Keyboard navigation**: Tab, Enter, Space funcionales
- [ ] **Focus visible**: Outline 2px con offset
- [ ] **ARIA labels**: Descriptivos y contextuales
- [ ] **Color contrast**: WCAG AA mínimo
- [ ] **Touch targets**: Min 44x44px
- [ ] **Screen reader**: Textos alternativos completos
- [ ] **Error states**: Mensajes claros y específicos

