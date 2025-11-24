# 📄 Page Specifications - SMA Frontend

## Versión: 2.0 - Layout & Structure

---

## 🏠 HomePage (Catálogo de Reportes)

### Propósito
Mostrar todos los reportes disponibles en un catálogo filtrable y buscable.

### Layout Structure

```
┌─────────────────────────────────────────────────┐
│                    TopBar                       │ ← Sticky
├─────────────────────────────────────────────────┤
│                                                 │
│  Container (max-width: 1200px, centered)       │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Catálogo de Reportes                      │ │ ← H1
│  │ X reportes disponibles                    │ │ ← Subtitle
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ [Filtros ▼]  [2 filtros activos]         │ │ ← Collapsible
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌──────┬──────┬──────┬──────┐                │
│  │ Card │ Card │ Card │ Card │                │ ← Grid 3-4 cols
│  ├──────┼──────┼──────┼──────┤                │
│  │ Card │ Card │ Card │ Card │                │
│  └──────┴──────┴──────┴──────┘                │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │      [Pagination 1 2 3 ... 10]            │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Responsive Behavior

**Desktop (>900px):**
- Container: Max-width 1200px, padding 48px
- Grid: 3 columns (4 si hay suficiente espacio)
- Gap: 32px
- Filtros: Inline horizontal

**Tablet (600-899px):**
- Container: Padding 24px
- Grid: 2 columns
- Gap: 24px

**Mobile (<600px):**
- Container: Padding 16px
- Grid: 1 column
- Gap: 16px
- Filtros: Full width, stacked

### Component Hierarchy

```
HomePage
├── Container
│   ├── Header Section
│   │   ├── H1 Title
│   │   └── Subtitle (count)
│   ├── Filter Panel
│   │   ├── Filter Toggle Button
│   │   └── Collapse Content
│   │       ├── Year Select
│   │       ├── Status Select
│   │       └── Clear Filters Button
│   ├── Reports Grid
│   │   └── ReportCard[] (mapped)
│   └── Pagination
└── Loading/Empty States
```

### States

**Loading:**
- Show skeleton cards (12 cards)
- Disable filters

**Empty (no results):**
```
┌────────────────────────┐
│         📊             │
│ No se encontraron      │
│ reportes               │
│ [Limpiar filtros]      │
└────────────────────────┘
```

**Error:**
- Alert banner at top
- Retry button

### Interactions

1. **Search** (TopBar):
   - Debounce 300ms
   - Filter results in real-time
   - Reset to page 1

2. **Filters**:
   - Apply immediately (no "Apply" button)
   - Show active filter count
   - Reset to page 1 on change

3. **Add to Cart**:
   - Card button → Add to cart
   - Badge appears on card
   - Toast notification: "✓ Agregado al carrito"

4. **Pagination**:
   - Smooth scroll to top
   - Update URL params (opcional)
   - 12 items per page

---

## 🛒 CartPage

### Propósito
Revisar items en el carrito y proceder al pago.

### Layout Structure

```
┌─────────────────────────────────────────────────┐
│                    TopBar                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Container (max-width: 1200px, centered)       │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ [←] Mi Carrito                            │ │ ← H1 + Back button
│  │ X artículos en el carrito                 │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌──────────────────┬──────────────────────┐   │
│  │                  │                      │   │
│  │  Cart Items      │   Summary Card       │   │ ← 2 column layout
│  │  (8 columns)     │   (4 columns)        │   │
│  │                  │   [Sticky]           │   │
│  │  ┌────────────┐  │   ┌────────────┐     │   │
│  │  │ Item Card  │  │   │ Resumen    │     │   │
│  │  └────────────┘  │   │ del pedido │     │   │
│  │  ┌────────────┐  │   │            │     │   │
│  │  │ Item Card  │  │   │ Total: $XX │     │   │
│  │  └────────────┘  │   │            │     │   │
│  │                  │   │ [PayPal]   │     │   │
│  │                  │   │ [MercadoP] │     │   │
│  │                  │   └────────────┘     │   │
│  └──────────────────┴──────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Responsive Behavior

**Desktop (>900px):**
- 2 columns: Items (66%) | Summary (33%)
- Summary: Sticky position

**Mobile (<900px):**
- Stack vertical: Items → Summary
- Summary: Static position

### Component Hierarchy

```
CartPage
├── Container
│   ├── Header
│   │   ├── Back Button
│   │   ├── H1 Title
│   │   └── Item Count
│   ├── Grid (2 columns desktop)
│   │   ├── Items Column
│   │   │   └── CartItemCard[]
│   │   └── Summary Column
│   │       ├── Summary Card
│   │       │   ├── Price breakdown
│   │       │   ├── Total
│   │       │   └── Payment Buttons
│   │       │       ├── PayPal Button
│   │       │       └── MercadoPago Button
└── Empty State
```

### States

**Empty Cart:**
```
┌────────────────────────┐
│         🛒             │
│ Tu carrito está vacío  │
│                        │
│ [Ver catálogo]         │
└────────────────────────┘
```

**Loading Payment:**
```
┌────────────────────────┐
│  ⏳ Cargando opciones  │
│      de pago...        │
└────────────────────────┘
```

### Interactions

1. **Exclude/Include Item**:
   - Click ➖ → Exclude (gray out card)
   - Click ➕ → Include back
   - Update total in real-time

2. **Remove Item**:
   - Click 🗑 → Remove completely
   - Toast: "Reporte eliminado del carrito"
   - Animate card removal

3. **Checkout**:
   - PayPal: Redirect to PayPal
   - MercadoPago: Redirect to MercadoPago
   - Show loader while creating order

---

## 🔐 LoginPage

### Propósito
Autenticación de usuarios con email/password o providers OAuth.

### Layout Structure

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              Full screen centered               │
│                                                 │
│         ┌───────────────────────┐               │
│         │                       │               │
│         │   [Logo/Avatar]       │               │
│         │ Bienvenido de nuevo   │ ← H2          │
│         │                       │               │
│         │ [Email input]         │               │
│         │ [Password input]      │               │
│         │ ¿Olvidaste contraseña?│               │
│         │                       │               │
│         │ [Iniciar Sesión]      │ ← Primary BTN │
│         │                       │               │
│         │ ────── O ──────       │               │
│         │                       │               │
│         │ [Google Sign In]      │               │
│         │ [Facebook Sign In]    │               │
│         │ [Microsoft Sign In]   │               │
│         │                       │               │
│         │ ¿No tienes cuenta?    │               │
│         │ Regístrate ahora      │               │
│         │                       │               │
│         └───────────────────────┘               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Responsive Behavior

- Card: Max-width 440px
- Padding: 48px desktop, 32px mobile
- Centered: Both axes
- Background: CREAM_ACCENT (#FEF9F5)

### States

**Loading:**
- Button: Spinner inside
- Inputs: Disabled

**Error:**
- Alert above form
- Input border → ERROR color
- Focus on first error field

**Success:**
- Redirect immediately (no message)

### Interactions

1. **Form Submit**:
   - Validate: Email format, Password min 6 chars
   - Show inline errors
   - Disable button during submit

2. **OAuth Providers**:
   - Click → Redirect to provider
   - Handle callback
   - Show loader during auth

3. **Forgot Password**:
   - Modal overlay
   - Email input
   - Send reset link
   - Success message → Auto-close 3s

---

## 📝 SignUpPage

### Propósito
Registro de nuevos usuarios.

### Layout (Similar a LoginPage)

```
┌───────────────────────┐
│   [Logo/Avatar]       │
│ Crear cuenta          │
│                       │
│ [Email input]         │
│ [Password input]      │
│ [Confirmar password]  │
│ [Password requirements]│ ← Checklist visual
│                       │
│ [Crear cuenta]        │
│                       │
│ ────── O ──────       │
│                       │
│ [Google Sign Up]      │
│ [Facebook Sign Up]    │
│ [Microsoft Sign Up]   │
│                       │
│ ¿Ya tienes cuenta?    │
│ Inicia sesión         │
└───────────────────────┘
```

### Password Requirements Component

```
✓ Al menos 8 caracteres
✓ Una letra mayúscula
○ Un número
✓ Un carácter especial
```

- Real-time validation
- Green check when met
- Gray circle when not met

---

## ✅ SuccessPage (Payment Success)

### Layout

```
┌─────────────────────────────────────────────────┐
│                    TopBar                       │
├─────────────────────────────────────────────────┤
│                                                 │
│              Centered content                   │
│                                                 │
│         ┌───────────────────────┐               │
│         │         ✅            │ ← Big icon    │
│         │                       │               │
│         │  ¡Compra exitosa!     │ ← H1          │
│         │                       │               │
│         │  Tu pago ha sido      │               │
│         │  procesado            │               │
│         │  correctamente        │               │
│         │                       │               │
│         │  Order ID: #XXX       │               │
│         │                       │               │
│         │  [Ver mis reportes]   │ ← Primary     │
│         │  [Volver al inicio]   │ ← Secondary   │
│         │                       │               │
│         └───────────────────────┘               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Animations
- Icon: Scale in + rotate
- Card: Fade in from bottom
- Confetti animation (opcional, sutil)

---

## ❌ ErrorPage (Payment Error)

### Layout (Similar a Success)

```
┌───────────────────────┐
│         ❌            │
│                       │
│  Error en el pago     │
│                       │
│  No se pudo procesar  │
│  tu pago              │
│                       │
│  [Intentar de nuevo]  │
│  [Contactar soporte]  │
│                       │
└───────────────────────┘
```

---

## ⏳ PendingPage (Payment Pending)

### Layout (Similar a Success/Error)

```
┌───────────────────────┐
│         ⏳            │
│                       │
│  Pago en proceso      │
│                       │
│  Tu pago está siendo  │
│  verificado           │
│                       │
│  [Ver estado]         │
│  [Volver al inicio]   │
│                       │
└───────────────────────┘
```

---

## 🔧 AdminUploadPage

### Propósito
Panel de administración para subir y gestionar reportes.

### Layout Structure

```
┌─────────────────────────────────────────────────┐
│                    TopBar                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Container (max-width: 900px, centered)        │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │        Subir Nuevo Reporte                │ │ ← Card
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │  📄 Arrastra o selecciona archivo   │ │ │ ← Drag & Drop
│  │  └─────────────────────────────────────┘ │ │
│  │                                           │ │
│  │  [Título input]    [Mes selector]        │ │
│  │                                           │ │
│  │  Precios por moneda                      │ │
│  │  ARS: [input]                            │ │
│  │  USD: [input]                            │ │
│  │  EUR: [input]                            │ │
│  │                                           │ │
│  │  [Preview URL input] (opcional)          │ │
│  │                                           │ │
│  │         [Subir reporte]                  │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Archivos subidos         [🔄 Refresh]   │ │ ← Card
│  │  ─────────────────────────────────────   │ │
│  │  [Lista de reportes con acciones]        │ │
│  │  [Ver] [Descargar] [Eliminar]            │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  [Exchange Rates Widget]                       │ ← Floating bottom-right
│                                                 │
└─────────────────────────────────────────────────┘
```

### Drag & Drop Zone

**Idle:**
```
┌─────────────────────────────┐
│          📄                 │
│ Arrastra y suelta o haz     │
│ clic para seleccionar       │
│                             │
│ PDF, DOC, DOCX, XLS, XLSX   │
└─────────────────────────────┘
```

**Dragging:**
```
┌─────────────────────────────┐
│          ⬇️                 │
│ Suelta el archivo aquí      │
│                             │
└─────────────────────────────┘
```
- Border: Dashed → Solid green
- Background: Light green tint

**File Selected:**
```
┌─────────────────────────────┐
│          ✅                 │
│ reporte-enero-2025.pdf      │
│ 2.5 MB                      │
│                             │
│ [Cambiar archivo]           │
└─────────────────────────────┘
```

### Files List

```
┌───────────────────────────────────────────┐
│ 📄 Reporte Enero 2025                     │
│    $5000 ARS | $50 USD | €45 EUR         │
│    Enero 2025                             │
│    Creado: 21/11/2024 10:30              │
│                          [👁] [⬇] [🗑]    │
├───────────────────────────────────────────┤
│ (más reportes...)                         │
└───────────────────────────────────────────┘
```

### Responsive
- Full width mobile
- Stack form fields vertically mobile
- Files list: Card layout mobile

---

## 🎨 Design Principles per Page

1. **Consistency**: Mismo spacing, componentes reutilizados
2. **Hierarchy**: Títulos claros, información progresiva
3. **Whitespace**: Generoso, evitar crowding
4. **Focus**: Una acción principal por página
5. **Feedback**: Loading, success, error states claros

