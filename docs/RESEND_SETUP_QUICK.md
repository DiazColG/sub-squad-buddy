# 🚀 Resend Setup - Quick Guide

## ⚡ Crear cuenta Resend (2 minutos)

### **PASO 1: Signup**
1. Ve a: https://resend.com/signup
2. Regístrate con GitHub o email
3. Confirma tu email

### **PASO 2: Get API Key**
1. Dashboard → API Keys (sidebar)
2. Click "Create API Key"
3. **Name:** Compounding Production
4. **Permission:** Full Access (default)
5. Click "Add"
6. **COPIA EL API KEY** (solo se muestra una vez)
   - Formato: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### **PASO 3: Pasame el API Key**
Simplemente pegalo acá en el chat:
```
re_tu_api_key_aqui
```

---

## ✅ **Lo que voy a hacer cuando me des el key:**

1. ✅ Instalar `resend` + `@react-email/components`
2. ✅ Crear estructura `/src/emails`
3. ✅ Configurar `.env.local` y `.env.example`
4. ✅ Crear templates base (Welcome, Password Reset)
5. ✅ Crear `emailService.ts` con wrappers
6. ✅ Integrar con Supabase Auth
7. ✅ Testear welcome email
8. ✅ Commit y deploy

**Tiempo estimado:** ~30 minutos

---

## 📊 **Free Tier de Resend:**
- ✅ 3,000 emails/mes GRATIS
- ✅ 100 emails/día
- ✅ API keys ilimitados
- ✅ Analytics incluido
- ✅ No requiere credit card

**Perfecto para empezar.** Cuando crezcas, es súper barato escalar.

---

## 🎯 **Emails que vamos a implementar (MVP):**

1. **Welcome Email** - Al registrarse (automático)
2. **Password Reset** - Al solicitar reset (automático)
3. **Monthly Insights** - Primer día del mes (opcional, configurable)

---

## 🔐 **Verificación de dominio (Opcional, para después):**

Si querés que los emails vengan de `@compounding.com` en vez de `@resend.dev`:

1. Comprar dominio (si no tenés)
2. Resend Dashboard → Domains → Add Domain
3. Agregar DNS records
4. Verificar

**Pero para testing:** Podemos usar `@resend.dev` (funciona perfecto)

---

**¿Ya tenés el API key de Resend?** Pegalo acá y arranco con todo 🚀
