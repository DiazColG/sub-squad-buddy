import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'Compounding <onboarding@resend.dev>'

serve(async (req) => {
  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const { email, resetUrl, userName } = await req.json()

    // Validate inputs
    if (!email || !resetUrl) {
      return new Response(
        JSON.stringify({ error: 'Email and resetUrl are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: 'Restablece tu contraseña de Compounding 🔐',
        html: generatePasswordResetEmail(userName || 'Usuario', resetUrl),
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('[PasswordResetEmail] Resend error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await res.json()
    console.log('[PasswordResetEmail] Email sent:', data.id)

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[PasswordResetEmail] Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Simple HTML email template (inline styles for email compatibility)
function generatePasswordResetEmail(userName: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contraseña</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); padding: 40px 20px;">
          <tr>
            <td>
              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: 700; margin: 0 0 20px; line-height: 1.3;">
                Restablecer contraseña 🔐
              </h1>
              
              <p style="color: #525252; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                Hola <strong>${userName}</strong>,
              </p>
              
              <p style="color: #525252; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en Compounding.
              </p>

              <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="color: #92400e; font-size: 15px; margin: 0; text-align: center;">
                  ⏱️ Este enlace expira en <strong>1 hora</strong>
                </p>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="background-color: #dc2626; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 32px;">
                  Restablecer contraseña →
                </a>
              </div>

              <p style="color: #525252; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                O copia y pega este enlace en tu navegador:
              </p>
              <p style="color: #2563eb; font-size: 13px; word-break: break-all; margin: 8px 0 16px;">
                ${resetUrl}
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 12px;">
                  🛡️ Nota de seguridad:
                </p>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 8px 0;">
                  Si no solicitaste este cambio, ignora este email. Tu contraseña permanecerá sin cambios y tu cuenta está segura.
                </p>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 8px 0;">
                  Nunca compartiremos tu información personal ni te pediremos tu contraseña por email.
                </p>
              </div>

              <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 24px 0 8px; text-align: center;">
                <strong>Compounding</strong> · Tu aliado financiero
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
