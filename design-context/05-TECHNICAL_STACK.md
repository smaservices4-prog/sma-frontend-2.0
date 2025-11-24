# 🛠️ Technical Stack - SMA Frontend

## Versión: 2.0 - Architecture & Technologies


---

## 🔐 Authentication & Backend

### Auth Provider
```
Supabase Auth
- Email/Password authentication
- OAuth providers (Google, Facebook, Microsoft)
- JWT tokens
- Session management
- Password recovery
- Email verification (opcional)
```

### Database & Storage
```
Supabase PostgreSQL
- Row Level Security (RLS)
- Real-time subscriptions (not used currently)
- File storage (reports, previews)
- Edge Functions (serverless)
```

### API Client
```
@supabase/supabase-js: 2.49.4
- Client-side SDK
- Auto token refresh
- Typed responses
- Error handling built-in
```

---

## 💳 Payment Integrations

### PayPal
```
SDK: @paypal
- PayPal Checkout component
- Smart Payment Buttons
- Multiple currencies (USD, EUR)
- Sandbox mode para testing
```

### MercadoPago
```
SDK: @mercadopago
- Checkout Pro integration
- ARS native support
- Redirect flow
- Sandbox mode para testing
```

---

## 📱 State Management

### Global State (Contexts)

```typescript
// CartContext - Gestión del carrito
- cartItems: CartItem[]
- addToCart(report: Report): void
- removeFromCart(reportId: string): void
- clearCart(): void
- getCartItemsCount(): number
- isInCart(reportId: string): boolean

// CurrencyContext - Moneda seleccionada
- selectedCurrency: 'USD' | 'ARS' | 'EUR'
- setSelectedCurrency(currency): void
- loading: boolean

// SearchContext - Búsqueda global
- searchQuery: string
- setSearchQuery(query: string): void
- allReports: Report[]
- setAllReports(reports: Report[]): void

// ExchangeRateContext - Tasas de cambio (Admin)
- rates: { ARS_USD, EUR_USD, timestamp }
- loading: boolean
- refresh(): Promise<void>
```

### Local State
```typescript
// Usar useState para:
- Form inputs
- UI toggles (modals, dropdowns)
- Loading states
- Error states
- Pagination state

// Usar useEffect para:
- Data fetching
- Side effects
- Subscriptions cleanup
```

---

## 🔄 Data Fetching Strategy

### API Layer Structure
```
src/api/
├── auth.ts              # Login, signup, logout, password reset
├── reports.ts           # Get reports, create order
├── storage.ts           # Upload, delete, list files (Admin)
├── exchangeRates.ts     # Get rates, refresh (Admin)
└── userPreferences.ts   # Get/update currency preference
```

### API Client Pattern
```typescript
// Ejemplo: reports.ts
export const reportsApi = {
  async getReports(): Promise<ReportsResponse> {
    const response = await supabaseClient.functions.invoke('get-reports');
    if (response.error) throw new Error(response.error.message);
    return response.data;
  },
  
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await supabaseClient.functions.invoke('create-order', {
      body: data
    });
    if (response.error) throw new Error(response.error.message);
    return response.data;
  }
};
```

### Error Handling
```typescript
try {
  const data = await reportsApi.getReports();
  // Handle success
} catch (error) {
  // User-friendly error
  setError(error instanceof Error ? error.message : 'Error desconocido');
}
```

---

## 🧪 Type Definitions

### Core Types
```typescript
// src/types/index.ts

export interface Report {
  id: string;
  title: string;
  month: string; // "YYYY-MM-DD"
  prices: Array<{
    amount: number;
    currency: 'ARS' | 'USD' | 'EUR';
  }>;
  preview_url?: string;
  created_at: string;
  purchased: boolean;
  can_access: boolean;
  
  // Legacy computed (backward compatibility)
  price: number;
  currency: string;
}

export interface CartItem {
  report: Report;
  quantity: number; // Always 1 en implementación actual
}

export interface SearchFilters {
  query: string;
  year?: string;
  purchased?: boolean;
}

export interface CreateOrderRequest {
  cart: Array<{
    report_id: string;
    quantity: number;
  }>;
  payment_provider: 'paypal' | 'mercadopago';
  currency?: 'USD' | 'ARS' | 'EUR';
}

export interface CreateOrderResponse {
  success: boolean;
  order_id: string;
  checkout_url: string;
  provider_order_id: string;
  total_amount: number;
  currency: string;
  expires_at: string;
}
```

---

## 🔒 Security Best Practices

### 1. **Authentication**
```typescript
- JWT tokens almacenados en httpOnly cookies (Supabase maneja)
- Auto-refresh de tokens antes de expiry
- Logout limpia local storage y cookies
- Protected routes verifican auth state
```

### 2. **XSS Prevention**
```typescript
- React auto-escapa JSX
- No usar dangerouslySetInnerHTML sin sanitizar
- Validar inputs del usuario
- CSP headers en producción
```

### 3. **CSRF Protection**
```typescript
- Tokens CSRF en forms críticos
- SameSite cookies
- Verificar origin en requests
```

### 4. **Environment Variables**
```typescript
// .env
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
VITE_PAYPAL_CLIENT_ID=...
VITE_MERCADOPAGO_PUBLIC_KEY=...

// Acceso en código:
import.meta.env.VITE_SUPABASE_URL
```

### 5. **Sensitive Data**
```typescript
- NO almacenar passwords en state
- NO loggear tokens en console (producción)
- Limpiar forms después de submit
- Usar HTTPS en producción
```

---

## ⚡ Performance Optimizations

### Code Splitting
```typescript
// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const AdminUploadPage = lazy(() => import('./pages/AdminUploadPage'));

// Suspense wrapper
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
  </Routes>
</Suspense>
```

### Memoization
```typescript
// Expensive computations
const filteredReports = useMemo(() => {
  return allReports.filter(/* complex filter */);
}, [allReports, filters]);

// Callback functions
const handleAddToCart = useCallback((report: Report) => {
  addToCart(report);
}, [addToCart]);
```

### Image Optimization
```typescript
- Lazy loading: loading="lazy" en imgs
- Responsive images: srcset para diferentes tamaños
- WebP format con fallback
- Compress antes de subir (Admin)
```

### Bundle Size
```typescript
- Tree-shaking habilitado (Vite default)
- Import solo lo necesario de MUI
- Eliminar console.logs en producción
- Analyze bundle: npm run build -- --analyze
```

---

## 📦 Build & Deployment

### Development
```bash
npm run dev              # Start dev server (localhost:5173)
npm run dev:expose       # Exponer en red local
npm run lint             # Run ESLint
```

### Production Build
```bash
npm run build           # TypeScript compile + Vite build
npm run preview         # Preview production build
```

### Deployment (Vercel)
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### Environment Setup
```bash
# Development
cp .env.example .env
# Fill with dev credentials

# Production
# Set in Vercel dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_PAYPAL_CLIENT_ID
# - VITE_MERCADOPAGO_PUBLIC_KEY
```

---

## 🔧 Development Tools

### ESLint
```json
// eslint.config.js
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### VS Code Extensions (Recommended)
```
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Path Intellisense
- Auto Rename Tag
- Material Icon Theme
```

---

## 📊 Browser Support

### Target Browsers
```
Chrome: Last 2 versions
Firefox: Last 2 versions
Safari: Last 2 versions
Edge: Last 2 versions
iOS Safari: Last 2 versions
Chrome Android: Last 2 versions
```

### Polyfills (Vite handles automatically)
```
- ES6+ features
- Promise
- Fetch API
- IntersectionObserver (lazy loading)
```

---

## 🚀 CI/CD Pipeline (Vercel)

```
GitHub Push → main branch
    ↓
Vercel webhook triggered
    ↓
1. Install dependencies (npm ci)
2. Run type check (tsc -b)
3. Run build (vite build)
4. Run tests (if configured)
    ↓
Deploy to production
    ↓
Automatic HTTPS
Automatic CDN distribution
Preview deployments for PRs
```

---

## 📝 Coding Standards

### Naming Conventions
```typescript
// Components: PascalCase
const ReportCard: React.FC = () => {}

// Hooks: camelCase con "use" prefix
const useAuth = () => {}

// Constants: UPPER_SNAKE_CASE
const API_TIMEOUT = 5000;

// Types/Interfaces: PascalCase
interface Report {}
type ReportStatus = 'draft' | 'published';

// Variables/Functions: camelCase
const fetchReports = async () => {}
const isLoggedIn = true;
```

### File Naming
```
- Components: PascalCase.tsx (e.g., ReportCard.tsx)
- Utilities: camelCase.ts (e.g., priceUtils.ts)
- Contexts: PascalCase + Context (e.g., CartContext.tsx)
- Pages: PascalCase + Page (e.g., HomePage.tsx)
```

### Import Order
```typescript
// 1. React & libraries
import React, { useState } from 'react';
import { Box, Button } from '@mui/material';

// 2. API & utils
import { reportsApi } from '../api/reports';
import { formatPrice } from '../utils/priceUtils';

// 3. Components
import ReportCard from '../components/ReportCard';

// 4. Contexts & hooks
import { useCart } from '../context/CartContext';

// 5. Types
import type { Report } from '../types';

// 6. Styles (si aplica)
import './HomePage.css';
```

