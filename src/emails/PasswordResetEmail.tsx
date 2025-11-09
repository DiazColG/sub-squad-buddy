import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  expirationTime?: string;
}

export const PasswordResetEmail = ({ 
  userName, 
  resetUrl, 
  expirationTime = '1 hora' 
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Restablece tu contraseña de Compounding</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Restablecer contraseña 🔐</Heading>
        
        <Text style={text}>
          Hola <strong>{userName}</strong>,
        </Text>
        
        <Text style={text}>
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en Compounding.
        </Text>

        <Section style={warningBox}>
          <Text style={warningText}>
            ⏱️ Este enlace expira en <strong>{expirationTime}</strong>
          </Text>
        </Section>

        <Section style={buttonContainer}>
          <Button style={button} href={resetUrl}>
            Restablecer contraseña →
          </Button>
        </Section>

        <Text style={text}>
          O copia y pega este enlace en tu navegador:
        </Text>
        <Text style={linkText}>{resetUrl}</Text>

        <Hr style={hr} />

        <Section style={securityBox}>
          <Text style={securityTitle}>🛡️ Nota de seguridad:</Text>
          <Text style={securityText}>
            Si no solicitaste este cambio, ignora este email. Tu contraseña 
            permanecerá sin cambios y tu cuenta está segura.
          </Text>
          <Text style={securityText}>
            Nunca compartiremos tu información personal ni te pediremos tu 
            contraseña por email.
          </Text>
        </Section>

        <Text style={footer}>
          <strong>Compounding</strong> · Tu aliado financiero
        </Text>
      </Container>
    </Body>
  </Html>
);

PasswordResetEmail.PreviewProps = {
  userName: 'Carlos',
  resetUrl: 'https://compounding.vercel.app/reset-password?token=abc123',
  expirationTime: '1 hora',
} as PasswordResetEmailProps;

export default PasswordResetEmail;

// Styles - Apple-inspired minimalist design
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginTop: '40px',
  marginBottom: '40px',
  borderRadius: '12px',
  maxWidth: '600px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 20px',
  lineHeight: '1.3',
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const warningText = {
  color: '#92400e',
  fontSize: '15px',
  margin: '0',
  textAlign: 'center' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const linkText = {
  color: '#2563eb',
  fontSize: '13px',
  wordBreak: 'break-all' as const,
  margin: '8px 0 16px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const securityBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const securityTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const securityText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '8px 0',
};

const footer = {
  color: '#9ca3af',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '24px 0 8px',
  textAlign: 'center' as const,
};
