# 🔐 Guía de Configuración: Google OAuth en Supabase

Esta guía te ayudará a configurar el inicio de sesión con Google en tu aplicación Suscrify.

## ⚠️ Nota Importante

**El código ya está implementado.** El botón de "Continuar con Google" ya aparece en tu app. Esta guía es solo para activarlo cuando estés listo.

---

## 📋 Paso 1: Obtener Credenciales de Google

### 1.1 Ir a Google Cloud Console
1. Abre [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. En el menú lateral, ve a **APIs & Services** → **Credentials**

### 1.2 Crear OAuth 2.0 Client ID
1. Click en **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Si es tu primera vez, configura la pantalla de consentimiento:
   - **User Type**: External
   - **App name**: Suscrify
   - **User support email**: tu email
   - **Developer contact**: tu email
3. Tipo de aplicación: **Web application**
4. Nombre: **Suscrify Web App**

### 1.3 Configurar URIs autorizados

**Authorized JavaScript origins:**
```
http://localhost:8080
https://tu-app.vercel.app
```

**Authorized redirect URIs:**
```
https://djaxvumqpzjfctklcoaf.supabase.co/auth/v1/callback
```

5. Click en **CREATE**
6. **¡IMPORTANTE!** Guarda el **Client ID** y **Client Secret**

---

## 🔧 Paso 2: Configurar en Supabase

### 2.1 Ir al Dashboard de Supabase
1. Abre [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: **djaxvumqpzjfctklcoaf**
3. En el menú lateral, ve a **Authentication** → **Providers**

### 2.2 Habilitar Google OAuth
1. Busca **Google** en la lista de providers
2. Click en **Enable**
3. Pega tu **Client ID** de Google
4. Pega tu **Client Secret** de Google
5. Click en **Save**

### 2.3 Configurar URLs (Opcional pero recomendado)
1. Ve a **Authentication** → **URL Configuration**
2. **Site URL**: `https://tu-app.vercel.app` (tu URL de producción)
3. **Redirect URLs**: Agrega estas URLs:
   ```
   http://localhost:8080/**
   https://tu-app.vercel.app/**
   ```

---

## ✅ Paso 3: Probar la Configuración

### 3.1 En Local (localhost)
1. Abre tu app en `http://localhost:8080`
2. Ve a **Login** o **Sign Up**
3. Click en **Continuar con Google**
4. Deberías ver la pantalla de selección de cuenta de Google
5. Al autorizar, deberías ser redirigido al dashboard

### 3.2 En Producción (Vercel)
1. Haz un deploy a Vercel
2. Repite los pasos de prueba en tu URL de producción

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"
**Solución:** Verifica que la URL de callback en Google Cloud Console sea exactamente:
```
https://djaxvumqpzjfctklcoaf.supabase.co/auth/v1/callback
```

### Error: "Access blocked"
**Solución:** 
1. Ve a Google Cloud Console
2. OAuth consent screen
3. Agrega tu email a **Test users** si la app está en modo testing

### El botón de Google no hace nada
**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Console**
3. Busca errores relacionados con Google OAuth
4. Verifica que hayas guardado las credenciales correctamente en Supabase

---

## 🎯 Notas Importantes

### Para Desarrollo Local
- Asegúrate de que `http://localhost:8080` esté en las URLs autorizadas de Google
- No necesitas HTTPS para localhost

### Para Producción en Vercel
- Vercel asigna automáticamente HTTPS
- Usa tu URL de Vercel (ej: `https://suscrify.vercel.app`)
- Actualiza las URLs autorizadas en Google Cloud Console

### Confirmación de Email
Por defecto, Supabase **NO requiere confirmación de email** cuando usas OAuth de Google, porque Google ya verificó el email del usuario.

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas con la configuración:
1. Verifica que las URLs coincidan exactamente
2. Asegúrate de haber guardado los cambios en ambos lados (Google y Supabase)
3. Intenta en modo incógnito para evitar problemas de caché
4. Revisa los logs en Supabase Dashboard → Logs → Auth Logs

---

## ✨ ¡Listo!

Una vez configurado, tus usuarios podrán:
- ✅ Registrarse con Google en 1 click
- ✅ Iniciar sesión sin recordar contraseñas
- ✅ Experiencia más rápida y profesional

El código ya maneja automáticamente:
- Creación de perfil de usuario
- Redirección al dashboard
- Manejo de errores
- Estados de carga

**¡No necesitas modificar nada en el código!**
