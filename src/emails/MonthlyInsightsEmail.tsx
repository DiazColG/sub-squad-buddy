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
  Column,
  Row,
} from '@react-email/components';

interface MonthlyInsightsEmailProps {
  userName: string;
  month: string;
  totalExpenses: string;
  totalIncome: string;
  savings: string;
  savingsRate: string;
  topCategory: string;
  budgetPerformance: 'great' | 'good' | 'warning';
  dashboardUrl: string;
  unsubscribeUrl: string;
}

export const MonthlyInsightsEmail = ({
  userName,
  month,
  totalExpenses,
  totalIncome,
  savings,
  savingsRate,
  topCategory,
  budgetPerformance,
  dashboardUrl,
  unsubscribeUrl,
}: MonthlyInsightsEmailProps) => {
  const performanceEmoji = {
    great: '🌟',
    good: '👍',
    warning: '⚠️',
  }[budgetPerformance];

  const performanceMessage = {
    great: '¡Excelente mes! Mantente así.',
    good: 'Buen trabajo, sigue mejorando.',
    warning: 'Revisa tus gastos este mes.',
  }[budgetPerformance];

  return (
    <Html>
      <Head />
      <Preview>{month}: Tu resumen financiero está listo</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Tu mes en números 📊</Heading>

          <Text style={greeting}>Hola {userName},</Text>

          <Text style={text}>
            Aquí está tu resumen financiero de <strong>{month}</strong>. 
            Revisa cómo te fue y encuentra oportunidades para mejorar.
          </Text>

          <Section style={statsContainer}>
            <Row>
              <Column style={statBox}>
                <Text style={statLabel}>Ingresos</Text>
                <Text style={statValue}>{totalIncome}</Text>
              </Column>
              <Column style={statBox}>
                <Text style={statLabel}>Gastos</Text>
                <Text style={statValue}>{totalExpenses}</Text>
              </Column>
            </Row>
            <Row style={{ marginTop: '16px' }}>
              <Column style={statBoxHighlight}>
                <Text style={statLabel}>💰 Ahorrado</Text>
                <Text style={statValueLarge}>{savings}</Text>
                <Text style={statSubtext}>Tasa de ahorro: {savingsRate}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={insightBox}>
            <Text style={insightTitle}>{performanceEmoji} {performanceMessage}</Text>
            <Text style={insightText}>
              Tu categoría con más gastos fue <strong>{topCategory}</strong>.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Ver dashboard completo →
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Recibes este email porque activaste los resúmenes mensuales.
          </Text>
          <Text style={footer}>
            <a href={unsubscribeUrl} style={link}>
              Desactivar resúmenes mensuales
            </a>
          </Text>

          <Text style={footer}>
            <strong>Compounding</strong> · Tu aliado financiero
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

MonthlyInsightsEmail.PreviewProps = {
  userName: 'Ana',
  month: 'Octubre 2024',
  totalExpenses: '$45,230',
  totalIncome: '$60,000',
  savings: '$14,770',
  savingsRate: '24.6%',
  topCategory: 'Alimentación',
  budgetPerformance: 'great',
  dashboardUrl: 'https://compounding.vercel.app/dashboard',
  unsubscribeUrl: 'https://compounding.vercel.app/settings?tab=notifications',
} as MonthlyInsightsEmailProps;

export default MonthlyInsightsEmail;

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

const greeting = {
  color: '#525252',
  fontSize: '16px',
  margin: '0 0 8px',
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const statsContainer = {
  margin: '32px 0',
};

const statBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
  width: '48%',
};

const statBoxHighlight = {
  backgroundColor: '#dbeafe',
  border: '2px solid #2563eb',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  width: '100%',
};

const statLabel = {
  color: '#6b7280',
  fontSize: '13px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
  letterSpacing: '0.5px',
};

const statValue = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
};

const statValueLarge = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
};

const statSubtext = {
  color: '#2563eb',
  fontSize: '14px',
  fontWeight: '600',
  margin: '8px 0 0',
};

const insightBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const insightTitle = {
  color: '#166534',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const insightText = {
  color: '#15803d',
  fontSize: '15px',
  margin: '0',
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
  textAlign: 'center' as const,
};

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};
