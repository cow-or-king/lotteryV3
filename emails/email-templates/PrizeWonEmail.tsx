/**
 * Prize Won Email Template
 * Email envoyé lorsqu'un utilisateur gagne un lot
 */

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

interface PrizeWonEmailProps {
  userName: string;
  prizeName: string;
  prizeDescription?: string;
  claimCode: string;
  campaignName: string;
  storeName: string;
  claimUrl: string;
}

export function PrizeWonEmail({
  userName,
  prizeName,
  prizeDescription,
  claimCode,
  campaignName,
  storeName,
  claimUrl,
}: PrizeWonEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>🎉 Félicitations, vous avez gagné!</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Bonjour {userName},</Text>

            <Text style={paragraph}>
              Excellente nouvelle! Vous avez remporté un lot lors de la campagne &quot;
              {campaignName}&quot; chez {storeName}!
            </Text>

            <Section style={prizeBox}>
              <Heading style={h2}>{prizeName}</Heading>
              {prizeDescription && <Text style={prizeDescriptionStyle}>{prizeDescription}</Text>}
            </Section>

            <Text style={paragraph}>Pour récupérer votre lot, présentez ce code en magasin:</Text>

            <Section style={codeBox}>
              <Text style={code}>{claimCode}</Text>
            </Section>

            <Button style={button} href={claimUrl}>
              Voir les détails
            </Button>

            <Text style={paragraph}>
              N&apos;oubliez pas de partager votre expérience et de laisser un avis pour aider
              d&apos;autres clients!
            </Text>

            <Text style={paragraph}>À très bientôt,</Text>
            <Text style={signature}>L&apos;équipe {storeName}</Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Cet email a été envoyé par ReviewLottery pour le compte de {storeName}. Le lot doit
              être réclamé dans les délais indiqués dans les conditions de la campagne.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

PrizeWonEmail.PreviewProps = {
  userName: 'Marie Martin',
  prizeName: 'Café offert',
  prizeDescription: 'Un café de votre choix (espresso, cappuccino, latte)',
  claimCode: 'WIN-ABC123',
  campaignName: 'Jeu du mois de Décembre',
  storeName: 'Café des Artistes',
  claimUrl: 'https://reviewlottery.com/claim/ABC123',
} as PrizeWonEmailProps;

export default PrizeWonEmail;

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
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ec4899',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const h2 = {
  color: '#8b5cf6',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const content = {
  padding: '0 40px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333',
};

const prizeBox = {
  backgroundColor: '#f9fafb',
  border: '2px solid #8b5cf6',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const prizeDescriptionStyle = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#666',
  margin: '0',
};

const codeBox = {
  backgroundColor: '#1f2937',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0 24px',
  textAlign: 'center' as const,
};

const code = {
  color: '#fff',
  fontSize: '28px',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  letterSpacing: '4px',
  margin: '0',
};

const button = {
  backgroundColor: '#ec4899',
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
