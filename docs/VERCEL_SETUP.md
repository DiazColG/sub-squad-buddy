# 🚀 Vercel Environment Variables Setup

## ⚡ Configuración rápida (2 minutos)

### **PASO 1: Ir a Vercel Dashboard**

1. Abre: https://vercel.com/dashboard
2. Busca tu proyecto: **sub-squad-buddy** (o compoundingcap)
3. Click en el proyecto

### **PASO 2: Agregar Variables de Entorno**

1. Click en **"Settings"** (tab superior)
2. Click en **"Environment Variables"** (sidebar izquierdo)
3. Agregar estas 3 variables:

---

#### **Variable 1: VITE_POSTHOG_KEY**

```
Name:  VITE_POSTHOG_KEY
Value: phc_8rzPMi4UNqqNnSC9LPC7f491i96dY1eZExdajczpl2w
```

**Environments:** Marcar ✅ las 3 opciones:
- ✅ Production
- ✅ Preview
- ✅ Development

Click **"Save"**

---

#### **Variable 2: VITE_POSTHOG_HOST**

```
Name:  VITE_POSTHOG_HOST
Value: https://app.posthog.com
```

**Environments:** Marcar ✅ las 3 opciones:
- ✅ Production
- ✅ Preview
- ✅ Development

Click **"Save"**

---

#### **Variable 3: VITE_ANALYTICS_ENABLED**

```
Name:  VITE_ANALYTICS_ENABLED
Value: true
```

**Environments:** Marcar ✅ las 3 opciones:
- ✅ Production
- ✅ Preview
- ✅ Development

Click **"Save"**

---

### **PASO 3: Redeploy**

**Opción A: Esperar auto-deploy**
- Vercel detectará el push y hará deploy automático
- Tarda ~2-3 minutos
- Verás notificación en Vercel Dashboard

**Opción B: Forzar redeploy (más rápido)**
1. Ve a **"Deployments"** tab
2. Click en el último deployment
3. Click en **"..."** (3 dots)
4. Click **"Redeploy"**
5. Confirmar

---

### **PASO 4: Verificar en producción**

Una vez que el deploy termine:

1. **Ir a tu app:** https://compoundingcap.vercel.app
2. **Abrir PostHog Live Events:** https://app.posthog.com/events
3. **Hacer una acción en la app:**
   - Signup o Login
   - Crear un gasto
4. **Verificar en PostHog:**
   - Deberías ver eventos llegando
   - Con properties correctas
   - En menos de 10 segundos

---

## ✅ **Checklist de verificación:**

- [ ] 3 variables agregadas en Vercel
- [ ] Deploy completado (verde en Vercel)
- [ ] App cargando en production
- [ ] PostHog Live Events abierto
- [ ] Eventos llegando desde production
- [ ] Session replay funcionando

---

## 🔍 **Troubleshooting:**

### **No llegan eventos en production:**

1. ✅ Verifica que las 3 variables estén en Vercel
2. ✅ Verifica que estén marcadas para "Production"
3. ✅ Haz un redeploy forzado
4. ✅ Abre console del browser en production (F12)
5. ✅ Busca mensajes de PostHog o errores

### **Errores 404 en production:**

- Esto es por el SPA routing
- Ya tenemos `vercel.json` configurado
- Si sigue fallando, verifica que el archivo existe en el repo

### **Variables no se aplican:**

- Las variables solo se aplican en nuevos deploys
- Hacer redeploy después de agregarlas
- Esperar a que termine el build (verde)

---

## 📊 **URLs importantes:**

- **Production App:** https://compoundingcap.vercel.app
- **Vercel Dashboard:** https://vercel.com/diazcolg/sub-squad-buddy
- **PostHog Dashboard:** https://app.posthog.com/
- **PostHog Live Events:** https://app.posthog.com/events

---

## 🎯 **Próximos pasos después de verificar:**

1. ✅ Crear dashboards en PostHog
2. ✅ Setup alerts para errores críticos
3. ✅ Analizar primeros usuarios
4. ✅ Continuar con email system (Resend)

---

**¡Tu analytics está listo para production!** 🚀
