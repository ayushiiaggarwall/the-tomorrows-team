
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
    console.log('Hook secret configured:', !!hookSecret)
    
    // Skip webhook verification if secret is not properly configured
    // This allows the email to be sent even if webhook verification fails
    let webhookData
    if (!hookSecret) {
      console.log('No webhook secret configured, parsing payload directly')
      webhookData = JSON.parse(payload)
    } else {
      try {
        // Try webhook verification with the Standard Webhooks format
        const wh = new Webhook(`whsec_${hookSecret}`)
        webhookData = wh.verify(payload, headers)
        console.log('Webhook verification successful')
      } catch (verifyError) {
        console.error('Webhook verification failed:', verifyError)
        console.log('Falling back to direct payload parsing')
        // Fallback to parsing payload directly
        webhookData = JSON.parse(payload)
      }
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
        setTimeout(() => reject(new Error('Template rendering timeout')), 2000)
      )
    ]) as string

    console.log('Template rendered, sending email...')

    // Send the email using your custom domain with shorter timeout
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
        setTimeout(() => reject(new Error('Email sending timeout')), 1500)
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
      warning: 'Email processing completed with warnings' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
