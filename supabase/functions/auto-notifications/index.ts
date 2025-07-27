
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  type: 'gd_registration' | 'reward_points';
  user_id: string;
  gd_id?: string;
  topic_name?: string;
  scheduled_date?: string;
  points?: number;
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    console.log('Auto-notification payload:', payload);

    let title = '';
    let message = '';
    let metadata = {};

    switch (payload.type) {
      case 'gd_registration':
        title = 'GD Registration Confirmed';
        message = `You've successfully registered for the GD: "${payload.topic_name}" on ${new Date(payload.scheduled_date!).toLocaleDateString()}.`;
        metadata = {
          gd_id: payload.gd_id,
          topic_name: payload.topic_name,
          scheduled_date: payload.scheduled_date
        };
        break;

      case 'reward_points':
        title = payload.points! > 0 ? '🎉 Reward Points Earned!' : '⚠️ Points Deducted!';
        message = payload.points! > 0 
          ? `You've earned +${payload.points} reward points! ${payload.reason}`
          : `You've received ${payload.points} points for ${payload.reason}`;
        metadata = {
          points: payload.points,
          reason: payload.reason
        };
        break;

      default:
        throw new Error('Invalid notification type');
    }

    // Create the notification
    const { error } = await supabase.rpc('create_notification', {
      p_user_id: payload.user_id,
      p_title: title,
      p_message: message,
      p_type: payload.type === 'gd_registration' ? 'gd_update' : 'reward',
      p_is_global: false,
      p_expires_at: null,
      p_metadata: metadata
    });

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    console.log('Auto-notification created successfully');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in auto-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
