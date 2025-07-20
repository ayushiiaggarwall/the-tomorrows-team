import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
};

interface GDRegistrationRequest {
  action: 'register' | 'cancel' | 'mark_attendance' | 'award_points';
  gd_id: string;
  participant_data?: {
    participant_name: string;
    participant_email: string;
    participant_phone: string;
    participant_occupation?: string;
    participant_occupation_other?: string;
    student_institution?: string;
    student_year?: string;
    professional_company?: string;
    professional_role?: string;
    self_employed_profession?: string;
  };
  attendance_data?: {
    user_id: string;
    attended: boolean;
    best_speaker?: boolean;
    moderator?: boolean;
  };
  points_data?: {
    user_id: string;
    points: number;
    type: string;
    reason: string;
  };
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

    const { action, gd_id, participant_data, attendance_data, points_data }: GDRegistrationRequest = await req.json();

    console.log(`GD Management: ${action} for user ${user.id}, GD ${gd_id}`);

    switch (action) {
      case 'register':
        return await handleRegistration(supabase, user.id, gd_id, participant_data!);
      
      case 'cancel':
        return await handleCancellation(supabase, user.id, gd_id);
      
      case 'mark_attendance':
        return await handleAttendance(supabase, user, gd_id, attendance_data!);
      
      case 'award_points':
        return await handlePointsAwarding(supabase, user, points_data!);
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error: any) {
    console.error('Error in GD management:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function handleRegistration(supabase: any, userId: string, gdId: string, participantData: any): Promise<Response> {
  try {
    // Use the existing atomic registration function
    const { data, error } = await supabase.rpc('register_for_gd_atomic', {
      p_gd_id: gdId,
      p_user_id: userId,
      p_participant_name: participantData.participant_name,
      p_participant_email: participantData.participant_email,
      p_participant_phone: participantData.participant_phone,
      p_participant_occupation: participantData.participant_occupation,
      p_participant_occupation_other: participantData.participant_occupation_other,
      p_student_institution: participantData.student_institution,
      p_student_year: participantData.student_year,
      p_professional_company: participantData.professional_company,
      p_professional_role: participantData.professional_role,
      p_self_employed_profession: participantData.self_employed_profession,
    });

    if (error) throw error;

    // Create registration confirmation notification
    await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_title: '✅ GD Registration Confirmed',
      p_message: 'You have successfully registered for the group discussion.',
      p_type: 'success',
      p_metadata: JSON.stringify({ gd_id: gdId, registration_id: data.registration_id })
    });

    console.log(`Registration successful for user ${userId}, GD ${gdId}`);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
}

async function handleCancellation(supabase: any, userId: string, gdId: string): Promise<Response> {
  try {
    // Use the existing cancellation function
    const { data, error } = await supabase.rpc('cancel_gd_registration', {
      p_gd_id: gdId,
      p_user_id: userId,
    });

    if (error) throw error;

    // Create cancellation notification
    await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_title: data.cancellation_type === 'dropout' ? '⚠️ GD Dropout Penalty' : '📝 GD Cancellation',
      p_message: data.message,
      p_type: data.cancellation_type === 'dropout' ? 'warning' : 'info',
      p_metadata: JSON.stringify({ 
        gd_id: gdId, 
        cancellation_type: data.cancellation_type,
        points_deducted: data.points_deducted 
      })
    });

    console.log(`Cancellation processed for user ${userId}, GD ${gdId}: ${data.cancellation_type}`);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Cancellation error:', error);
    throw error;
  }
}

async function handleAttendance(supabase: any, user: any, gdId: string, attendanceData: any): Promise<Response> {
  try {
    // Verify admin permissions for attendance marking
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      throw new Error('Only admins can mark attendance');
    }

    // Update attendance record
    const { error: updateError } = await supabase
      .from('gd_registrations')
      .update({ attended: attendanceData.attended })
      .eq('gd_id', gdId)
      .eq('user_id', attendanceData.user_id);

    if (updateError) throw updateError;

    // Get admin settings for point values
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('*')
      .single();

    const pointsPerAttendance = settings?.points_per_attendance || 10;
    const pointsPerBestSpeaker = settings?.points_per_best_speaker || 20;
    const pointsPerModeration = settings?.points_per_moderation || 15;

    const pointsAwarded = [];

    if (attendanceData.attended) {
      // First, check for and remove any existing no-show penalties for this GD
      const { data: gdInfo } = await supabase
        .from('group_discussions')
        .select('scheduled_date, topic_name')
        .eq('id', gdId)
        .single();

      if (gdInfo) {
        const gdDate = gdInfo.scheduled_date.split('T')[0];
        
        // Remove any existing no-show penalties for this user and GD date
        const { data: existingPenalties } = await supabase
          .from('reward_points')
          .select('id, points')
          .eq('user_id', attendanceData.user_id)
          .eq('type', 'No Show')
          .eq('gd_date', gdDate);

        if (existingPenalties && existingPenalties.length > 0) {
          // Delete the no-show penalty records
          const { error: deleteError } = await supabase
            .from('reward_points')
            .delete()
            .eq('user_id', attendanceData.user_id)
            .eq('type', 'No Show')
            .eq('gd_date', gdDate);

          if (deleteError) {
            console.error('Error removing no-show penalties:', deleteError);
          } else {
            const removedPoints = existingPenalties.reduce((sum, penalty) => sum + Math.abs(penalty.points), 0);
            console.log(`Removed ${removedPoints} penalty points for user ${attendanceData.user_id} for GD ${gdId}`);
            
            // Create notification about penalty removal
            await supabase.rpc('create_notification', {
              p_user_id: attendanceData.user_id,
              p_title: '✅ Penalty Reversed',
              p_message: `Your no-show penalty for "${gdInfo.topic_name}" has been removed by an admin. +${removedPoints} points restored.`,
              p_type: 'success',
              p_metadata: JSON.stringify({ 
                gd_id: gdId, 
                gd_topic: gdInfo.topic_name,
                penalty_removed: removedPoints,
                reason: 'Admin attendance override'
              })
            });
          }
        }
      }

      // Award attendance points
      const { error: pointsError } = await supabase
        .from('reward_points')
        .insert({
          user_id: attendanceData.user_id,
          points: pointsPerAttendance,
          type: 'Attendance',
          reason: 'GD Attendance',
          awarded_by: null, // System-generated, not manually awarded
          gd_date: new Date().toISOString().split('T')[0]
        });

      if (pointsError) throw pointsError;
      pointsAwarded.push({ type: 'Attendance', points: pointsPerAttendance });

      // Check for perfect attendance bonus (4+ sessions per month)
      await checkAndAwardPerfectAttendance(supabase, attendanceData.user_id, user.id);

      // Award best speaker points if applicable
      if (attendanceData.best_speaker) {
        const { error: speakerError } = await supabase
          .from('reward_points')
          .insert({
            user_id: attendanceData.user_id,
            points: pointsPerBestSpeaker,
            type: 'Best Speaker',
            reason: 'Best Speaker Award',
            awarded_by: user.id,
            gd_date: new Date().toISOString().split('T')[0]
          });

        if (speakerError) throw speakerError;
        pointsAwarded.push({ type: 'Best Speaker', points: pointsPerBestSpeaker });
      }

      // Award moderator points if applicable
      if (attendanceData.moderator) {
        const { error: modError } = await supabase
          .from('reward_points')
          .insert({
            user_id: attendanceData.user_id,
            points: pointsPerModeration,
            type: 'Moderator',
            reason: 'Session Moderation',
            awarded_by: user.id,
            gd_date: new Date().toISOString().split('T')[0]
          });

        if (modError) throw modError;
        pointsAwarded.push({ type: 'Moderator', points: pointsPerModeration });
      }

      // Create notification for points awarded
      const totalPoints = pointsAwarded.reduce((sum, award) => sum + award.points, 0);
      await supabase.rpc('create_notification', {
        p_user_id: attendanceData.user_id,
        p_title: '🎉 Points Awarded!',
        p_message: `You earned ${totalPoints} points for GD participation!`,
        p_type: 'reward',
        p_metadata: JSON.stringify({ 
          gd_id: gdId, 
          points_breakdown: pointsAwarded,
          total_points: totalPoints 
        })
      });
    }

    console.log(`Attendance marked for user ${attendanceData.user_id}, GD ${gdId}: ${attendanceData.attended}`);

    return new Response(JSON.stringify({ 
      success: true, 
      points_awarded: pointsAwarded,
      message: 'Attendance updated successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Attendance marking error:', error);
    throw error;
  }
}

async function handlePointsAwarding(supabase: any, user: any, pointsData: any): Promise<Response> {
  try {
    // Verify admin permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      throw new Error('Only admins can award points');
    }

    // Insert reward points
    const { data, error } = await supabase
      .from('reward_points')
      .insert({
        user_id: pointsData.user_id,
        points: pointsData.points,
        type: pointsData.type,
        reason: pointsData.reason,
        awarded_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Create notification
    await supabase.rpc('create_notification', {
      p_user_id: pointsData.user_id,
      p_title: pointsData.points > 0 ? '🎉 Points Awarded!' : '⚠️ Points Deducted',
      p_message: `${pointsData.points > 0 ? 'Earned' : 'Lost'} ${Math.abs(pointsData.points)} points: ${pointsData.reason}`,
      p_type: pointsData.points > 0 ? 'reward' : 'warning',
      p_metadata: JSON.stringify({ 
        points: pointsData.points,
        type: pointsData.type,
        reason: pointsData.reason
      })
    });

    console.log(`Points ${pointsData.points > 0 ? 'awarded' : 'deducted'} for user ${pointsData.user_id}: ${pointsData.points}`);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Points awarding error:', error);
    throw error;
  }
}

async function checkAndAwardPerfectAttendance(supabase: any, userId: string, awardedBy: string): Promise<void> {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Get the start and end of current month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
    const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
    
    // Count attendance sessions this month
    const { data: attendanceCount, error: countError } = await supabase
      .from('reward_points')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'Attendance')
      .gte('gd_date', startOfMonth)
      .lte('gd_date', endOfMonth);
    
    if (countError) {
      console.error('Error counting attendance:', countError);
      return;
    }
    
    const attendanceThisMonth = attendanceCount?.length || 0;
    
    // Check if user already received perfect attendance bonus this month
    const { data: existingBonus, error: bonusError } = await supabase
      .from('reward_points')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'Perfect Attendance')
      .gte('created_at', startOfMonth + 'T00:00:00Z')
      .lte('created_at', endOfMonth + 'T23:59:59Z');
    
    if (bonusError) {
      console.error('Error checking existing bonus:', bonusError);
      return;
    }
    
    // If user has 4+ sessions this month and hasn't received bonus yet
    if (attendanceThisMonth >= 4 && (!existingBonus || existingBonus.length === 0)) {
      // Award perfect attendance bonus
      const { error: bonusInsertError } = await supabase
        .from('reward_points')
        .insert({
          user_id: userId,
          points: 50,
          type: 'Perfect Attendance',
          reason: `Perfect Attendance Bonus - ${attendanceThisMonth} sessions in ${currentMonth}/${currentYear}`,
          awarded_by: awardedBy,
          gd_date: now.toISOString().split('T')[0]
        });
      
      if (bonusInsertError) {
        console.error('Error awarding perfect attendance bonus:', bonusInsertError);
        return;
      }
      
      // Create notification
      await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_title: '🏆 Perfect Attendance Bonus!',
        p_message: `Congratulations! You've earned +50 points for attending ${attendanceThisMonth} sessions this month!`,
        p_type: 'reward',
        p_metadata: JSON.stringify({ 
          sessions_count: attendanceThisMonth,
          month: `${currentMonth}/${currentYear}`,
          bonus_points: 50
        })
      });
      
      console.log(`Perfect attendance bonus awarded to user ${userId} for ${attendanceThisMonth} sessions`);
    }
  } catch (error) {
    console.error('Error in perfect attendance check:', error);
  }
}

serve(handler);