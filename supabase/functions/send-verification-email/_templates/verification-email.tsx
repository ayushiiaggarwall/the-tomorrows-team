
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
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface VerificationEmailProps {
  firstName: string
  verificationUrl: string
}

export const VerificationEmail = ({
  firstName,
  verificationUrl,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email to activate your account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Hi {firstName},</Heading>
        
        <Text style={text}>
          Welcome to <strong>The Tomorrows Team</strong> — we're excited to have you here! 🎉
        </Text>
        
        <Text style={text}>
          Before you can join group discussions, track your points, and start your journey as a confident communicator, we need to confirm your email address.
        </Text>
        
        <Text style={text}>
          👉 Click the button below to verify your email:
        </Text>
        
        <Button href={verificationUrl} style={button}>
          🔵 Verify My Email
        </Button>
        
        <Text style={text}>
          If the button doesn't work, copy and paste this link into your browser:
        </Text>
        
        <Text style={linkText}>
          {verificationUrl}
        </Text>
        
        <Text style={text}>
          Once verified, you'll be redirected to your dashboard where you can:
        </Text>
        
        <Text style={listItem}>• Register for upcoming GDs 🗓️</Text>
        <Text style={listItem}>• Earn rewards and recognition 🏆</Text>
        <Text style={listItem}>• Access speaking resources 🎓</Text>
        <Text style={listItem}>• Connect with our growing community 🌱</Text>
        
        <Hr style={hr} />
        
        <Text style={disclaimer}>
          If you didn't sign up for The Tomorrows Team, please ignore this message.
        </Text>
        
        <Text style={footer}>
          Thanks,<br />
          <strong>The Tomorrows Team Crew</strong><br />
          <Link href="https://www.thetomorrowsteam.com" style={link}>
            www.thetomorrowsteam.com
          </Link><br />
          📧 <Link href="mailto:support@thetomorrowsteam.com" style={link}>
            support@thetomorrowsteam.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default VerificationEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '5px',
  boxShadow: '0 5px 10px rgba(20, 50, 70, .2)',
  marginTop: '20px',
  maxWidth: '360px',
  margin: '0 auto',
  padding: '68px 0 130px',
}

const h1 = {
  color: '#333',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '14px',
  margin: '24px 0',
  padding: '0 40px',
  textAlign: 'left' as const,
}

const listItem = {
  color: '#333',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '14px',
  margin: '8px 0',
  padding: '0 40px',
  textAlign: 'left' as const,
}

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
  margin: '20px auto',
}

const linkText = {
  color: '#007ee6',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '12px',
  padding: '0 40px',
  wordBreak: 'break-all' as const,
}

const link = {
  color: '#007ee6',
  textDecoration: 'underline',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  color: '#898989',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const disclaimer = {
  color: '#898989',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '12px',
  lineHeight: '22px',
  margin: '20px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
}
