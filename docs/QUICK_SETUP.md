# 🚀 Quick Setup - Analytics & Email

## ⚡ Setup en 5 minutos

### 📊 **STEP 1: PostHog Analytics**

#### 1.1 Crear cuenta (2 minutos)
1. Ve a: https://posthog.com/signup
2. Regístrate con email o GitHub
3. Crea proyecto: "Compounding Production"
4. Copia tu **Project API Key** (empieza con `phc_...`)

#### 1.2 Configurar variables de entorno (1 minuto)

**Local (desarrollo):**
```bash
# En la raíz del proyecto, crea archivo .env.local
VITE_POSTHOG_KEY=phc_tu_api_key_aqui
VITE_POSTHOG_HOST=https://app.posthog.com
VITE_ANALYTICS_ENABLED=true
```

**Producción (Vercel):**
1. Ve a: https://vercel.com → Tu Proyecto → Settings → Environment Variables
2. Agrega las 3 variables de arriba
3. Marca "Production" y "Preview"
4. Click "Save"

#### 1.3 Verificar que funciona (2 minutos)
1. Restart del dev server: `npm run dev`
2. Abre la app en el browser
3. Ve a PostHog Dashboard → Live Events
4. Deberías ver eventos de `$pageview`
5. Haz signup/login → verás eventos de `user_signed_up` y `user_logged_in`

✅ **¡Listo!** Ya tenés analytics funcionando.

---

### 📧 **STEP 2: Custom Emails (Próximamente)**

#### Pendiente de implementar:
1. Crear cuenta en Resend
2. Instalar React Email
3. Crear templates
4. Configurar Edge Functions

**Por ahora, Supabase está enviando emails por defecto (gratis).**

---

## 📈 **Eventos que se están trackeando ahora:**

### **Autenticación:**
| Evento | Cuándo se dispara | Properties |
|--------|-------------------|------------|
| `user_signed_up` | Usuario se registra exitosamente | `method`, `account_type` |
| `signup_failed` | Falla el registro | `error`, `method` |
| `signup_error` | Error de conexión en signup | `error` |
| `user_logged_in` | Login exitoso | `method` |
| `login_failed` | Falla el login | `error`, `method` |
| `login_error` | Error de conexión en login | `error`, `method` (opcional) |
| `password_reset_requested` | Usuario solicita reset | `success` |
| `password_reset_error` | Error en solicitud de reset | `error` |
| `password_updated` | Contraseña actualizada | `success` |
| `password_update_error` | Error al actualizar password | `error` |

### **User Identity:**
- Cada usuario se identifica automáticamente con su email
- Se envía metadata: `account_type`, `created_at`

### **Navegación:**
- `$pageview` - Automático en cada cambio de ruta
- `$pageleave` - Automático cuando sale de una página

---

## 🎥 **Session Replay**

**Ya está activo automáticamente.**

### Cómo ver replays:
1. Ve a PostHog Dashboard
2. Click en "Session Recordings" en el sidebar
3. Verás lista de sesiones grabadas
4. Click en cualquiera para ver el replay

### Qué graba:
- ✅ Clicks del mouse
- ✅ Scrolls
- ✅ Navegación entre páginas
- ✅ Tiempo de permanencia
- ❌ NO graba passwords ni datos sensibles

---

## 🔍 **Cómo usar PostHog Dashboard:**

### **Ver usuarios activos ahora:**
1. Dashboard → Live Events
2. Verás eventos en tiempo real

### **Crear gráficos:**
1. Insights → New Insight
2. Selecciona tipo (Trends, Funnels, etc.)
3. Elige evento (ej: `user_signed_up`)
4. Filtra por fecha/properties
5. Save to Dashboard

### **Análisis recomendados:**

#### **Signups por día:**
- Type: Trends
- Event: `user_signed_up`
- Breakdown: `method` (email vs google)

#### **Login success rate:**
- Type: Trends
- Events: `user_logged_in` vs `login_failed`
- Math: Ratio

#### **Signup Funnel:**
- Type: Funnels
- Steps:
  1. $pageview (URL = /signup)
  2. user_signed_up
  3. user_logged_in
  4. $pageview (URL = /dashboard)

---

## 🚨 **Troubleshooting**

### No veo eventos en PostHog:
1. ✅ Verifica que `.env.local` tiene el API key correcto
2. ✅ Restart del server: `Ctrl+C` → `npm run dev`
3. ✅ Abre la consola del browser (F12) → busca errores de PostHog
4. ✅ Verifica que `VITE_ANALYTICS_ENABLED=true`

### Eventos llegan con delay:
- Es normal, PostHog procesa en batches
- En "Live Events" deberías ver en <10 segundos
- En gráficos puede tardar 1-2 minutos

### No graba session replays:
- Verifica en PostHog Settings → Project Settings → Recordings
- Debe estar "Enable Recordings" activado

---

## 💰 **Límites gratis:**

### PostHog:
- ✅ 1M eventos/mes
- ✅ 15K session recordings/mes
- ✅ Ilimitados proyectos
- ✅ Ilimitados team members

### Supabase (emails actuales):
- ✅ 4 emails/hora
- ✅ Suficiente para desarrollo
- ⚠️ Para producción necesitarás Resend (3K emails/mes gratis)

---

## 📚 **Documentación completa:**

Ver: `/docs/ANALYTICS_EMAIL_SETUP.md`

---

## ✅ **Checklist:**

- [ ] Cuenta de PostHog creada
- [ ] API Key copiado
- [ ] `.env.local` configurado
- [ ] Variables en Vercel agregadas
- [ ] Dev server reiniciado
- [ ] Verificado eventos en Live Events
- [ ] Dashboard básico creado en PostHog

**¡Una vez completado, tenés analytics de nivel enterprise!** 🎉
