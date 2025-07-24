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

    if (action === 'create_poll') {
      // Check if poll already exists for this GD
      const { data: existingPoll } = await supabase
        .from('gd_polls')
        .select('id')
        .eq('gd_id', gd_id)
        .eq('poll_type', 'best_speaker')
        .single();

      if (existingPoll) {
        return new Response(
          JSON.stringify({ error: 'Poll already exists for this GD' }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      // Create the best speaker poll
      const { data: pollId, error } = await supabase
        .rpc('create_best_speaker_poll', { p_gd_id: gd_id });

      if (error) {
        console.error('Error creating poll:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create poll' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          poll_id: pollId,
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