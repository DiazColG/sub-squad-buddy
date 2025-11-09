# Email Templates 📧

Profesional email system con React Email + Resend. Diseño minimalista estilo Apple.

## Templates Disponibles

### 1. WelcomeEmail 🎯
Email de bienvenida enviado automáticamente al registrar cuenta nueva.
- **Trigger**: Signup exitoso
- **Frecuencia**: Una vez (único)
- **Componente**: `WelcomeEmail.tsx`

### 2. PasswordResetEmail 🔐
Email transaccional para restablecer contraseña.
- **Trigger**: Usuario solicita reset password
- **Frecuencia**: Bajo demanda
- **Expiración**: 1 hora
- **Componente**: `PasswordResetEmail.tsx`

### 3. MonthlyInsightsEmail 📊
Resumen mensual de finanzas (OPCIONAL - requiere opt-in del usuario).
- **Trigger**: Fin de mes + usuario tiene preferencia activa
- **Frecuencia**: Mensual
- **Control**: Usuario puede activar/desactivar
- **Componente**: `MonthlyInsightsEmail.tsx`

## Testing Local

Puedes visualizar los emails en desarrollo usando React Email:

```bash
# Install React Email CLI (opcional, para preview)
npm install -g react-email

# Preview emails en localhost:3000
react-email dev src/emails
```

## Diseño

Principios de diseño:
- ✅ Minimalista y limpio (Apple-style)
- ✅ Responsive (mobile-first)
- ✅ Accesible (buen contraste, text-size)
- ✅ No invasivo (solo emails necesarios)
- ✅ Fácil de desuscribir (link siempre visible)

## Stack Técnico

- **Resend**: Email delivery service (3000 emails/mes gratis)
- **React Email**: JSX components para emails
- **TypeScript**: Type-safe email data
- **Supabase Edge Functions**: Triggers automáticos

## Configuración

Ver `docs/RESEND_SETUP_QUICK.md` para setup completo.
