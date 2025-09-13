import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export interface FeedbackEmailData {
  userEmail: string;
  userName: string;
  type: 'improvement' | 'feature_request' | 'bug_report' | 'general';
  title: string;
  description: string;
  timestamp: string;
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

export const sendFeedbackNotification = async (feedbackData: FeedbackEmailData): Promise<boolean> => {
  try {
    console.log('Enviando email...', feedbackData);
    
    const typeLabel = getTypeLabel(feedbackData.type);
    const typeEmoji = getTypeEmoji(feedbackData.type);
    
    // Usar un servicio proxy para evitar CORS (solución temporal)
    const response = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://api.resend.com/emails'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Suscrify <noreply@resend.dev>',
        to: ['gonchidiazc@gmail.com'],
        subject: `${typeEmoji} Nueva sugerencia en Suscrify: ${feedbackData.title}`,
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
                    ${feedbackData.title}
                  </p>
                </div>
                
                <div style="margin-bottom: 16px;">
                  <strong style="color: #374151;">Descripción:</strong>
                  <div style="margin: 8px 0; padding: 16px; background-color: white; border-radius: 6px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: #1f2937; line-height: 1.6; white-space: pre-wrap;">
                      ${feedbackData.description}
                    </p>
                  </div>
                </div>
              </div>
              
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #92400e; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">
                  👤 Información del usuario
                </h3>
                <p style="margin: 0; color: #92400e;">
                  <strong>Nombre:</strong> ${feedbackData.userName}<br>
                  <strong>Email:</strong> ${feedbackData.userEmail}<br>
                  <strong>Fecha:</strong> ${feedbackData.timestamp}
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
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error enviando email:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('Email enviado exitosamente:', result);
    return true;
    
  } catch (error) {
    console.error('Error in sendFeedbackNotification:', error);
    return false;
  }
};