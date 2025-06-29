
import React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface PasswordResetEmailProps {
  firstName: string
  resetUrl: string
}

export const PasswordResetEmail = ({
  firstName,
  resetUrl,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password for The Tomorrows Team</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={text}>
          Hi {firstName},
        </Text>
        <Text style={text}>
          We received a request to reset your password for your The Tomorrows Team account. 
          If you made this request, click the button below to reset your password.
        </Text>
        <Link
          href={resetUrl}
          target="_blank"
          style={button}
        >
          Reset Password
        </Link>
        <Text style={text}>
          This password reset link will expire in 1 hour for security reasons.
        </Text>
        <Text style={text}>
          If you didn't request a password reset, you can safely ignore this email. 
          Your password will remain unchanged.
        </Text>
        <Text style={footer}>
          Best regards,<br />
          The Tomorrows Team
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  margin: '24px 0',
}

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '24px 0 0',
}
