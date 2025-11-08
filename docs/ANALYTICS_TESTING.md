# 🧪 Analytics Testing Guide

## ✅ Eventos implementados y listos para testing

### 📋 **Checklist de testing:**

#### **1. Authentication Events:**

| Evento | Trigger | Cómo testear |
|--------|---------|--------------|
| ✅ `user_signed_up` | Registro exitoso | Ve a /signup, crea cuenta nueva |
| ✅ `signup_failed` | Error en registro | Intenta con email ya existente |
| ✅ `user_logged_in` | Login exitoso | Ve a /login, inicia sesión |
| ✅ `login_failed` | Error en login | Intenta con credenciales incorrectas |
| ✅ `password_reset_requested` | Solicitud de reset | Ve a /forgot-password, ingresa email |
| ✅ `password_updated` | Contraseña actualizada | Completa flujo de reset password |

#### **2. Feature Events:**

| Evento | Trigger | Cómo testear |
|--------|---------|--------------|
| ✅ `expense_created` | Crear gasto | Dashboard → Gastos → Agregar gasto |
| ✅ `budget_created` | Crear presupuesto | Dashboard → Presupuestos → Agregar |
| ✅ `fire_calculator_used` | Usar calculadora FIRE | Dashboard → FIRE Calculator → Calcular |

#### **3. Navigation Events (automáticos):**

| Evento | Trigger | Cómo testear |
|--------|---------|--------------|
| ✅ `$pageview` | Cambio de página | Navega entre páginas de la app |
| ✅ `$pageleave` | Salir de página | Cierra tab o navega a otra URL |

---

## 🔍 **Cómo verificar en PostHog:**

### **Opción 1: Live Events (Tiempo real)**

1. **Abrir PostHog Dashboard:**
   - URL: https://app.posthog.com/
   - Login con tu cuenta

2. **Ir a Live Events:**
   - Sidebar izquierdo → "Activity" → "Live Events"
   - O directo: https://app.posthog.com/events

3. **Dejar abierto y testear:**
   - En otra pestaña: localhost:8080
   - Haz acciones (signup, create expense, etc.)
   - Verás eventos aparecer en tiempo real (<10 seg)

### **Opción 2: Events List**

1. **Ir a Events:**
   - PostHog Dashboard → "Events" en sidebar
   
2. **Filtrar por evento:**
   - Busca por nombre: `user_signed_up`, `expense_created`, etc.
   - Filtra por fecha/hora
   - Ve properties de cada evento

3. **Ver detalles:**
   - Click en cualquier evento
   - Verás todas las properties enviadas
   - Session replay (si está habilitado)

---

## 📊 **Properties enviadas por evento:**

### **Authentication:**

```javascript
// user_signed_up
{
  method: 'email' | 'google',
  account_type: 'personal' | 'team'
}

// user_logged_in
{
  method: 'email' | 'google'
}

// password_reset_requested
{
  success: true | false,
  error?: string // si falló
}
```

### **Features:**

```javascript
// expense_created
{
  expense_type: string,
  amount: number,
  currency: string,
  payment_method: string,
  is_recurring: boolean
}

// budget_created
{
  period_type: string,
  budgeted_amount: number,
  has_category: boolean,
  alert_threshold: number
}

// fire_calculator_used
{
  fire_number: number,
  current_portfolio: number,
  progress_percentage: number,
  estimated_months: number,
  withdrawal_rate: number,
  currency: string
}
```

---

## 🎥 **Session Replay:**

### **Cómo ver replays:**

1. **PostHog Dashboard → Session Recordings**
2. Verás lista de sesiones grabadas
3. Click en cualquiera para ver replay
4. Puedes filtrar por:
   - Usuario
   - Fecha
   - Eventos específicos
   - Duración

### **Qué se graba:**
- ✅ Clicks, scrolls, navegación
- ✅ Tiempo en cada página
- ✅ Interacciones con formularios
- ❌ NO passwords ni datos sensibles

---

## 🚨 **Troubleshooting:**

### **No veo eventos:**

1. ✅ Verifica `.env.local` existe y tiene el API key correcto
2. ✅ Restart server: `Ctrl+C` → `npm run dev`
3. ✅ Abre console del browser (F12) y busca:
   - `[PostHog]` messages
   - Errores de red
4. ✅ Verifica en PostHog Settings que el proyecto está activo

### **Eventos con delay:**

- Es normal, PostHog procesa en batches
- Live Events: <10 segundos
- Events list: 1-2 minutos
- Dashboards: hasta 5 minutos

### **Missing properties:**

- Verifica que el evento se envía con `analytics.track()`
- Chequea console del browser por errores
- Properties pueden ser `undefined` si el valor no existe

---

## ✅ **Testing Script:**

Ejecutá esta secuencia completa para testing end-to-end:

1. **Abrir PostHog Live Events**
2. **En localhost:8080:**
   - Signup con nuevo email
   - Login con ese email
   - Crear un gasto
   - Crear un presupuesto
   - Usar FIRE Calculator
3. **Verificar en PostHog:**
   - 1 × `user_signed_up`
   - 1 × `user_logged_in`
   - 1 × `expense_created`
   - 1 × `budget_created`
   - 1 × `fire_calculator_used`
   - 5+ × `$pageview`

---

## 📈 **Próximos pasos:**

Una vez que veas los eventos funcionando:

1. ✅ Configurar en Vercel (production)
2. ✅ Crear dashboards en PostHog
3. ✅ Setup alerts para errores críticos
4. ✅ Analizar user behavior patterns

---

**¡Listo para testear!** 🚀

Recuerda: El servidor ya está corriendo en http://localhost:8080
