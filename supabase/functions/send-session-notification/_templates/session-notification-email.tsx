import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface SessionNotificationEmailProps {
  firstName: string;
  sessionType: string;
  topicName: string;
  description: string;
  scheduledDate: string;
  registrationUrl: string;
}

export const SessionNotificationEmail = ({
  firstName,
  sessionType,
  topicName,
  description,
  scheduledDate,
  registrationUrl,
}: SessionNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>New {sessionType}: "{topicName}" - Register Now!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New {sessionType} Alert!</Heading>
        
        <Text style={greeting}>Hi {firstName},</Text>
        
        <Text style={text}>
          Exciting news! We've just scheduled a new <strong>{sessionType.toLowerCase()}</strong> that you won't want to miss:
        </Text>
        
        <Section style={sessionBox}>
          <Heading style={sessionTitle}>"{topicName}"</Heading>
          {description && (
            <Text style={sessionDescription}>{description}</Text>
          )}
          <Text style={sessionDate}>
            <strong>📅 Scheduled:</strong> {scheduledDate}
          </Text>
        </Section>
        
        <Text style={text}>
          This is a fantastic opportunity to engage, learn, and connect with fellow participants. 
          {sessionType === 'Session' ? 'Whether it\'s a group discussion, debate, MUN, or another engaging format, ' : ''}
          Don't miss out on this enriching experience!
        </Text>
        
        <Section style={buttonContainer}>
          <Button href={registrationUrl} style={button}>
            Register for {sessionType}
          </Button>
        </Section>
        
        <Hr style={hr} />
        
        <Text style={reminder}>
          <strong>⏰ Quick Reminder:</strong> Sessions fill up fast! Register early to secure your spot.
        </Text>
        
        <Text style={footer}>
          Best regards,<br />
          <strong>The Tomorrows Team</strong><br />
          Building tomorrow's leaders, today! 🌟
        </Text>
        
        <Hr style={hr} />
        
        <Text style={footerNote}>
          If you have any questions, feel free to reach out to us. We're here to help make your experience amazing!
        </Text>
      </Container>
    </Body>
  </Html>
);

export default SessionNotificationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
  textAlign: 'center' as const,
};

const greeting = {
  color: '#333',
  fontSize: '18px',
  lineHeight: '26px',
  margin: '16px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const sessionBox = {
  backgroundColor: '#f8f9fa',
  border: '2px solid #e9ecef',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const sessionTitle = {
  color: '#2563eb',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const sessionDescription = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0 16px 0',
  fontStyle: 'italic',
};

const sessionDate = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0 0 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e9ecef',
  margin: '20px 0',
};

const reminder = {
  color: '#d97706',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  padding: '12px',
  backgroundColor: '#fef3c7',
  borderRadius: '4px',
  border: '1px solid #fde68a',
};

const footer = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0 16px 0',
};

const footerNote = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '16px 0',
  textAlign: 'center' as const,
};