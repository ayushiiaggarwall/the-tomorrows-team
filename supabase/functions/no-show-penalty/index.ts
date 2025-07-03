import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting no-show penalty check...');

    // Calculate the cutoff time (2 hours ago)
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    const cutoffTime = twoHoursAgo.toISOString();

    console.log(`Checking for GDs that ended before: ${cutoffTime}`);

    // Find GDs that ended more than 2 hours ago
    const { data: gdData, error: gdError } = await supabase
      .from('group_discussions')
      .select('id, topic_name, scheduled_date')
      .lt('scheduled_date', cutoffTime)
      .eq('is_active', true);

    if (gdError) {
      console.error('Error fetching GDs:', gdError);
      throw gdError;
    }

    if (!gdData || gdData.length === 0) {
      console.log('No GDs found that ended more than 2 hours ago');
      return new Response(JSON.stringify({ 
        message: 'No GDs found for penalty processing',
        processed: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`Found ${gdData.length} GDs to process for no-show penalties`);

    let totalProcessed = 0;

    // Process each GD
    for (const gd of gdData) {
      console.log(`Processing GD: ${gd.topic_name} (${gd.id})`);

      // Find registrations that are marked as not attended
      const { data: registrations, error: regError } = await supabase
        .from('gd_registrations')
        .select('id, user_id, participant_name, gd_id')
        .eq('gd_id', gd.id)
        .eq('attended', false)
        .is('cancelled_at', null); // Only active registrations

      if (regError) {
        console.error(`Error fetching registrations for GD ${gd.id}:`, regError);
        continue;
      }

      if (!registrations || registrations.length === 0) {
        console.log(`No no-show registrations found for GD ${gd.id}`);
        continue;
      }

      console.log(`Found ${registrations.length} no-show registrations for GD ${gd.id}`);

      // Process each no-show registration
      for (const registration of registrations) {
        try {
          // Check if user already received a no-show penalty for this GD
          const { data: existingPenalty, error: penaltyCheckError } = await supabase
            .from('reward_points')
            .select('id')
            .eq('user_id', registration.user_id)
            .eq('type', 'No Show')
            .eq('gd_date', gd.scheduled_date.split('T')[0])
            .limit(1);

          if (penaltyCheckError) {
            console.error(`Error checking existing penalty for user ${registration.user_id}:`, penaltyCheckError);
            continue;
          }

          if (existingPenalty && existingPenalty.length > 0) {
            console.log(`User ${registration.user_id} already has no-show penalty for GD ${gd.id}`);
            continue;
          }

          // Award penalty points
          const { error: pointsError } = await supabase
            .from('reward_points')
            .insert({
              user_id: registration.user_id,
              points: -10,
              type: 'No Show',
              reason: `No Show - ${gd.topic_name}`,
              awarded_by: null, // System-generated
              gd_date: gd.scheduled_date.split('T')[0]
            });

          if (pointsError) {
            console.error(`Error awarding penalty points to user ${registration.user_id}:`, pointsError);
            continue;
          }

          // Send notification
          const { error: notificationError } = await supabase.rpc('create_notification', {
            p_user_id: registration.user_id,
            p_title: '⚠️ No Show Penalty',
            p_message: `You were marked absent for "${gd.topic_name}" and have been deducted 10 points. Please ensure to attend future GDs or cancel in advance.`,
            p_type: 'warning',
            p_metadata: JSON.stringify({ 
              gd_id: gd.id,
              gd_topic: gd.topic_name,
              penalty_points: -10,
              reason: 'No Show'
            })
          });

          if (notificationError) {
            console.error(`Error sending notification to user ${registration.user_id}:`, notificationError);
            // Continue processing even if notification fails
          }

          console.log(`Processed no-show penalty for user ${registration.user_id} (${registration.participant_name}) for GD ${gd.id}`);
          totalProcessed++;

        } catch (error) {
          console.error(`Error processing registration ${registration.id}:`, error);
        }
      }
    }

    console.log(`No-show penalty processing completed. Total processed: ${totalProcessed}`);

    return new Response(JSON.stringify({ 
      message: 'No-show penalty processing completed',
      processed: totalProcessed,
      gds_checked: gdData.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in no-show penalty function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);