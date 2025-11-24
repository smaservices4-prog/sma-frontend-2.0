# 🔌 API Integration - SMA Frontend

## Versión: 2.0 - Backend Communication

---

## 🌐 Backend Architecture

### Supabase Edge Functions (Serverless)
```
Base URL: https://[project-id].supabase.co/functions/v1/

Authentication: Bearer token (JWT) en Authorization header
Content-Type: application/json
```

---

## 🔐 Authentication Endpoints

### Login
```typescript
Endpoint: Supabase Auth SDK (authApi.login)
Method: POST
Body: {
  email: string;
  password: string;
}

Response Success:
{
  user: {
    id: string;
    email: string;
    app_metadata: {
      role?: 'admin' | 'user';
    }
  },
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  }
}

Response Error:
{
  error: {
    message: string;
    status: number;
  }
}

Frontend Handling:
- Store session en Supabase (auto)
- Redirect basado en role
- Update global auth state
```

### Signup
```typescript
Endpoint: Supabase Auth SDK (authApi.signup)
Method: POST
Body: {
  email: string;
  password: string;
}

Response: Similar a Login

Frontend Handling:
- Auto-login después de signup exitoso
- Redirect a HomePage
- Show welcome toast
```

### Logout
```typescript
Endpoint: Supabase Auth SDK (authApi.logout)
Method: POST

Response: { success: true }

Frontend Handling:
- Clear all contexts (cart, search, etc.)
- Redirect a LoginPage
- Clear local storage
```

### Password Reset
```typescript
Endpoint: Supabase Auth SDK (authApi.resetPassword)
Method: POST
Body: {
  email: string;
}

Response: { success: true }

Frontend Handling:
- Show success message
- User recibe email con link
- Link abre ResetPasswordPage
```

---

## 📊 Reports Endpoints

### Get Reports
```typescript
Endpoint: /get-reports
Method: POST
Auth: Required (Bearer token)
Body: {}

Response:
{
  success: boolean;
  user_authenticated: boolean;
  total_reports: number;
  reports: Report[];
}

Report Interface:
{
  id: string;              // UUID
  title: string;           // "Reporte Enero 2025"
  month: string;           // "2025-01-01" (YYYY-MM-DD)
  prices: Array<{
    currency: 'USD' | 'ARS' | 'EUR';
    amount: number;
  }>;
  preview_url?: string;    // Optional image URL
  created_at: string;      // ISO timestamp
  purchased: boolean;      // Ya comprado por este usuario
  can_access: boolean;     // Puede descargar
}

Frontend Usage:
- Fetch on HomePage mount
- Store in SearchContext (allReports)
- Filter/search localmente
- Cache durante sesión
```

### Create Order
```typescript
Endpoint: /create-order
Method: POST
Auth: Required
Body: {
  cart: Array<{
    report_id: string;
    quantity: number;     // Siempre 1 en implementación actual
  }>;
  payment_provider: 'paypal' | 'mercadopago';
  currency?: 'USD' | 'ARS' | 'EUR';  // Optional, usa user preference si no se provee
}

Response Success:
{
  success: true;
  order_id: string;              // UUID de la orden
  checkout_url: string;          // URL del proveedor de pago
  provider_order_id: string;     // ID del proveedor
  total_amount: number;
  currency: string;
  expires_at: string;            // ISO timestamp
}

Response Error:
{
  success: false;
  error: string;
  code?: string;
}

Frontend Handling:
1. Validate cart not empty
2. Show loading state
3. Create order
4. Save order_id to localStorage (tracking)
5. Redirect to checkout_url
6. Handle errors con retry option
```

---

## 💾 Admin Storage Endpoints

### Upload File
```typescript
Endpoint: /storage-management
Method: POST
Auth: Required (Admin only)
Body: {
  action: "uploadFile";
  file: {
    name: string;
    size: number;
    type: string;
  };
  fileData: number[];         // Uint8Array convertido a array
  report_metadata: {
    title: string;
    month: string;            // "YYYY-MM-DD"
    prices: Array<{
      currency: string;
      amount: number;
    }>;
    preview_url?: string;
  };
}

Response Success:
{
  success: true;
  message: string;
  file_path: string;
  report_id: string;
}

Response Error:
{
  success: false;
  error: string;
}

Frontend Handling:
- Convert File to Uint8Array
- Show progress bar
- Validate file size (max 10MB)
- Reload file list after success
```

### List Files
```typescript
Endpoint: /storage-management
Method: POST
Auth: Required (Admin only)
Body: {
  action: "listFiles";
}

Response:
{
  success: true;
  files: Array<{
    id: string;              // Report ID
    title: string;
    month: string;
    file_path: string;
    prices: Array<{
      currency: string;
      amount: number;
    }>;
    preview_url?: string;
    created_at: string;
    updated_at: string;
  }>;
}

Frontend Handling:
- Fetch on AdminUploadPage mount
- Display in list with actions
- Refresh after upload/delete
```

### Delete File
```typescript
Endpoint: /storage-management
Method: POST
Auth: Required (Admin only)
Body: {
  action: "deleteFile";
  file_path: string;
}

Response:
{
  success: true;
  message: string;
}

Frontend Handling:
- Confirm dialog antes de delete
- Animate card removal
- Reload list
- Toast confirmation
```

### Get File URL
```typescript
Endpoint: /storage-management
Method: POST
Auth: Required (Admin only)
Body: {
  action: "getFileUrl";
  file_path: string;
}

Response:
{
  success: true;
  url: string;           // Signed URL con expiry
  expires_in: number;    // Segundos
}

Frontend Handling:
- Open URL en nueva pestaña (download)
- O mostrar en iframe (preview)
- URL expira después de tiempo
```

---

## 💱 Exchange Rates Endpoints

### Get Rates
```typescript
Endpoint: /exchange-rates
Method: POST
Auth: Optional (public)
Body: {}

Response:
{
  success: true;
  rates: {
    ARS_USD: number;     // e.g., 0.001 (1 ARS = 0.001 USD)
    EUR_USD: number;     // e.g., 1.08 (1 EUR = 1.08 USD)
    timestamp: string;   // ISO timestamp
  };
}

Frontend Usage:
- Load en ExchangeRateContext
- Display en admin panel widget
- Refresh manual button
- Cache durante 1 hora
```

---

## 👤 User Preferences Endpoints

### Get Preferences
```typescript
Endpoint: /user-preferences
Method: POST
Auth: Required
Body: {
  action: "get";
}

Response:
{
  success: true;
  data: {
    user_id: string;
    preferred_currency: 'USD' | 'ARS' | 'EUR';
    created_at: string;
    updated_at: string;
  } | null;
}

Frontend Usage:
- Load on CurrencyContext init
- Set initial currency selector
- Crear si no existe (default USD)
```

### Update Preferences
```typescript
Endpoint: /user-preferences
Method: POST
Auth: Required
Body: {
  action: "update";
  preferred_currency: 'USD' | 'ARS' | 'EUR';
}

Response:
{
  success: true;
  data: {
    user_id: string;
    preferred_currency: string;
    updated_at: string;
  };
}

Frontend Usage:
- Update cuando user cambia currency
- Silent update (no toast)
- Persist across sessions
```

---

## 🔄 Error Handling Strategy

### Standard Error Response
```typescript
{
  success: false;
  error: string;           // User-friendly message
  code?: string;           // Error code para logging
  details?: any;           // Detalles técnicos (dev only)
}
```

### Frontend Error Handler
```typescript
const handleApiError = (error: any): string => {
  // Network error
  if (!error.response) {
    return 'Error de conexión. Verifica tu internet.';
  }
  
  // Server error
  if (error.status >= 500) {
    return 'Error del servidor. Intenta nuevamente.';
  }
  
  // Client error
  if (error.status >= 400) {
    return error.message || 'Solicitud inválida.';
  }
  
  // Auth error
  if (error.status === 401) {
    // Redirect to login
    return 'Sesión expirada. Inicia sesión nuevamente.';
  }
  
  // Default
  return 'Ocurrió un error inesperado.';
};
```

### Retry Logic
```typescript
const fetchWithRetry = async (
  fetchFn: () => Promise<any>,
  maxRetries = 3,
  delay = 1000
): Promise<any> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};
```

---

## 🔒 Security Headers

### Request Headers
```typescript
{
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'X-Client-Version': '2.0.0',          // App version
  'X-Requested-With': 'XMLHttpRequest'  // CSRF protection
}
```

### Response Headers Esperados
```typescript
{
  'Content-Type': 'application/json',
  'X-RateLimit-Limit': '100',           // Requests por minuto
  'X-RateLimit-Remaining': '95',
  'X-RateLimit-Reset': '1640000000'     // Unix timestamp
}
```

---

## ⏱️ Timeouts & Limits

### Request Timeouts
```typescript
const TIMEOUT_CONFIGS = {
  short: 5000,      // 5s - Get requests, preferences
  medium: 15000,    // 15s - Create order, upload small files
  long: 60000       // 60s - Upload large files
};
```

### Rate Limits
```
Public endpoints: 100 req/min
Authenticated: 200 req/min
Admin: 500 req/min
File uploads: 10 req/min
```

### File Size Limits
```
Reports: 10 MB max
Preview images: 5 MB max
Total per request: 10 MB
```

---

## 📡 WebSocket / Real-time (Not Implemented)

### Future Enhancement
```typescript
// Posible implementación futura:
// - Real-time cart updates entre dispositivos
// - Notificaciones de nuevos reportes
// - Status updates de pagos

// Supabase Realtime:
const channel = supabase
  .channel('public:reports')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'reports' },
    (payload) => {
      // Handle new report
    }
  )
  .subscribe();
```

---

## 🧪 Testing API Calls

### Mock Data (Development)
```typescript
// src/api/__mocks__/reports.ts
export const mockReports: Report[] = [
  {
    id: '123',
    title: 'Reporte Test',
    month: '2025-01-01',
    prices: [
      { currency: 'USD', amount: 50 },
      { currency: 'ARS', amount: 5000 },
      { currency: 'EUR', amount: 45 }
    ],
    created_at: new Date().toISOString(),
    purchased: false,
    can_access: false,
    price: 50,
    currency: 'USD'
  }
];
```

### API Interceptor (Development)
```typescript
// Intercept requests en desarrollo
if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true') {
  // Return mock data
  return Promise.resolve(mockReports);
}
```

---

## 📊 API Performance Metrics

### Target Metrics
```
Get Reports: < 500ms
Create Order: < 2s
Upload File: < 5s (1MB file)
Get Preferences: < 300ms
Auth operations: < 1s
```

### Monitoring
```typescript
// Log slow API calls
const logSlowApi = (endpoint: string, duration: number) => {
  if (duration > 1000) {
    console.warn(`Slow API: ${endpoint} took ${duration}ms`);
  }
};

// Wrapper
const timedFetch = async (endpoint: string, options: any) => {
  const start = performance.now();
  const response = await fetch(endpoint, options);
  const duration = performance.now() - start;
  logSlowApi(endpoint, duration);
  return response;
};
```

---

## 🔗 API Client Utilities

### Price Utils
```typescript
// src/utils/priceUtils.ts

export const getPriceForCurrency = (
  report: Report, 
  currency: 'USD' | 'ARS' | 'EUR'
): { price: number; currency: string } => {
  const priceObj = report.prices.find(p => p.currency === currency);
  
  if (!priceObj) {
    // Fallback to first available price
    return {
      price: report.prices[0]?.amount || 0,
      currency: report.prices[0]?.currency || 'USD'
    };
  }
  
  return {
    price: priceObj.amount,
    currency: priceObj.currency
  };
};

export const formatPrice = (amount: number, currency: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    ARS: '$',
    EUR: '€'
  };
  
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency === 'ARS' ? 0 : 2,
    maximumFractionDigits: currency === 'ARS' ? 0 : 2
  });
  
  return `${symbols[currency]}${formatter.format(amount)}`;
};
```

### Auth Utils
```typescript
// src/utils/authUtils.ts

export const isAuthenticated = (): boolean => {
  // Check Supabase session
  const session = supabase.auth.getSession();
  return !!session;
};

export const getAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};

export const refreshSession = async (): Promise<void> => {
  const { error } = await supabase.auth.refreshSession();
  if (error) throw error;
};
```

---

## 🚨 Common API Issues & Solutions

### Issue 1: CORS Errors
```
Symptom: "Access-Control-Allow-Origin" error
Solution: 
- Verify Supabase project settings
- Check allowed origins in dashboard
- Ensure credentials: 'include' en requests
```

### Issue 2: 401 Unauthorized
```
Symptom: Token rejected
Solution:
- Check token expiry
- Refresh session
- Re-authenticate user
- Verify JWT format
```

### Issue 3: Rate Limiting
```
Symptom: 429 Too Many Requests
Solution:
- Implement exponential backoff
- Cache responses
- Reduce request frequency
- Upgrade plan si necesario
```

### Issue 4: Timeout
```
Symptom: Request hangs/times out
Solution:
- Increase timeout para operaciones largas
- Show loading indicator
- Add cancel button
- Retry mechanism
```

