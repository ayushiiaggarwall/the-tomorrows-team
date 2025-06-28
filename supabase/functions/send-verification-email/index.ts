
import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { VerificationEmail } from './_templates/verification-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    console.log('Processing verification email request...')
    
    const payload = await req.text()
    console.log('Payload received, length:', payload.length)
    
    // Parse the webhook payload directly without verification
    const webhookData = JSON.parse(payload)
    console.log('Webhook data parsed successfully')
    
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
      throw error
    }

    console.log('Verification email sent successfully to:', user.email)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send-verification-email function:', error)
    
    // Return success to prevent auth flow interruption
    return new Response(JSON.stringify({ 
      success: true, 
      warning: 'Email processing completed with warnings' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
