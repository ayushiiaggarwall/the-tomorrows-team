import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@4.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { SessionNotificationEmail } from './_templates/session-notification-email.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
};

interface SessionNotificationRequest {
  sessionId: string;
  topicName: string;
  description?: string;
  scheduledDate: string;
  sessionType?: string;
  emailOption?: 'all' | 'selected';
  selectedUsers?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== Session Notification Request ===');
  console.log('Method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { sessionId, topicName, description, scheduledDate, sessionType = 'Session', emailOption = 'all', selectedUsers = [] }: SessionNotificationRequest = await req.json();

    console.log('Processing session notification for:', { sessionId, topicName, sessionType });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user emails based on email option
    let profiles;
    if (emailOption === 'selected' && selectedUsers.length > 0) {
      // For selected users, get only verified users from the selection
      const { data, error: profilesError } = await supabase
        .from('profiles')
        .select('email, full_name, id')
        .in('id', selectedUsers)
        .neq('email', '');
      
      if (profilesError) {
        console.error('Error fetching selected user profiles:', profilesError);
        throw profilesError;
      }

      // Filter to only include verified users by checking auth.users
      const verifiedProfiles = [];
      if (data && data.length > 0) {
        for (const profile of data) {
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id);
          if (!authError && authUser.user && authUser.user.email_confirmed_at) {
            verifiedProfiles.push({
              email: profile.email,
              full_name: profile.full_name
            });
          }
        }
      }
      profiles = verifiedProfiles;
    } else {
      // Send to all verified users using the existing function
      const { data: verifiedUsers, error: profilesError } = await supabase.rpc('get_verified_users_paginated', {
        start_index: 0,
        end_index: 9999 // Get all verified users
      });
      
      if (profilesError) {
        console.error('Error fetching verified user profiles:', profilesError);
        throw profilesError;
      }
      
      profiles = verifiedUsers?.map(user => ({
        email: user.email,
        full_name: user.full_name
      })) || [];
    }

    if (!profiles || profiles.length === 0) {
      const message = emailOption === 'selected' ? 'No selected users found to notify' : 'No users found to notify';
      console.log(message);
      return new Response(JSON.stringify({ success: true, message }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${profiles.length} users to notify`);

    // Format the scheduled date for display
    const formattedDate = new Date(scheduledDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Use background task to send emails without blocking response
    const sendEmailsTask = async () => {
      const emailPromises = profiles.map(async (profile) => {
        try {
          const firstName = profile.full_name?.split(' ')[0] || 'there';
          
          // Render the session notification email template
          const html = await renderAsync(
            React.createElement(SessionNotificationEmail, {
              firstName,
              sessionType,
              topicName,
              description: description || '',
              scheduledDate: formattedDate,
              registrationUrl: 'https://thetomorrowsteam.com/joinsession'
            })
          );

          // Send the email
          const { error } = await resend.emails.send({
            from: 'hello@thetomorrowsteam.com',
            to: [profile.email],
            subject: `New ${sessionType === 'Other' ? 'Session' : sessionType} Alert: "${topicName}" - Register Now!`,
            html,
          });

          if (error) {
            console.error(`Error sending email to ${profile.email}:`, error);
            return { email: profile.email, success: false, error: error.message };
          } else {
            console.log(`Session notification sent successfully to: ${profile.email}`);
            return { email: profile.email, success: true };
          }
        } catch (error) {
          console.error(`Error processing email for ${profile.email}:`, error);
          return { email: profile.email, success: false, error: error.message };
        }
      });

      const results = await Promise.allSettled(emailPromises);
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;
      
      console.log(`Email sending completed: ${successCount}/${profiles.length} emails sent successfully`);
    };

    // Use EdgeRuntime.waitUntil for proper background task handling
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(sendEmailsTask());
    } else {
      // Fallback for older runtime
      sendEmailsTask();
    }

    console.log('Session notification emails queued successfully');
    const message = emailOption === 'selected' 
      ? `Session notification emails queued for ${profiles.length} selected users`
      : `Session notification emails queued for ${profiles.length} users`;
    return new Response(JSON.stringify({ 
      success: true, 
      message,
      userCount: profiles.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in send-session-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);