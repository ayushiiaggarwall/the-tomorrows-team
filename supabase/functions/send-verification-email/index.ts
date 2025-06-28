
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
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    const wh = new Webhook(hookSecret)
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
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

    // Extract first name from full name or use email
    const fullName = user.user_metadata?.full_name || user.email
    const firstName = fullName.split(' ')[0] || 'there'

    // Build verification URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const verificationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`

    // Render the email template
    const html = await renderAsync(
      React.createElement(VerificationEmail, {
        firstName,
        verificationUrl,
      })
    )

    // Send the email
    const { error } = await resend.emails.send({
      from: 'The Tomorrows Team <noreply@thetomorrowsteam.com>',
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
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
