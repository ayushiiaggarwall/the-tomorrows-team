import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  action: 'send_bulk' | 'send_individual' | 'mark_read' | 'mark_all_read' | 'delete_expired';
  notification_data?: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error' | 'reward';
    is_global?: boolean;
    expires_at?: string;
    metadata?: any;
    target_users?: string[];
    target_criteria?: {
      is_admin?: boolean;
      has_attended_gd?: boolean;
      points_threshold?: number;
    };
  };
  notification_id?: string;
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

    const { action, notification_data, notification_id }: NotificationRequest = await req.json();

    console.log(`Notification System: ${action} by user ${user.id}`);

    switch (action) {
      case 'send_bulk':
        return await handleBulkNotification(supabase, user.id, notification_data!);
      
      case 'send_individual':
        return await handleIndividualNotification(supabase, user.id, notification_data!);
      
      case 'mark_read':
        return await handleMarkRead(supabase, user.id, notification_id!);
      
      case 'mark_all_read':
        return await handleMarkAllRead(supabase, user.id);
      
      case 'delete_expired':
        return await handleDeleteExpired(supabase, user.id);
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error: any) {
    console.error('Error in notification system:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function handleBulkNotification(supabase: any, senderId: string, notificationData: any): Promise<Response> {
  try {
    // Verify admin permissions for bulk notifications
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', senderId)
      .single();

    if (!profile?.is_admin) {
      throw new Error('Only admins can send bulk notifications');
    }

    let targetUsers: string[] = [];

    if (notificationData.target_users && notificationData.target_users.length > 0) {
      // Specific users targeted
      targetUsers = notificationData.target_users;
    } else if (notificationData.target_criteria) {
      // Find users based on criteria
      targetUsers = await findUsersByCriteria(supabase, notificationData.target_criteria);
    } else if (notificationData.is_global) {
      // Global notification - create single notification record
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: null,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || 'info',
          is_global: true,
          expires_at: notificationData.expires_at,
          metadata: notificationData.metadata
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`Global notification sent: ${notificationData.title}`);

      return new Response(JSON.stringify({ 
        success: true, 
        notification: data,
        recipients_count: 'all_users',
        message: 'Global notification sent successfully' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Send individual notifications to target users
    const notifications = targetUsers.map(userId => ({
      user_id: userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      is_global: false,
      expires_at: notificationData.expires_at,
      metadata: notificationData.metadata
    }));

    // Insert notifications in batches to avoid timeout
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('notifications')
        .insert(batch)
        .select();

      if (error) throw error;
      results.push(...data);
    }

    console.log(`Bulk notification sent to ${targetUsers.length} users: ${notificationData.title}`);

    return new Response(JSON.stringify({ 
      success: true, 
      notifications: results,
      recipients_count: targetUsers.length,
      message: 'Bulk notifications sent successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Bulk notification error:', error);
    throw error;
  }
}

async function handleIndividualNotification(supabase: any, senderId: string, notificationData: any): Promise<Response> {
  try {
    // Individual notifications can be sent by any authenticated user
    if (!notificationData.target_users || notificationData.target_users.length !== 1) {
      throw new Error('Individual notification requires exactly one target user');
    }

    const targetUserId = notificationData.target_users[0];

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        is_global: false,
        expires_at: notificationData.expires_at,
        metadata: notificationData.metadata
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`Individual notification sent to user ${targetUserId}: ${notificationData.title}`);

    return new Response(JSON.stringify({ 
      success: true, 
      notification: data,
      message: 'Individual notification sent successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Individual notification error:', error);
    throw error;
  }
}

async function handleMarkRead(supabase: any, userId: string, notificationId: string): Promise<Response> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log(`Notification marked as read: ${notificationId} by user ${userId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      notification: data,
      message: 'Notification marked as read' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Mark read error:', error);
    throw error;
  }
}

async function handleMarkAllRead(supabase: any, userId: string): Promise<Response> {
  try {
    // Use the existing RPC function
    const { data: count, error } = await supabase.rpc('mark_all_notifications_read', {
      p_user_id: userId
    });

    if (error) throw error;

    console.log(`${count} notifications marked as read for user ${userId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      marked_count: count,
      message: `${count} notifications marked as read` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Mark all read error:', error);
    throw error;
  }
}

async function handleDeleteExpired(supabase: any, userId: string): Promise<Response> {
  try {
    // Verify admin permissions for deleting expired notifications
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (!profile?.is_admin) {
      throw new Error('Only admins can delete expired notifications');
    }

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select();

    if (error) throw error;

    const deletedCount = data?.length || 0;

    console.log(`${deletedCount} expired notifications deleted by admin ${userId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      deleted_count: deletedCount,
      message: `${deletedCount} expired notifications deleted` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Delete expired error:', error);
    throw error;
  }
}

async function findUsersByCriteria(supabase: any, criteria: any): Promise<string[]> {
  try {
    let query = supabase.from('profiles').select('id');

    if (criteria.is_admin !== undefined) {
      query = query.eq('is_admin', criteria.is_admin);
    }

    if (criteria.has_attended_gd) {
      // Find users who have attended at least one GD
      const { data: attendees } = await supabase
        .from('gd_registrations')
        .select('user_id')
        .eq('attended', true);
      
      const attendeeIds = attendees?.map(reg => reg.user_id) || [];
      if (attendeeIds.length > 0) {
        query = query.in('id', attendeeIds);
      } else {
        return [];
      }
    }

    if (criteria.points_threshold !== undefined) {
      // Find users with points above threshold
      const { data: pointHolders } = await supabase
        .rpc('get_users_by_points_threshold', { threshold: criteria.points_threshold });
      
      const holderIds = pointHolders?.map(user => user.user_id) || [];
      if (holderIds.length > 0) {
        query = query.in('id', holderIds);
      } else {
        return [];
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    return data?.map(user => user.id) || [];

  } catch (error) {
    console.error('Error finding users by criteria:', error);
    return [];
  }
}

serve(handler);