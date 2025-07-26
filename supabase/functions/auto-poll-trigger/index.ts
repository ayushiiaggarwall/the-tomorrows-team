import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
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

    console.log(`Processing ${action} for GD: ${gd_id} - version 2`);

    if (action === 'create_poll') {
      // Check if active poll already exists for this GD
      const { data: existingPoll, error: pollCheckError } = await supabase
        .from('gd_polls')
        .select('id')
        .eq('gd_id', gd_id)
        .eq('poll_type', 'best_speaker')
        .eq('is_active', true)
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
          JSON.stringify({ 
            success: false,
            error: 'POLL_EXISTS',
            message: 'A poll is already active for this group discussion. Please wait for it to close or close it manually before creating a new one.' 
          }),
          { 
            status: 200, // Return 200 instead of 400 for better frontend handling
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      // Get GD participants for poll options
      const { data: registrations, error: participantsError } = await supabase
        .from('gd_registrations')
        .select('user_id')
        .eq('gd_id', gd_id)
        .is('cancelled_at', null);

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

      // Get user names for poll options
      const userIds = registrations.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch user profiles' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      console.log(`Found ${registrations.length} participants for GD ${gd_id}`);

      // Get admin user for system messages
      const { data: adminUser, error: adminError } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true)
        .limit(1)
        .maybeSingle();

      if (adminError) {
        console.error('Error fetching admin user:', adminError);
      }

      console.log('Admin user found:', adminUser?.id || 'No admin user found');

      // Create poll message first
      const { data: messageData, error: messageError } = await supabase
        .from('gd_chat_messages')
        .insert({
          gd_id: gd_id,
          user_id: adminUser?.id || '00000000-0000-0000-0000-000000000000', // Fallback UUID
          message: "🗳️ Vote for the Best Speaker! Click on a name to cast your vote.",
          message_type: 'text',
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
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
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

      // Update the message with the poll_id
      const { error: linkError } = await supabase
        .from('gd_chat_messages')
        .update({ poll_id: pollData.id })
        .eq('id', messageData.id);

      if (linkError) {
        console.error('Error linking poll to message:', linkError);
        return new Response(
          JSON.stringify({ error: 'Failed to link poll to message' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      console.log('Poll and message linked successfully');

      // Create poll options for each participant
      const pollOptions = registrations.map((registration: any) => {
        const profile = profiles?.find(p => p.id === registration.user_id);
        return {
          poll_id: pollData.id,
          option_text: profile?.full_name || 'Unknown User',
          user_id: registration.user_id,
          vote_count: 0
        };
      });

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
        .maybeSingle();

      if (!poll) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'NO_ACTIVE_POLL',
            message: 'No active poll found for this GD' 
          }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      // Get poll winners (all users with highest vote count in case of ties)
      const { data: allOptions } = await supabase
        .from('gd_poll_options')
        .select('option_text, vote_count, user_id')
        .eq('poll_id', poll.id)
        .order('vote_count', { ascending: false });

      // Find the highest vote count
      const highestVoteCount = allOptions && allOptions.length > 0 ? allOptions[0].vote_count : 0;
      
      // Get all winners (those with the highest vote count)
      const winners = allOptions?.filter(option => option.vote_count === highestVoteCount && option.vote_count > 0) || [];

      // Close the poll
      await supabase
        .from('gd_polls')
        .update({ is_active: false })
        .eq('id', poll.id);

      console.log('Poll closed successfully:', poll.id);

      // Get admin user for system messages
      const { data: adminUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true)
        .limit(1)
        .maybeSingle();

      const adminUserId = adminUser?.id || '00000000-0000-0000-0000-000000000000';

      // Send winner announcement and award points if there are winners with votes
      if (winners.length > 0) {
        console.log('Processing winners:', winners);
        
        // Create winner announcement message
        let winnerMessage;
        if (winners.length === 1) {
          winnerMessage = `🏆 The winner is ${winners[0].option_text}`;
        } else {
          const winnerNames = winners.map(w => w.option_text).join(' and ');
          winnerMessage = `🏆 The winners are ${winnerNames}`;
        }
        
        // Post winner announcement message
        const { data: messageData, error: messageError } = await supabase
          .from('gd_chat_messages')
          .insert({
            gd_id: gd_id,
            user_id: adminUserId,
            message: winnerMessage,
            message_type: 'text',
            is_pinned: true
          });

        if (messageError) {
          console.error('Error posting winner message:', messageError);
        } else {
          console.log('Winner message posted successfully');
        }

        // Award 30 points to each winner and send notifications
        for (const winner of winners) {
          // Award 30 points to the winner
          const { error: pointsError } = await supabase
            .from('reward_points')
            .insert({
              user_id: winner.user_id,
              points: 30,
              reason: 'Best Speaker Award',
              type: 'Best Speaker'
            });

          if (pointsError) {
            console.error('Error awarding points to:', winner.user_id, pointsError);
          } else {
            console.log('Points awarded successfully to user:', winner.user_id);
          }

          // Send notification to the winner
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: winner.user_id,
              title: '🏆 Best Speaker Award!',
              message: winners.length === 1 
                ? `Congratulations! You've been voted Best Speaker and earned 30 points!`
                : `Congratulations! You tied for Best Speaker and earned 30 points!`,
              type: 'reward'
            });

          if (notificationError) {
            console.error('Error sending notification to:', winner.user_id, notificationError);
          } else {
            console.log('Notification sent successfully to user:', winner.user_id);
          }

          console.log(`Best speaker award given to ${winner.option_text} (${winner.user_id})`);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            winners: winners.map(w => w.option_text),
            votes: winners[0].vote_count,
            message: winners.length === 1 ? 'Poll closed successfully and winner announced' : 'Poll closed successfully and tied winners announced'
          }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      } else {
        // No votes cast - just announce poll closure
        await supabase
          .from('gd_chat_messages')
          .insert({
            gd_id: gd_id,
            user_id: adminUserId,
            message: '📊 The Best Speaker poll has been closed. No votes were cast.',
            message_type: 'text',
            is_pinned: true
          });

        return new Response(
          JSON.stringify({ 
            success: true, 
            winners: [],
            votes: 0,
            message: 'Poll closed - no votes were cast' 
          }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }
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