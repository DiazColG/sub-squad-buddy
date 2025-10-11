// Email service desactivado (no-op). Mantener interfaz para evitar romper imports.
// Si se reactiva, reintroducir dependencia 'resend' y lógica real.

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

export const sendFeedbackNotification = async (_feedbackData: FeedbackEmailData): Promise<boolean> => {
  console.info('[emailService] Notificación feedback NO enviada (emailService inactivo).');
  return true; // devolvemos true para no cortar flujo de UI
};