
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, cache-control",
};

interface DeleteUserRequest {
  userId: string;
  userEmail: string;
  userName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create regular client to verify admin status
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the current user from the auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: "Not authorized - admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { userId, userEmail, userName }: DeleteUserRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Starting deletion process for user ${userId} (${userEmail})`);

    // Send deletion confirmation email to user before deleting
    if (userEmail && userName) {
      console.log('Sending account deletion confirmation email to user:', userEmail);
      try {
        const userEmailResult = await resend.emails.send({
          from: "The Tomorrows Team <hello@thetomorrowsteam.com>",
          to: [userEmail],
          subject: "Your Account Has Been Deleted – The Tomorrows Team",
          html: `Hi ${userName || 'there'},<br><br>

We're writing to confirm that your account with The Tomorrows Team has been successfully deleted, as per your request.<br><br>

🔒 <strong>All your personal data, including:</strong><br><br>

• Profile information<br>
• Group discussion history<br>
• Reward points<br>
• Participation records<br><br>

has been permanently removed from our system and cannot be recovered.<br><br>

We're truly grateful for your time and participation in our community. If you ever wish to return, we'd be thrilled to welcome you back — anytime.<br><br>

If you have any questions or feedback, feel free to reach us at thetomorrowsteam@gmail.com.<br><br>

Wishing you all the best on your journey ahead.<br><br>

Warm regards,<br>
The Tomorrows Team`,
        });
        console.log('User deletion email sent successfully:', userEmailResult);
      } catch (emailError) {
        console.error('Failed to send user deletion email:', emailError);
      }

      // Send simple admin notification email
      console.log('Sending admin notification email');
      try {
        const adminEmailResult = await resend.emails.send({
          from: "The Tomorrows Team <hello@thetomorrowsteam.com>",
          to: ["thetomorrowsteam@gmail.com"],
          subject: "User Account Deleted",
          html: `User: ${userName || 'Unknown'} (${userEmail})<br>
Account has been permanently deleted.`,
        });
        console.log('Admin deletion email sent successfully:', adminEmailResult);
      } catch (adminEmailError) {
        console.error('Failed to send admin deletion email:', adminEmailError);
      }
    }

    // Delete all related data first (using admin client to bypass RLS)
    const deleteOperations = [
      // Delete blogs first (foreign key constraint)
      supabaseAdmin.from('blogs').delete().eq('author_id', userId),
      
      // Delete media content (foreign key constraint)
      supabaseAdmin.from('media_content').delete().eq('created_by', userId),
      
      // Delete featured videos (foreign key constraint)
      supabaseAdmin.from('featured_videos').delete().eq('created_by', userId),
      
      // Delete community announcements (foreign key constraint)
      supabaseAdmin.from('community_announcements').delete().eq('created_by', userId),
      
      // Delete user referrals (both as referrer and referred)
      supabaseAdmin.from('user_referrals').delete().eq('referrer_id', userId),
      supabaseAdmin.from('user_referrals').delete().eq('referred_id', userId),
      
      // Delete reward points
      supabaseAdmin.from('reward_points').delete().eq('user_id', userId),
      
      // Delete GD registrations
      supabaseAdmin.from('gd_registrations').delete().eq('user_id', userId),
      
      // Delete notifications
      supabaseAdmin.from('notifications').delete().eq('user_id', userId),
      
      // Delete testimonials
      supabaseAdmin.from('testimonials').delete().eq('user_id', userId),
      
      // Delete admin logs (if any)
      supabaseAdmin.from('admin_logs').delete().eq('admin_id', userId),
      
      // Delete user roles
      supabaseAdmin.from('user_roles').delete().eq('user_id', userId),
      
      // Delete account deletion requests
      supabaseAdmin.from('account_deletion_requests').delete().eq('user_id', userId),
    ];

    // Execute all deletion operations
    for (const operation of deleteOperations) {
      const { error } = await operation;
      if (error) {
        console.error(`Error deleting related data:`, error);
        // Continue with other deletions even if one fails
      }
    }

    // Delete the profile last (this has the foreign key constraint)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
      return new Response(
        JSON.stringify({ error: `Failed to delete profile: ${profileError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Finally, delete the user from auth.users
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting user from auth:", deleteError);
      return new Response(
        JSON.stringify({ error: `Failed to delete user from auth: ${deleteError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`User ${userId} (${userEmail}) deleted successfully by admin ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User deleted successfully",
        deletedUserId: userId 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in delete-user-account function:", error);
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
