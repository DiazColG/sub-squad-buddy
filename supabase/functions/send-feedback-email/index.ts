import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userEmail, userName, type, title, description, timestamp } = await req.json()

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const getTypeLabel = (type: string): string => {
      const labels = {
        improvement: 'Mejora',
        feature_request: 'Nueva función',
        bug_report: 'Reportar error',
        general: 'Comentario general'
      };
      return labels[type as keyof typeof labels] || type;
    };

    const getTypeEmoji = (type: string): string => {
      const emojis = {
        improvement: '⭐',
        feature_request: '💡',
        bug_report: '🐛',
        general: '💬'
      };
      return emojis[type as keyof typeof emojis] || '📝';
    };

    const typeLabel = getTypeLabel(type)
    const typeEmoji = getTypeEmoji(type)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Suscrify <noreply@resend.dev>',
        to: ['gonchidiazc@gmail.com'],
        subject: `${typeEmoji} Nueva sugerencia en Suscrify: ${title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #1f2937; font-size: 28px; margin: 0; font-weight: bold;">
                  ${typeEmoji} Nueva sugerencia de usuario
                </h1>
                <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 16px;">
                  Un usuario beta ha enviado feedback en Suscrify
                </p>
              </div>
              
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #374151; font-size: 20px; margin: 0 0 16px 0; font-weight: 600;">
                  📋 Detalles del feedback
                </h2>
                
                <div style="margin-bottom: 16px;">
                  <strong style="color: #374151;">Tipo:</strong>
                  <span style="margin-left: 8px; background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                    ${typeLabel}
                  </span>
                </div>
                
                <div style="margin-bottom: 16px;">
                  <strong style="color: #374151;">Título:</strong>
                  <p style="margin: 4px 0; color: #1f2937; font-size: 16px; font-weight: 500;">
                    ${title}
                  </p>
                </div>
                
                <div style="margin-bottom: 16px;">
                  <strong style="color: #374151;">Descripción:</strong>
                  <div style="margin: 8px 0; padding: 16px; background-color: white; border-radius: 6px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: #1f2937; line-height: 1.6; white-space: pre-wrap;">
                      ${description}
                    </p>
                  </div>
                </div>
              </div>
              
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #92400e; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">
                  👤 Información del usuario
                </h3>
                <p style="margin: 0; color: #92400e;">
                  <strong>Nombre:</strong> ${userName}<br>
                  <strong>Email:</strong> ${userEmail}<br>
                  <strong>Fecha:</strong> ${timestamp}
                </p>
              </div>
              
              <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Este email fue generado automáticamente por Suscrify
                </p>
              </div>
            </div>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Resend API error: ${res.status} ${errorText}`)
    }

    const data = await res.json()
    console.log('Email sent successfully:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})