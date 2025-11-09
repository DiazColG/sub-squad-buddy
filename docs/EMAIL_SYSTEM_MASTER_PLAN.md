# 📧 Email System Master Plan - Compounding

## 🎯 **Filosofía: "Helpful, Not Annoying"**

### **Principios de diseño:**
1. ✅ **Solo emails que aportan valor** - Nada de spam
2. ✅ **Hermosos y minimalistas** - Diseño Apple-style
3. ✅ **User-controlled** - Pueden desactivar cualquier tipo
4. ✅ **Smart timing** - Enviamos en el momento correcto
5. ✅ **Personalizados** - Con datos reales del usuario

---

## 📬 **Tipos de Emails (Solo 4 tipos esenciales)**

### **1. 🎉 Welcome Email** (Transaccional - Siempre)
**Trigger:** Inmediatamente después de signup  
**Frecuencia:** Una sola vez  
**Opt-out:** No (es transaccional)

**Contenido:**
```
Subject: ¡Bienvenido a Compounding, [Nombre]! 🚀

Body:
- Mensaje de bienvenida cálido
- 3 primeros pasos para empezar
- Link directo al dashboard
- Tip del día (rotativo)
- Footer: Links a ayuda y settings
```

**Diseño:** Minimalista, colores brand, un solo CTA prominente

---

### **2. 🔒 Password Reset** (Transaccional - Siempre)
**Trigger:** Usuario solicita reset de password  
**Frecuencia:** On-demand  
**Opt-out:** No (es transaccional)

**Contenido:**
```
Subject: Reinicia tu contraseña - Compounding

Body:
- Confirmación de solicitud
- Botón grande "Reiniciar contraseña"
- Link expira en 1 hora
- "No lo solicitaste?" → Ignora este email
- Footer con contacto de soporte
```

**Seguridad:** Link con token de 1 hora, sin información sensible

---

### **3. 💡 Monthly Financial Insights** (Promocional - Opcional)
**Trigger:** Primer día del mes a las 9 AM (hora del usuario)  
**Frecuencia:** Mensual  
**Opt-out:** ✅ Sí (configurable en settings)  
**Condición:** Solo si tiene actividad en el mes anterior

**Contenido:**
```
Subject: Tu resumen financiero de [Mes] 📊

Body:
- Saludo personalizado
- 📈 Highlight: Mayor logro del mes
- 💰 Total gastado vs presupuesto
- 🎯 Progreso hacia FIRE (si lo usa)
- 💡 Un insight o consejo personalizado
- 🔗 CTA: "Ver dashboard completo"
```

**Personalización:**
- Usa datos reales del usuario
- Insights basados en sus patrones
- Celebra logros (gastaste menos, ahorraste más)
- Motivacional, no crítico

**Ejemplos de insights:**
- "Gastaste 15% menos en Comida este mes 🎉"
- "Estás 2 meses adelante en tu plan FIRE 🚀"
- "Tus gastos recurrentes bajaron $200 💪"

---

### **4. 🎯 Smart Reminders** (Útiles - Opcional)
**Trigger:** Eventos importantes  
**Frecuencia:** Max 1 por semana  
**Opt-out:** ✅ Sí (configurable por tipo)

**Tipos de reminders:**

**A) Budget Alert** (Solo si está al 90% del presupuesto)
```
Subject: 🚨 Acercándote al límite de tu presupuesto

Body:
- Presupuesto: $10,000 / $11,000 usado (90%)
- Categoría: Comida & Restaurantes
- Quedan 15 días del mes
- CTA: "Ajustar presupuesto" o "Ver detalles"
```

**B) Subscription Renewal** (3 días antes de renovación)
```
Subject: 💳 Netflix se renovará en 3 días - $14.99

Body:
- Subscripción: Netflix Premium
- Renueva: 15 de Enero
- Monto: $14.99
- "¿Aún la usas?" → Link para cancelar/editar
```

**C) Unusual Expense** (Gasto > 2x promedio)
```
Subject: 👀 Detectamos un gasto inusual

Body:
- Gasto: $500 en Electrónica
- Tu promedio: $150
- ¿Todo correcto? Confirma o reporta error
- Link para categorizar mejor
```

---

## 🎨 **Diseño Visual (Brand Identity)**

### **Color Palette:**
```css
Primary:   #6366f1  /* Indigo - CTA buttons */
Success:   #10b981  /* Green - Positive insights */
Warning:   #f59e0b  /* Amber - Alerts */
Neutral:   #6b7280  /* Gray - Text secondary */
Background: #f9fafb /* Light gray */
```

### **Typography:**
```
Headings:  Inter, system-ui (Bold, 24px-32px)
Body:      Inter, system-ui (Regular, 16px)
Numbers:   SF Mono, monospace (Semibold)
```

### **Layout:**
- Max width: 600px
- Padding: 40px
- Single column
- Mobile-first
- Dark mode support (respeta preferencias del sistema)

---

## 🛠️ **Tech Stack**

### **Email Service: Resend**
**Por qué Resend:**
- ✅ Developer-friendly API
- ✅ React Email support nativo
- ✅ 99%+ delivery rate
- ✅ GRATIS: 3,000 emails/mes
- ✅ Analytics incluido
- ✅ Domain verification fácil

**Alternativas descartadas:**
- ❌ SendGrid: Más complejo, UI dated
- ❌ AWS SES: Requiere mucho setup
- ❌ Mailgun: Menos features

### **Templates: React Email**
**Por qué React Email:**
- ✅ Escribe JSX, output HTML perfecto
- ✅ Preview en dev mode
- ✅ Components reutilizables
- ✅ TypeScript support
- ✅ Testing fácil

### **Triggers: Supabase Edge Functions**
**Por qué Edge Functions:**
- ✅ Serverless (no infrastructure)
- ✅ TypeScript nativo
- ✅ Deploy automático
- ✅ Logs y monitoring
- ✅ GRATIS en plan actual

---

## 📊 **User Preferences (Settings)**

### **Email Settings Panel:**

```typescript
interface EmailPreferences {
  // Transaccionales (no se pueden desactivar)
  welcome: true,              // Always on
  password_reset: true,       // Always on
  
  // Promocionales (opt-in/out)
  monthly_insights: boolean,  // Default: true
  
  // Reminders (granular control)
  budget_alerts: boolean,     // Default: true
  subscription_reminders: boolean, // Default: true
  unusual_expense_alerts: boolean, // Default: false
  
  // Frequency control
  max_emails_per_week: number, // Default: 3, Min: 1, Max: 7
  
  // Timing
  preferred_time: string,     // Default: "09:00" (user timezone)
  timezone: string,           // Auto-detected
}
```

### **UI en Settings:**
```
┌─────────────────────────────────────┐
│ 📧 Email Preferences                │
├─────────────────────────────────────┤
│                                     │
│ 📬 Transaccional Emails (Always On) │
│  ✅ Welcome email                   │
│  ✅ Password reset                  │
│                                     │
│ 💌 Monthly Updates                  │
│  🔘 Monthly financial insights      │
│     ↳ Resumen de tu mes             │
│                                     │
│ 🔔 Smart Reminders                  │
│  🔘 Budget alerts (90% límite)      │
│  🔘 Subscription renewals           │
│  ⚪ Unusual expense alerts           │
│                                     │
│ ⚙️ Frequency Control                │
│  Max emails per week: [3] ▼         │
│  Preferred time: [09:00] ▼          │
│                                     │
│ [Save Preferences]                  │
└─────────────────────────────────────┘
```

---

## 🚀 **Implementation Plan**

### **Phase 1: Setup (30 min)**
1. ✅ Crear cuenta Resend
2. ✅ Instalar `resend` + `@react-email/components`
3. ✅ Configurar API key en .env
4. ✅ Setup domain verification (opcional pero recomendado)

### **Phase 2: Templates (2 horas)**
1. ✅ Create base template component
2. ✅ Welcome email template
3. ✅ Password reset template
4. ✅ Monthly insights template
5. ✅ Alert templates (budget, subscription, unusual)

### **Phase 3: Email Service Layer (1 hora)**
1. ✅ Create `src/lib/emailService.ts`
2. ✅ Wrapper functions para cada tipo de email
3. ✅ Error handling y retry logic
4. ✅ Analytics tracking (PostHog)

### **Phase 4: Supabase Integration (2 horas)**
1. ✅ Edge Function: `send-welcome-email`
2. ✅ Edge Function: `send-password-reset`
3. ✅ Edge Function: `send-monthly-insights` (cron)
4. ✅ Database triggers (user signup → welcome email)

### **Phase 5: User Preferences (1 hora)**
1. ✅ Create `email_preferences` table
2. ✅ Settings UI component
3. ✅ API hooks para update preferences
4. ✅ Enforce preferences en edge functions

### **Phase 6: Testing (30 min)**
1. ✅ Test welcome email (signup flow)
2. ✅ Test password reset (forgot password flow)
3. ✅ Test preferences (enable/disable)
4. ✅ Verify analytics tracking

---

## 📈 **Success Metrics**

### **Email Performance:**
- **Delivery rate:** >99%
- **Open rate:** >40% (industria: 20-25%)
- **Click rate:** >15% (industria: 2-5%)
- **Unsubscribe rate:** <0.5%
- **Spam complaints:** <0.1%

### **User Engagement:**
- % usuarios con monthly insights enabled: Target >70%
- % usuarios que abren monthly insights: Target >50%
- % usuarios que actúan después de alerts: Target >30%

### **Technical:**
- Email send latency: <2 segundos
- Delivery time: <30 segundos
- Failed sends: <0.1%

---

## 💰 **Cost Analysis**

### **Free Tier (Resend):**
- 3,000 emails/mes gratis
- Perfecto para primeros ~300 usuarios activos
- 10 emails/usuario/mes promedio

### **Paid (si creces):**
- $20/mes = 50,000 emails
- $80/mes = 100,000 emails
- ~$0.0004 por email

### **Proyección:**
```
100 usuarios  = ~1,000 emails/mes   = $0 (free tier)
500 usuarios  = ~5,000 emails/mes   = $20/mes
1000 usuarios = ~10,000 emails/mes  = $20/mes
5000 usuarios = ~50,000 emails/mes  = $80/mes
```

**ROI:** Emails aumentan retention 30%+ → Vale la pena

---

## 🎯 **Content Strategy**

### **Tone of Voice:**
- **Amigable pero profesional** (como un amigo financiero experto)
- **Motivacional, no crítico** ("Lograste X" vs "Fallaste en Y")
- **Claro y conciso** (menos de 200 palabras por email)
- **Action-oriented** (siempre un CTA claro)

### **Personalization Variables:**
```typescript
{
  user_name: string,
  account_type: 'personal' | 'team',
  currency: string,
  timezone: string,
  
  // Financial data
  total_spent_month: number,
  total_budget_month: number,
  savings_rate: number,
  fire_progress: number,
  
  // Insights
  top_category: string,
  biggest_achievement: string,
  recommendation: string,
}
```

### **Email Copy Examples:**

**Welcome Email:**
```
¡Hola Diego! 👋

Bienvenido a Compounding. Estamos emocionados de ayudarte 
a tomar control de tus finanzas.

Para empezar, aquí están tus primeros pasos:

1. 📊 Agrega tus primeros gastos
2. 💰 Crea un presupuesto mensual  
3. 🎯 Define tu meta FIRE

¿Listo para empezar?
[Ir a mi Dashboard]

P.D. Si necesitas ayuda, respondé este email. 
Estamos acá para vos.

- El equipo de Compounding
```

**Monthly Insights:**
```
Tu Enero fue increíble, Diego 🎉

Este mes lograste:
• Gastaste $45,320 (5% menos que Diciembre)
• Ahorraste $12,000 extra
• Estás 3 semanas adelante en tu plan FIRE 🚀

📊 Tu categoría top: Comida ($15,200)
💡 Insight: Tus almuerzos de oficina costaron $8,000. 
   ¿Qué tal llevar vianda 2 días a la semana? Podrías 
   ahorrar ~$3,000/mes.

[Ver Dashboard Completo]

Seguí así 💪
```

---

## 🔐 **Privacy & Security**

### **Data Handling:**
- ✅ NO guardamos emails enviados (solo logs de Resend)
- ✅ Tokens de reset expiran en 1 hora
- ✅ Unsubscribe link en cada email promocional
- ✅ GDPR compliant (delete user data on request)
- ✅ Encriptación TLS 1.3 en tránsito

### **Compliance:**
- ✅ CAN-SPAM Act (US)
- ✅ GDPR (EU)
- ✅ CASL (Canada)
- ✅ Privacy Policy actualizado

---

## 📝 **Next Steps (Ahora)**

1. **Usuario crea cuenta Resend** (2 min)
2. **Yo instalo dependencias** (1 min)
3. **Yo creo templates base** (15 min)
4. **Testing welcome email** (5 min)
5. **Deploy y verificar** (10 min)

**Total time:** ~35 minutos para MVP funcional

---

## ✨ **Future Enhancements (v2)**

### **After MVP:**
1. 📧 **Email A/B Testing** - Optimizar subject lines
2. 🎨 **Custom Branding** - Logo del usuario en emails
3. 🌐 **Multi-language** - i18n support
4. 📊 **Advanced Analytics** - Heatmaps, engagement scoring
5. 🤖 **AI-powered Insights** - GPT-4 para mejores consejos
6. 📱 **Email → App deep links** - Open specific screens
7. 🎁 **Milestone Emails** - "First $10K saved", "100 days streak"

---

**¿Arrancamos? Dame el OK y empiezo con el setup de Resend.** 🚀
