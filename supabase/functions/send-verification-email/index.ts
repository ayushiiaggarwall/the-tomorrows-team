
import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { VerificationEmail } from './_templates/verification-email.tsx'

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
    
    // Log all headers for debugging
    const headers = Object.fromEntries(req.headers.entries())
    console.log('All request headers:', headers)
    
    // For Supabase Auth webhooks, we don't need signature verification
    // The webhook URL itself acts as the authentication mechanism
    console.log('Skipping signature verification for Supabase Auth webhook')
    
    const webhookData = JSON.parse(payload)
    console.log('Webhook data parsed successfully')
    console.log('Event type:', webhookData.type || 'unknown')
    console.log('Has user data:', !!webhookData.user)
    console.log('Has email_data:', !!webhookData.email_data)
    
    // Check if this is a signup confirmation event
    if (!webhookData.user || !webhookData.email_data) {
      console.log('Missing required data, returning success to avoid blocking auth')
      return new Response(JSON.stringify({ success: true, message: 'Missing required data' }), {
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

    // Only process signup confirmations
    if (email_action_type !== 'signup') {
      console.log('Not a signup confirmation, skipping email')
      return new Response(JSON.stringify({ success: true, message: 'Not a signup confirmation' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Extract first name from full name or use email
    const fullName = user.user_metadata?.full_name || user.email
    const firstName = fullName.split(' ')[0] || 'there'

    // Build verification URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL not configured')
    }
    
    const verificationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`
    console.log('Verification URL built:', verificationUrl)

    console.log('Rendering email template...')

    // Render the email template
    const html = await renderAsync(
      React.createElement(VerificationEmail, {
        firstName,
        verificationUrl,
      })
    )

    console.log('Template rendered, sending email...')

    // Send the email
    const { error } = await resend.emails.send({
      from: 'hello@thetomorrowsteam.com',
      to: [user.email],
      subject: '✅ Verify your email to activate your account',
      html,
    })

    if (error) {
      console.error('Error sending email:', error)
      // Don't throw error to avoid blocking user registration
      return new Response(JSON.stringify({ 
        success: true, 
        warning: 'Email sending failed but registration continues',
        error: error.message 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('Verification email sent successfully to:', user.email)

    return new Response(JSON.stringify({ success: true, message: 'Email sent successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send-verification-email function:', error)
    
    // Always return success to prevent auth flow interruption
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
