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

interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
}

export const WelcomeEmail = ({ userName, loginUrl }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>¡Bienvenido a Compounding! Empieza tu viaje financiero hoy</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>¡Bienvenido a Compounding! 🎯</Heading>
        
        <Text style={text}>
          Hola <strong>{userName}</strong>,
        </Text>
        
        <Text style={text}>
          Nos alegra mucho tenerte aquí. Compounding está diseñado para ayudarte a 
          tomar el control de tus finanzas personales de forma inteligente y sin estrés.
        </Text>

        <Section style={features}>
          <Text style={featureTitle}>🚀 Qué puedes hacer ahora:</Text>
          <Text style={featureItem}>📊 Registra tus gastos e ingresos</Text>
          <Text style={featureItem}>💰 Crea presupuestos inteligentes</Text>
          <Text style={featureItem}>🔥 Calcula tu independencia financiera (FIRE)</Text>
          <Text style={featureItem}>📈 Visualiza tu progreso en tiempo real</Text>
        </Section>

        <Section style={buttonContainer}>
          <Button style={button} href={loginUrl}>
            Empezar ahora →
          </Button>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Este es un email único de bienvenida. Solo te contactaremos cuando sea 
          necesario o si tú lo solicitas desde tu configuración.
        </Text>

        <Text style={footer}>
          <strong>Compounding</strong> · Tu aliado financiero
        </Text>
      </Container>
    </Body>
  </Html>
);

WelcomeEmail.PreviewProps = {
  userName: 'María',
  loginUrl: 'https://compounding.vercel.app/dashboard',
} as WelcomeEmailProps;

export default WelcomeEmail;

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

const features = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
};

const featureTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const featureItem = {
  color: '#525252',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  color: '#9ca3af',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '8px 0',
};
