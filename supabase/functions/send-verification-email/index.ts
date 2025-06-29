
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
    
    // Get all possible authorization headers
    const authHeader = req.headers.get('authorization')
    const apiKeyHeader = req.headers.get('apikey')
    const xApiKeyHeader = req.headers.get('x-api-key')
    
    console.log('Authorization header present:', !!authHeader)
    console.log('API key header present:', !!apiKeyHeader)
    console.log('X-API-Key header present:', !!xApiKeyHeader)
    
    // Get Supabase keys from environment
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const webhookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
    
    let isAuthorized = false
    
    // Check various authorization methods
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      if (token === supabaseServiceKey || token === supabaseAnonKey || token === webhookSecret) {
        isAuthorized = true
      }
    }
    
    if (apiKeyHeader) {
      if (apiKeyHeader === supabaseServiceKey || apiKeyHeader === supabaseAnonKey || apiKeyHeader === webhookSecret) {
        isAuthorized = true
      }
    }
    
    if (xApiKeyHeader) {
      if (xApiKeyHeader === supabaseServiceKey || xApiKeyHeader === supabaseAnonKey || xApiKeyHeader === webhookSecret) {
        isAuthorized = true
      }
    }
    
    // For Supabase auth webhooks, sometimes they don't include auth headers
    // So we'll be more permissive for signup events
    const payload = await req.text()
    console.log('Payload received, length:', payload.length)
    
    let webhookData
    try {
      webhookData = JSON.parse(payload)
    } catch (parseError) {
      console.error('Failed to parse webhook payload:', parseError)
      return new Response(JSON.stringify({ success: true, message: 'Invalid payload format' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    console.log('Webhook data parsed successfully')
    console.log('Event type:', webhookData.type || 'unknown')
    console.log('Has user data:', !!webhookData.user)
    console.log('Has email_data:', !!webhookData.email_data)
    
    // If not authorized and no valid webhook data, return error
    if (!isAuthorized && (!webhookData.user || !webhookData.email_data)) {
      console.log('Unauthorized request and no valid webhook data')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    console.log('Request processing authorized')
    
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
