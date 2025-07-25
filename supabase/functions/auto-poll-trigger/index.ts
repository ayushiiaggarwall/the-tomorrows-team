import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PollTriggerRequest {
  gd_id: string;
  action: 'create_poll' | 'close_poll';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { gd_id, action }: PollTriggerRequest = await req.json();

    console.log(`Processing ${action} for GD: ${gd_id}`);

    if (action === 'create_poll') {
      // Check if poll already exists for this GD
      const { data: existingPoll, error: pollCheckError } = await supabase
        .from('gd_polls')
        .select('id')
        .eq('gd_id', gd_id)
        .eq('poll_type', 'best_speaker')
        .maybeSingle();

      if (pollCheckError) {
        console.error('Error checking existing poll:', pollCheckError);
        return new Response(
          JSON.stringify({ error: 'Failed to check existing polls' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      if (existingPoll) {
        console.log('Poll already exists for GD:', gd_id);
        return new Response(
          JSON.stringify({ error: 'Poll already exists for this GD' }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      // Get GD participants for poll options
      const { data: registrations, error: participantsError } = await supabase
        .from('gd_registrations')
        .select(`
          user_id,
          profiles!inner (
            id,
            full_name
          )
        `)
        .eq('gd_id', gd_id)
        .eq('cancelled_at', null);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch participants' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      if (!registrations || registrations.length === 0) {
        console.log('No participants found for GD:', gd_id);
        return new Response(
          JSON.stringify({ error: 'No participants found for this GD' }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      console.log(`Found ${registrations.length} participants for GD ${gd_id}`);

      // Create poll message first
      const { data: messageData, error: messageError } = await supabase
        .from('gd_chat_messages')
        .insert({
          gd_id: gd_id,
          user_id: null, // System message
          message: "🗳️ Vote for the Best Speaker! Click on a name to cast your vote.",
          message_type: 'poll',
          is_pinned: true
        })
        .select('id')
        .single();

      if (messageError) {
        console.error('Error creating poll message:', messageError);
        return new Response(
          JSON.stringify({ error: 'Failed to create poll message' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      console.log('Created poll message:', messageData.id);

      // Create the poll
      const { data: pollData, error: pollError } = await supabase
        .from('gd_polls')
        .insert({
          gd_id: gd_id,
          message_id: messageData.id,
          poll_type: 'best_speaker',
          is_active: true,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
        })
        .select('id')
        .single();

      if (pollError) {
        console.error('Error creating poll:', pollError);
        return new Response(
          JSON.stringify({ error: 'Failed to create poll' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      console.log('Created poll:', pollData.id);

      // Create poll options for each participant
      const pollOptions = registrations.map((registration: any) => ({
        poll_id: pollData.id,
        option_text: registration.profiles?.full_name || 'Unknown User',
        user_id: registration.profiles?.id || registration.user_id,
        vote_count: 0
      }));

      const { error: optionsError } = await supabase
        .from('gd_poll_options')
        .insert(pollOptions);

      if (optionsError) {
        console.error('Error creating poll options:', optionsError);
        return new Response(
          JSON.stringify({ error: 'Failed to create poll options' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      console.log('Poll created successfully:', pollData.id);
      return new Response(
        JSON.stringify({ 
          success: true, 
          poll_id: pollData.id,
          message: 'Best speaker poll created successfully' 
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );

    } else if (action === 'close_poll') {
      // Find active poll for this GD
      const { data: poll } = await supabase
        .from('gd_polls')
        .select('*')
        .eq('gd_id', gd_id)
        .eq('poll_type', 'best_speaker')
        .eq('is_active', true)
        .single();

      if (!poll) {
        return new Response(
          JSON.stringify({ error: 'No active poll found for this GD' }),
          { 
            status: 404, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      // Get poll winner
      const { data: winner } = await supabase
        .from('gd_poll_options')
        .select('option_text, vote_count')
        .eq('poll_id', poll.id)
        .order('vote_count', { ascending: false })
        .limit(1)
        .single();

      // Close the poll
      await supabase
        .from('gd_polls')
        .update({ is_active: false })
        .eq('id', poll.id);

      // Send winner announcement message
      if (winner && winner.vote_count > 0) {
        await supabase
          .from('gd_chat_messages')
          .insert({
            gd_id: gd_id,
            user_id: (await supabase.from('profiles').select('id').eq('is_admin', true).limit(1).single()).data?.id,
            message: `🎉 Congratulations to ${winner.option_text}! You've been voted Best Speaker by your peers.`,
            message_type: 'text',
            is_pinned: true
          });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          winner: winner?.option_text || 'No winner (no votes)',
          message: 'Poll closed successfully' 
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error in auto-poll-trigger:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);