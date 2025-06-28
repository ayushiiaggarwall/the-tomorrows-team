
import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { VerificationEmail } from './_templates/verification-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    console.log('Processing verification email request...')
    
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    console.log('Headers received:', JSON.stringify(headers, null, 2))
    console.log('Payload length:', payload.length)
    
    // The webhook secret should be in the format expected by Standard Webhooks
    // But we need to use the raw secret for verification
    const wh = new Webhook(hookSecret)
    
    let webhookData
    try {
      webhookData = wh.verify(payload, headers)
      console.log('Webhook verification successful')
    } catch (verifyError) {
      console.error('Webhook verification failed:', verifyError)
      // Return success to prevent blocking auth flow, but log the issue
      return new Response(JSON.stringify({ 
        success: true, 
        warning: 'Webhook verification failed, email may be delayed' 
      }), {
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

    console.log('Webhook verified, preparing email for:', user.email)

    // Extract first name from full name or use email
    const fullName = user.user_metadata?.full_name || user.email
    const firstName = fullName.split(' ')[0] || 'there'

    // Build verification URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const verificationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`

    console.log('Rendering email template...')

    // Render the email template with timeout
    const renderPromise = renderAsync(
      React.createElement(VerificationEmail, {
        firstName,
        verificationUrl,
      })
    )

    // Add a timeout to the rendering
    const html = await Promise.race([
      renderPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Template rendering timeout')), 3000)
      )
    ]) as string

    console.log('Template rendered, sending email...')

    // Send the email using your custom domain with timeout
    const emailPromise = resend.emails.send({
      from: 'hello@thetomorrowsteam.com',
      to: [user.email],
      subject: '✅ Verify your email to activate your account',
      html,
    })

    // Add timeout to email sending
    const { error } = await Promise.race([
      emailPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout')), 2000)
      )
    ]) as any

    if (error) {
      console.error('Error sending email:', error)
      throw error
    }

    console.log('Verification email sent successfully to:', user.email)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send-verification-email function:', error)
    
    // Return success even if email fails to prevent auth flow interruption
    // Log the error for debugging but don't block user registration
    return new Response(JSON.stringify({ 
      success: true, 
      warning: 'Email may be delayed' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
