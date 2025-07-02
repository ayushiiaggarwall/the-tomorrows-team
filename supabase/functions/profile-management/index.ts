import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProfileUpdateRequest {
  action: 'update_profile' | 'update_avatar' | 'delete_account' | 'get_participation_history';
  profile_data?: {
    full_name?: string;
    date_of_birth?: string;
    tags?: string[];
  };
  avatar_url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { action, profile_data, avatar_url }: ProfileUpdateRequest = await req.json();

    console.log(`Profile Management: ${action} for user ${user.id}`);

    switch (action) {
      case 'update_profile':
        return await handleProfileUpdate(supabase, user.id, profile_data!);
      
      case 'update_avatar':
        return await handleAvatarUpdate(supabase, user.id, avatar_url!);
      
      case 'delete_account':
        return await handleAccountDeletion(supabase, user.id);
      
      case 'get_participation_history':
        return await handleParticipationHistory(supabase, user.id);
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error: any) {
    console.error('Error in profile management:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function handleProfileUpdate(supabase: any, userId: string, profileData: any): Promise<Response> {
  try {
    // Validate and sanitize input data
    const updateData: any = {};
    
    if (profileData.full_name) {
      // Sanitize full name (remove excessive whitespace, limit length)
      updateData.full_name = profileData.full_name.trim().substring(0, 100);
    }
    
    if (profileData.date_of_birth) {
      // Validate date format and ensure user is at least 13 years old
      const birthDate = new Date(profileData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13) {
        throw new Error('Users must be at least 13 years old');
      }
      
      updateData.date_of_birth = profileData.date_of_birth;
    }
    
    if (profileData.tags) {
      // Validate tags (limit number and length)
      if (profileData.tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      
      const sanitizedTags = profileData.tags
        .map((tag: string) => tag.trim().substring(0, 50))
        .filter((tag: string) => tag.length > 0);
      
      updateData.tags = sanitizedTags;
    }

    updateData.updated_at = new Date().toISOString();

    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log the update
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: userId,
        action: 'profile_update',
        details: { updated_fields: Object.keys(updateData) }
      });

    console.log(`Profile updated for user ${userId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      profile: data,
      message: 'Profile updated successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    throw error;
  }
}

async function handleAvatarUpdate(supabase: any, userId: string, avatarUrl: string): Promise<Response> {
  try {
    // Validate avatar URL
    if (!avatarUrl.startsWith('http') || avatarUrl.length > 500) {
      throw new Error('Invalid avatar URL');
    }

    // Update profile with new avatar URL
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        profile_picture_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log(`Avatar updated for user ${userId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      profile: data,
      message: 'Avatar updated successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Avatar update error:', error);
    throw error;
  }
}

async function handleAccountDeletion(supabase: any, userId: string): Promise<Response> {
  try {
    // Create account deletion request
    const { data, error } = await supabase
      .from('account_deletion_requests')
      .insert({
        user_id: userId,
        status: 'pending',
        requested_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Create notification for user
    await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_title: '🗑️ Account Deletion Request',
      p_message: 'Your account deletion request has been submitted and will be reviewed by our team.',
      p_type: 'info',
      p_metadata: JSON.stringify({ deletion_request_id: data.id })
    });

    // Create notification for admins
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true);

    if (admins) {
      for (const admin of admins) {
        await supabase.rpc('create_notification', {
          p_user_id: admin.id,
          p_title: '⚠️ Account Deletion Request',
          p_message: 'A user has requested account deletion. Please review in admin panel.',
          p_type: 'warning',
          p_metadata: JSON.stringify({ 
            deletion_request_id: data.id,
            requesting_user: userId 
          })
        });
      }
    }

    console.log(`Account deletion requested for user ${userId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      request: data,
      message: 'Account deletion request submitted successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Account deletion error:', error);
    throw error;
  }
}

async function handleParticipationHistory(supabase: any, userId: string): Promise<Response> {
  try {
    // Get GD registrations with group discussion details
    const { data: registrations, error: regError } = await supabase
      .from('gd_registrations')
      .select(`
        *,
        group_discussions (
          topic_name,
          scheduled_date,
          description
        )
      `)
      .eq('user_id', userId)
      .order('registered_at', { ascending: false });

    if (regError) throw regError;

    // Get reward points history
    const { data: points, error: pointsError } = await supabase
      .from('reward_points')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (pointsError) throw pointsError;

    // Calculate statistics
    const totalGDs = registrations?.length || 0;
    const attendedGDs = registrations?.filter(reg => reg.attended).length || 0;
    const cancelledGDs = registrations?.filter(reg => reg.cancelled_at).length || 0;
    const totalPoints = points?.reduce((sum, point) => sum + point.points, 0) || 0;

    const participationStats = {
      total_gds: totalGDs,
      attended_gds: attendedGDs,
      cancelled_gds: cancelledGDs,
      attendance_rate: totalGDs > 0 ? Math.round((attendedGDs / totalGDs) * 100) : 0,
      total_points: totalPoints,
      avg_points_per_gd: attendedGDs > 0 ? Math.round(totalPoints / attendedGDs) : 0
    };

    console.log(`Participation history retrieved for user ${userId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      registrations,
      points_history: points,
      statistics: participationStats
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Participation history error:', error);
    throw error;
  }
}

serve(handler);