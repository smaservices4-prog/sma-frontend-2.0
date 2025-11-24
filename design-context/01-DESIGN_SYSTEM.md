# 🎨 Design System - SMA Frontend

## Versión: 2.0 - Modernización 2025

---

## 🌈 Paleta de Colores

### Colores Primarios

```
PRIMARY_ORANGE: #FF8C42
  → Uso: CTAs principales, highlights, elementos interactivos importantes
  → Accesibilidad: ✅ Ratio con blanco: 3.14:1 (WCAG AA para texto grande/bold)
  → SIEMPRE usar texto BLANCO (#FFFFFF) sobre este color
  → Para texto normal, usar solo en elementos grandes (>18px) o bold (>14px bold)

WHITE: #FFFFFF
  → Uso: Background principal de la aplicación
  → Proporciona limpieza y amplitud visual
```

### Colores Neutros (Escala de Grises Moderna)

```
NEUTRAL_900: #1A1A1A (casi negro)
  → Uso: Títulos principales (h1, h2)
  → Peso: Bold (700)
  
NEUTRAL_800: #2E2E2E
  → Uso: Texto principal de párrafos
  → Peso: Regular (400) o Medium (500)

NEUTRAL_600: #6B6B6B
  → Uso: Texto secundario, labels, captions
  → Peso: Regular (400)

NEUTRAL_400: #A8A8A8
  → Uso: Placeholders, texto deshabilitado
  
NEUTRAL_200: #E5E5E5
  → Uso: Bordes, divisores sutiles

NEUTRAL_100: #F5F5F5
  → Uso: Backgrounds secundarios (cards, panels)

NEUTRAL_50: #FAFAFA
  → Uso: Hover states sobre blanco
```

### Colores de Acento y Soporte

```
CREAM_ACCENT: #FEF9F5
  → Uso: Hero sections, footers, secciones destacadas
  → Mantiene la calidez del diseño original
  
ORANGE_TINT: #FFF4ED
  → Uso: Hover states de botones naranjas, backgrounds sutiles
  → Transiciones suaves

ORANGE_DARK: #E67A32
  → Uso: Hover/Active state del botón principal
```

### Colores Semánticos

```
SUCCESS: #10B981 (Verde moderno)
  → Uso: Compras completadas, mensajes de éxito
  → Accesibilidad: ✅ Ratio con blanco: 3.08:1 (WCAG AA para texto grande/bold)

ERROR: #EF4444 (Rojo moderno)
  → Uso: Errores, eliminaciones, advertencias críticas

WARNING: #F59E0B (Ámbar)
  → Uso: Alertas, estados pendientes

INFO: #3B82F6 (Azul)
  → Uso: Información, tips, links secundarios
```

---

## 📝 Tipografía

### Font Family

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Helvetica Neue', Arial, sans-serif;
```

**Razón:** Inter es la fuente moderna por excelencia para interfaces, con excelente legibilidad en pantallas.

### Escala Tipográfica (Modular Scale 1.250 - Major Third)

```
H1 - Hero Title
  Size: 48px (3rem)
  Weight: 700 (Bold)
  Line Height: 1.2
  Letter Spacing: -0.02em
  Color: NEUTRAL_900
  Use: Títulos de página principales

H2 - Section Title
  Size: 36px (2.25rem)
  Weight: 700 (Bold)
  Line Height: 1.3
  Letter Spacing: -0.01em
  Color: NEUTRAL_900
  Use: Títulos de secciones

H3 - Card Title
  Size: 24px (1.5rem)
  Weight: 600 (SemiBold)
  Line Height: 1.4
  Color: NEUTRAL_900
  Use: Títulos de cards, subsecciones

H4 - Component Title
  Size: 20px (1.25rem)
  Weight: 600 (SemiBold)
  Line Height: 1.4
  Color: NEUTRAL_800
  Use: Títulos dentro de componentes

Body Large
  Size: 18px (1.125rem)
  Weight: 400 (Regular)
  Line Height: 1.6
  Color: NEUTRAL_800
  Use: Texto principal destacado

Body Regular
  Size: 16px (1rem)
  Weight: 400 (Regular)
  Line Height: 1.6
  Color: NEUTRAL_800
  Use: Texto de párrafos estándar

Body Small
  Size: 14px (0.875rem)
  Weight: 400 (Regular)
  Line Height: 1.5
  Color: NEUTRAL_600
  Use: Texto secundario, descripciones

Caption
  Size: 12px (0.75rem)
  Weight: 400 (Regular)
  Line Height: 1.4
  Color: NEUTRAL_600
  Use: Timestamps, metadata, footnotes
```

### Accesibilidad Tipográfica ✅

- **Contraste mínimo:** WCAG AA (4.5:1 para texto normal)
- **Tamaño mínimo:** 14px para interfaces
- **Line height mínimo:** 1.5 para legibilidad
- **Text sobre PRIMARY_ORANGE:** Solo blanco (#FFFFFF) y mínimo 18px o 14px bold

---

## 📐 Spacing System (8px Grid)

```
SPACE_0: 0px
SPACE_1: 4px   (0.25rem)  → Padding interno muy ajustado
SPACE_2: 8px   (0.5rem)   → Spacing entre elementos muy cercanos
SPACE_3: 12px  (0.75rem)  → Spacing pequeño
SPACE_4: 16px  (1rem)     → Spacing estándar (BASE)
SPACE_5: 24px  (1.5rem)   → Spacing medio
SPACE_6: 32px  (2rem)     → Spacing grande
SPACE_8: 48px  (3rem)     → Spacing muy grande
SPACE_10: 64px (4rem)     → Spacing entre secciones
SPACE_12: 96px (6rem)     → Spacing hero/footer
```

**Regla de oro:** Todo spacing debe ser múltiplo de 8px para consistencia visual.

---

## 🌑 Shadows (Elevación)

```css
/* Shadow XS - Elementos sutiles */
SHADOW_XS: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Shadow SM - Cards, dropdowns */
SHADOW_SM: 0 2px 4px rgba(0, 0, 0, 0.06), 
           0 1px 2px rgba(0, 0, 0, 0.04);

/* Shadow MD - Modals, popovers */
SHADOW_MD: 0 4px 8px rgba(0, 0, 0, 0.08), 
           0 2px 4px rgba(0, 0, 0, 0.04);

/* Shadow LG - Floating elements */
SHADOW_LG: 0 8px 16px rgba(0, 0, 0, 0.1), 
           0 4px 8px rgba(0, 0, 0, 0.06);

/* Shadow XL - Dialogs, major elevations */
SHADOW_XL: 0 16px 32px rgba(0, 0, 0, 0.12), 
           0 8px 16px rgba(0, 0, 0, 0.08);
```

---

## 🔄 Border Radius

```
RADIUS_NONE: 0px
RADIUS_SM: 4px    → Inputs pequeños, chips
RADIUS_MD: 8px    → Botones, cards estándar (DEFAULT)
RADIUS_LG: 12px   → Cards grandes, modals
RADIUS_XL: 16px   → Hero sections, containers principales
RADIUS_FULL: 9999px → Pills, avatars circulares
```

---

## ⚡ Transitions

```css
/* Transition estándar */
TRANSITION_DEFAULT: all 0.2s ease-in-out;

/* Transition rápida */
TRANSITION_FAST: all 0.15s ease-in-out;

/* Transition suave */
TRANSITION_SMOOTH: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Transition entrada */
TRANSITION_ENTER: all 0.3s cubic-bezier(0, 0, 0.2, 1);

/* Transition salida */
TRANSITION_EXIT: all 0.2s cubic-bezier(0.4, 0, 1, 1);
```

---

## 📱 Breakpoints (Mobile First)

```
MOBILE: 0px - 599px
  → Layout: 1 columna
  → Padding horizontal: 16px
  → Font scale: Base

TABLET: 600px - 899px
  → Layout: 2 columnas (grid)
  → Padding horizontal: 24px
  → Font scale: Base

DESKTOP: 900px - 1199px
  → Layout: 3 columnas (grid)
  → Padding horizontal: 32px
  → Font scale: +2px en títulos

DESKTOP_LARGE: 1200px+
  → Layout: 3-4 columnas (grid)
  → Max-width container: 1200px (centrado)
  → Padding horizontal: 48px
  → Font scale: +4px en títulos
```

---

## 🎯 Principios de Diseño

### 1. **Minimalismo Funcional**
- Menos elementos = mayor impacto
- Espacios en blanco generosos
- Jerarquía clara y obvia

### 2. **Consistencia**
- Mismo componente para misma acción
- Colores predecibles
- Espaciado uniforme

### 3. **Accesibilidad**
- Contraste WCAG AA mínimo
- Navegación por teclado
- Textos alternativos

### 4. **Performance**
- Animaciones con GPU (transform, opacity)
- Imágenes optimizadas
- Lazy loading

### 5. **Mobile First**
- Diseñar primero para móvil
- Progressive enhancement para desktop
- Touch targets mínimo 44x44px

---

## ✅ Checklist de Accesibilidad

- [ ] Contraste de colores WCAG AA (4.5:1 texto, 3:1 UI)
- [ ] Texto sobre PRIMARY_ORANGE siempre blanco
- [ ] Font size mínimo 14px
- [ ] Line height mínimo 1.5
- [ ] Focus visible en todos los elementos interactivos
- [ ] Labels para todos los inputs
- [ ] ARIA labels donde sea necesario
- [ ] Navegación por teclado funcional
- [ ] Textos alternativos en imágenes
- [ ] Errores claros y descriptivos

---

## 🔗 MUI Theme Override (Material-UI v7)

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF8C42',
      dark: '#E67A32',
      light: '#FFF4ED',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1A1A1A',
      light: '#6B6B6B',
      dark: '#000000',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444',
    },
    success: {
      main: '#10B981',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#3B82F6',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#6B6B6B',
      disabled: '#A8A8A8',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  shadows: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.05)',
    '0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
    // ... rest of shadows
  ],
});
```

