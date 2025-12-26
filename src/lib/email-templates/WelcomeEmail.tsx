/**
 * Welcome Email Template
 * Email de bienvenue pour nouveaux utilisateurs
 */

import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Heading,
  Hr,
} from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
}

export function WelcomeEmail({ userName, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>🎰 Bienvenue sur ReviewLottery!</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Bonjour {userName},</Text>

            <Text style={paragraph}>
              Bienvenue dans ReviewLottery, la plateforme qui transforme vos avis clients en
              expérience ludique et engageante!
            </Text>

            <Text style={paragraph}>Avec ReviewLottery, vous pouvez:</Text>

            <ul style={list}>
              <li style={listItem}>Créer des campagnes de collecte d&apos;avis gamifiées</li>
              <li style={listItem}>Offrir des gains attractifs à vos clients</li>
              <li style={listItem}>Analyser vos performances en temps réel</li>
              <li style={listItem}>Générer des réponses IA personnalisées</li>
            </ul>

            <Button style={button} href={loginUrl}>
              Commencer maintenant
            </Button>

            <Text style={paragraph}>À très bientôt,</Text>
            <Text style={signature}>L&apos;équipe ReviewLottery</Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Cet email a été envoyé par ReviewLottery. Si vous n&apos;avez pas créé de compte, vous
              pouvez ignorer cet email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

WelcomeEmail.PreviewProps = {
  userName: 'Jean Dupont',
  loginUrl: 'https://reviewlottery.com/login',
} as WelcomeEmailProps;

export default WelcomeEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
};

const header = {
  padding: '32px 40px',
};

const h1 = {
  color: '#8b5cf6',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const content = {
  padding: '0 40px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333',
};

const list = {
  paddingLeft: '20px',
};

const listItem = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333',
  marginBottom: '8px',
};

const button = {
  backgroundColor: '#8b5cf6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 20px',
  margin: '24px 0',
};

const signature = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333',
  fontWeight: 'bold',
  marginTop: '8px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '0 40px',
};

const footerText = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#8898aa',
};
