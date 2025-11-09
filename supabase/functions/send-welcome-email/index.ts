import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'Compounding <onboarding@resend.dev>'

serve(async (req) => {
  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const { email, userName, loginUrl } = await req.json()

    // Validate inputs
    if (!email || !userName) {
      return new Response(
        JSON.stringify({ error: 'Email and userName are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const finalLoginUrl = loginUrl || 'https://compounding.vercel.app/dashboard'

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
        subject: '¡Bienvenido a Compounding! 🎯',
        html: generateWelcomeEmail(userName, finalLoginUrl),
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('[WelcomeEmail] Resend error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await res.json()
    console.log('[WelcomeEmail] Email sent:', data.id)

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[WelcomeEmail] Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Welcome email HTML template
function generateWelcomeEmail(userName: string, loginUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Compounding</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); padding: 40px 20px;">
          <tr>
            <td>
              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: 700; margin: 0 0 20px; line-height: 1.3;">
                ¡Bienvenido a Compounding! 🎯
              </h1>
              
              <p style="color: #525252; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                Hola <strong>${userName}</strong>,
              </p>
              
              <p style="color: #525252; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                Nos alegra mucho tenerte aquí. Compounding está diseñado para ayudarte a tomar el control de tus finanzas personales de forma inteligente y sin estrés.
              </p>

              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 32px 0;">
                <p style="color: #1a1a1a; font-size: 18px; font-weight: 600; margin: 0 0 16px;">
                  🚀 Qué puedes hacer ahora:
                </p>
                <p style="color: #525252; font-size: 15px; line-height: 1.6; margin: 8px 0;">
                  📊 Registra tus gastos e ingresos
                </p>
                <p style="color: #525252; font-size: 15px; line-height: 1.6; margin: 8px 0;">
                  💰 Crea presupuestos inteligentes
                </p>
                <p style="color: #525252; font-size: 15px; line-height: 1.6; margin: 8px 0;">
                  🔥 Calcula tu independencia financiera (FIRE)
                </p>
                <p style="color: #525252; font-size: 15px; line-height: 1.6; margin: 8px 0;">
                  📈 Visualiza tu progreso en tiempo real
                </p>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${loginUrl}" style="background-color: #2563eb; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 32px;">
                  Empezar ahora →
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

              <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 8px 0;">
                Este es un email único de bienvenida. Solo te contactaremos cuando sea necesario o si tú lo solicitas desde tu configuración.
              </p>

              <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 8px 0;">
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
