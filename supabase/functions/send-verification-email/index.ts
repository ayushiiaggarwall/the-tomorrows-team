
import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { VerificationEmail } from './_templates/verification-email.tsx'
import { PasswordResetEmail } from './_templates/password-reset-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

Deno.serve(async (req) => {
  console.log('=== Auth Webhook Request ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    console.log('Processing auth webhook request...')
    
    const payload = await req.text()
    console.log('Payload received, length:', payload.length)
    
    let webhookData
    try {
      webhookData = JSON.parse(payload)
    } catch (parseError) {
      console.error('Failed to parse webhook payload:', parseError)
      return new Response(JSON.stringify({ success: true, message: 'Invalid payload format, but auth continues' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    console.log('Webhook data parsed successfully')
    console.log('Event type:', webhookData.type || 'unknown')
    console.log('Has user data:', !!webhookData.user)
    console.log('Has email_data:', !!webhookData.email_data)
    
    // Check if this has required data
    if (!webhookData.user || !webhookData.email_data) {
      console.log('Missing required data, returning success to avoid blocking auth')
      return new Response(JSON.stringify({ success: true, message: 'Missing required data, but auth continues' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = webhookData as {
      user: {
        email: string
        user_metadata?: {
          full_name?: string
        }
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
      }
    }

    console.log('Processing email for:', user.email)
    console.log('Email action type:', email_action_type)
    console.log('Redirect to:', redirect_to)

    // Handle both signup confirmations and password recovery
    if (email_action_type !== 'signup' && email_action_type !== 'recovery') {
      console.log('Not a signup or recovery action, skipping email')
      return new Response(JSON.stringify({ success: true, message: 'Not a supported email action' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Extract first name from full name or use email
    const fullName = user.user_metadata?.full_name || user.email
    const firstName = fullName.split(' ')[0] || 'there'

    // Build verification/reset URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL not configured')
    }
    
    const actionUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`
    console.log('Action URL built:', actionUrl)

    console.log('Rendering email template...')

    let html: string
    let subject: string

    if (email_action_type === 'signup') {
      // Render the verification email template
      html = await renderAsync(
        React.createElement(VerificationEmail, {
          firstName,
          verificationUrl: actionUrl,
        })
      )
      subject = '✅ Verify your email to activate your account'
    } else {
      // Render the password reset email template
      html = await renderAsync(
        React.createElement(PasswordResetEmail, {
          firstName,
          resetUrl: actionUrl,
        })
      )
      subject = '🔐 Reset your password for The Tomorrows Team'
    }

    console.log('Template rendered, sending email...')

    // Send the email
    const { error } = await resend.emails.send({
      from: 'hello@thetomorrowsteam.com',
      to: [user.email],
      subject,
      html,
    })

    if (error) {
      console.error('Error sending email:', error)
      return new Response(JSON.stringify({ 
        success: true, 
        warning: 'Email sending failed but auth continues',
        error: error.message 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`${email_action_type} email sent successfully to:`, user.email)

    return new Response(JSON.stringify({ success: true, message: 'Email sent successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send-verification-email function:', error)
    
    return new Response(JSON.stringify({ 
      success: true, 
      warning: 'Email processing completed with warnings',
      error: error.message 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
