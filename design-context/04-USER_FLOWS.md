# 🔄 User Flows - SMA Frontend

## Versión: 2.0 - User Journey Mapping

---

## 👤 Flow 1: Nuevo Usuario - Registro y Primera Compra

### Objetivo
Usuario nuevo se registra y compra su primer reporte.

### Steps

```
1. Landing en HomePage (Not Logged In)
   ↓
   [Estado: Welcome screen con mensaje "Inicia sesión para ver reportes"]
   ↓
   Usuario click "Iniciar Sesión" en TopBar
   ↓
   
2. Redirect a LoginPage
   ↓
   Usuario click "Regístrate ahora"
   ↓
   
3. Redirect a SignUpPage
   ↓
   Usuario completa formulario:
   - Email ✓
   - Password (con requirements checklist en tiempo real) ✓
   - Confirmar password ✓
   ↓
   Click "Crear cuenta"
   ↓
   [Loading state: Botón con spinner]
   ↓
   
4. Registro exitoso → Redirect automático a HomePage
   ↓
   [Estado: Usuario logueado, catálogo visible]
   ↓
   Toast notification: "¡Bienvenido! 🎉"
   ↓
   
5. Usuario explora catálogo
   - Ve cards con reportes
   - Filtra por año (optional)
   - Busca por título/mes (optional)
   ↓
   
6. Usuario encuentra reporte de interés
   ↓
   Hover en card → Shadow elevado, lift animation
   ↓
   Click "Agregar al carrito"
   ↓
   [Estado cambio inmediato]:
   - Badge naranja "En carrito (1)" aparece en card
   - Botón → "Quitar del carrito"
   - Badge en TopBar (carrito) incrementa: 🛒 1
   ↓
   Toast: "✓ Agregado al carrito"
   ↓
   
7. Usuario agrega más reportes (opcional)
   ↓
   Repite paso 6
   ↓
   
8. Click en icono Carrito en TopBar
   ↓
   Redirect a CartPage
   ↓
   
9. En CartPage:
   [Loading payment buttons: 1-2 segundos]
   ↓
   Ve resumen:
   - Items listados
   - Total calculado en moneda seleccionada
   - PayPal y MercadoPago buttons aparecen
   ↓
   
10. Usuario selecciona método de pago
    ↓
    Click PayPal o MercadoPago button
    ↓
    [Backend: create-order endpoint]
    ↓
    Redirect a checkout del proveedor
    ↓
    
11. Usuario completa pago en proveedor
    ↓
    [Webhook: process-payment confirma]
    ↓
    Redirect de vuelta a SMA
    ↓
    
12. Payment Success → SuccessPage
    ↓
    [Animación de éxito]
    ↓
    Mensaje: "¡Compra exitosa! 🎉"
    ↓
    Order ID visible
    ↓
    
13. Click "Ver mis reportes"
    ↓
    Redirect a HomePage
    ↓
    Reportes comprados tienen badge verde "Comprado"
    ↓
    Botón → "Descargar"
```

### Decision Points

- **Paso 2**: Si ya tiene cuenta → Login directo
- **Paso 10**: PayPal vs MercadoPago → Usuario elige basado en preferencia
- **Paso 11**: Si pago falla → ErrorPage con retry
- **Paso 11**: Si pago pendiente → PendingPage

### Expected Duration
- Happy path: 3-5 minutos
- Con exploración: 5-10 minutos

---

## 👤 Flow 2: Usuario Registrado - Compra Rápida

### Objetivo
Usuario logueado compra reporte rápidamente.

### Steps

```
1. HomePage (Logged In)
   ↓
   [Estado: Catálogo visible inmediatamente]
   ↓
   
2. Usuario busca reporte específico
   ↓
   Tipo en search bar: "enero 2025"
   ↓
   [Debounce 300ms]
   ↓
   Resultados filtrados en tiempo real
   ↓
   
3. Encuentra reporte
   ↓
   Click "Agregar al carrito"
   ↓
   Badge + Toast confirmación
   ↓
   
4. Click inmediato en carrito (TopBar)
   ↓
   CartPage
   ↓
   
5. Sin revisar, click directo en PayPal
   ↓
   Checkout flow
   ↓
   
6. SuccessPage
   ↓
   Click "Ver mis reportes"
   ↓
   Download inmediato
```

### Expected Duration
- Express path: 1-2 minutos

---

## 👤 Flow 3: Usuario Explora Sin Comprar

### Objetivo
Usuario navega, explora, pero no compra (browsing).

### Steps

```
1. HomePage (Logged In)
   ↓
   
2. Usuario aplica filtros
   - Año: 2024
   - Estado: No comprados
   ↓
   [Resultados actualizan inmediatamente]
   ↓
   
3. Usuario navega entre páginas
   ↓
   Click pagination → Página 2
   ↓
   [Smooth scroll to top]
   ↓
   
4. Usuario agrega varios al carrito
   ↓
   Badge carrito: 🛒 5
   ↓
   
5. Usuario revisa carrito
   ↓
   CartPage
   ↓
   
6. Usuario remueve algunos items
   ↓
   Click 🗑 en 2 reportes
   ↓
   Cards se animan (fade out)
   ↓
   Total se recalcula
   ↓
   
7. Usuario excluye uno del checkout
   ↓
   Click ➖ en 1 reporte
   ↓
   Card se grisa, total recalcula
   ↓
   
8. Usuario sale sin comprar
   ↓
   Click "←" o logo
   ↓
   Vuelve a HomePage
   ↓
   [Carrito persiste: 3 items]
```

### Exit Points
- Cualquier momento puede salir
- Carrito se mantiene en sesión
- Items persisten hasta logout

---

## 👤 Flow 4: Admin - Subir Nuevo Reporte

### Objetivo
Admin sube un reporte al sistema.

### Steps

```
1. Login como Admin
   ↓
   [Auto-redirect a AdminUploadPage]
   ↓
   
2. AdminUploadPage loads
   ↓
   Exchange rates widget visible (bottom-right)
   ↓
   
3. Admin drag & drop PDF
   ↓
   Drop zone cambia:
   - Idle → Dragging (green highlight) → File selected (✓)
   ↓
   Auto-populate título desde filename
   ↓
   
4. Admin completa metadatos
   ↓
   - Título: Manual edit si necesario
   - Mes: Selector dropdown (Enero 2025, Febrero 2025, etc.)
   - Precios:
     * ARS: 5000
     * USD: 50
     * EUR: 45
   - Preview URL: (opcional) https://...
   ↓
   
5. Click "Subir reporte"
   ↓
   [Validación]:
   - Título no vacío ✓
   - Mes seleccionado ✓
   - Todos los precios > 0 ✓
   ↓
   [Upload con progress bar]
   ↓
   
6. Success
   ↓
   Toast: "✓ Reporte subido correctamente"
   ↓
   Form se limpia
   ↓
   Lista de archivos se actualiza automáticamente
   ↓
   Nuevo reporte aparece en la lista
   ↓
   
7. Admin verifica en lista
   ↓
   Click [👁 Ver] → Preview modal (si PDF)
   ↓
   [Modal fullscreen con iframe]
   ↓
   Close modal
   ↓
   
8. (Opcional) Admin actualiza exchange rates
   ↓
   Click refresh en widget
   ↓
   [Loading]
   ↓
   Rates actualizadas con timestamp
```

### Error Scenarios

**Archivo muy grande (>10MB):**
```
Error: "El archivo excede el tamaño máximo (10MB)"
→ Admin debe comprimir o usar otro archivo
```

**Precio inválido:**
```
Error: "Los precios deben ser mayor a 0 para: USD, EUR"
→ Campos con error se destacan en rojo
```

**Reporte duplicado (mismo mes):**
```
Warning: "Ya existe un reporte para este mes. ¿Deseas reemplazarlo?"
→ Modal de confirmación
```

---

## 👤 Flow 5: Payment Error Recovery

### Objetivo
Usuario recupera de un error de pago.

### Steps

```
1. CartPage → Click PayPal
   ↓
   [Loading: create-order]
   ↓
   PayPal checkout
   ↓
   
2. Usuario completa formulario en PayPal
   ↓
   Click "Pay Now"
   ↓
   [Payment processing...]
   ↓
   
3. Payment fails (tarjeta rechazada, fondos insuficientes, etc.)
   ↓
   PayPal retorna error
   ↓
   Redirect a ErrorPage
   ↓
   
4. ErrorPage muestra:
   "❌ Error en el pago
    No se pudo procesar tu pago.
    
    Razón: [Mensaje específico del proveedor]
    Order ID: #12345
    
    [Intentar de nuevo]  [Contactar soporte]"
   ↓
   
5a. Usuario click "Intentar de nuevo"
    ↓
    Redirect a CartPage
    ↓
    [Carrito intacto, puede reintentar]
    ↓
    Retry con otro método o misma tarjeta
    
5b. Usuario click "Contactar soporte"
    ↓
    Abre email con template:
    - Subject: "Error en pago - Order #12345"
    - Body: Detalles pre-llenados
```

---

## 👤 Flow 6: Multi-Currency Experience

### Objetivo
Usuario cambia moneda y ve precios actualizados.

### Steps

```
1. HomePage (Logged In)
   ↓
   [Default currency: USD basado en user preferences]
   ↓
   Todos los precios en USD
   ↓
   
2. Usuario click currency toggle en TopBar
   ↓
   [USD] [ARS] [EUR]
     ↓
   Selecciona ARS
   ↓
   
3. [Estado cambio INMEDIATO]:
   - Todos los cards actualizan precio → ARS
   - Format: $5,000 ARS
   - Sin reload de página
   ↓
   [Backend: Save preference via edge function]
   ↓
   
4. Usuario agrega reporte al carrito
   ↓
   CartPage
   ↓
   Precio en ARS también
   ↓
   Total en ARS
   ↓
   
5. Checkout con MercadoPago (ARS nativo)
   ↓
   Usuario paga en pesos argentinos
   ↓
   SuccessPage
   ↓
   
6. Usuario vuelve días después
   ↓
   Login
   ↓
   [Preferencia cargada: ARS]
   ↓
   HomePage muestra precios en ARS automáticamente
```

### Currency Rules

- **USD**: Default global, PayPal preferido
- **ARS**: Argentina, MercadoPago preferido
- **EUR**: Europa, PayPal preferido

---

## 🎯 Key User Experience Principles

### 1. **Feedback Inmediato**
- Toda acción genera feedback visual < 100ms
- Loaders para operaciones > 300ms
- Toast notifications para confirmaciones

### 2. **Mínimo Friction**
- Menos clicks posible
- Auto-fill inteligente
- Persistencia de estado (carrito, moneda)

### 3. **Error Recovery**
- Siempre ofrecer camino de retorno
- Errores descriptivos, no técnicos
- Sugerir siguiente paso

### 4. **Progressive Disclosure**
- Mostrar info básica primero
- Expandir detalles on-demand
- Evitar cognitive overload

### 5. **Consistency**
- Mismo patrón para acciones similares
- Colores semánticos consistentes
- Posición predecible de elementos

---

## 📊 Flow Metrics to Track

1. **Time to First Purchase**: Desde landing hasta success
2. **Cart Abandonment Rate**: % que llega a cart pero no compra
3. **Avg Items per Cart**: Cuántos reportes por transacción
4. **Search Usage**: % de usuarios que usa search
5. **Filter Usage**: Filtros más usados
6. **Payment Method Split**: PayPal vs MercadoPago
7. **Currency Preference**: Distribución USD/ARS/EUR
8. **Admin Upload Time**: Tiempo promedio para subir reporte

---

## 🚨 Edge Cases to Handle

1. **Session Expiry durante checkout**: Auto-refresh token o re-login suave
2. **Network failure**: Retry automático + mensaje claro
3. **Duplicate purchase attempt**: Warning + "Ya tienes este reporte"
4. **Price changes during checkout**: Re-validar precios antes de crear orden
5. **Concurrent admin uploads**: Queue system o lock
6. **Browser back button durante pago**: Mantener estado consistente

