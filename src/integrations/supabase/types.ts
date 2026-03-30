export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          requested_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          id: string
          points_per_attendance: number
          points_per_best_speaker: number
          points_per_moderation: number
          points_per_perfect_attendance: number
          points_per_referral: number
          site_announcement: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_per_attendance?: number
          points_per_best_speaker?: number
          points_per_moderation?: number
          points_per_perfect_attendance?: number
          points_per_referral?: number
          site_announcement?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          points_per_attendance?: number
          points_per_best_speaker?: number
          points_per_moderation?: number
          points_per_perfect_attendance?: number
          points_per_referral?: number
          site_announcement?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          featured_image_url: string | null
          id: string
          scheduled_date: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          featured_image_url?: string | null
          id?: string
          scheduled_date?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          featured_image_url?: string | null
          id?: string
          scheduled_date?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_announcements: {
        Row: {
          content: string | null
          created_at: string
          created_by: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      downloadable_resources: {
        Row: {
          created_at: string | null
          description: string | null
          download_count: number | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      featured_videos: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_featured: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      gd_chat_messages: {
        Row: {
          attachment_filename: string | null
          attachment_url: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          gd_id: string
          id: string
          is_deleted: boolean | null
          is_pinned: boolean | null
          message: string
          message_type: string | null
          metadata: Json | null
          parent_message_id: string | null
          poll_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachment_filename?: string | null
          attachment_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          gd_id: string
          id?: string
          is_deleted?: boolean | null
          is_pinned?: boolean | null
          message: string
          message_type?: string | null
          metadata?: Json | null
          parent_message_id?: string | null
          poll_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachment_filename?: string | null
          attachment_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          gd_id?: string
          id?: string
          is_deleted?: boolean | null
          is_pinned?: boolean | null
          message?: string
          message_type?: string | null
          metadata?: Json | null
          parent_message_id?: string | null
          poll_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gd_chat_messages_gd_id_fkey"
            columns: ["gd_id"]
            isOneToOne: false
            referencedRelation: "group_discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gd_chat_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "gd_chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gd_chat_messages_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "gd_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      gd_message_votes: {
        Row: {
          created_at: string | null
          id: string
          message_id: string
          updated_at: string | null
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id: string
          updated_at?: string | null
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string
          updated_at?: string | null
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "gd_message_votes_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "gd_chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      gd_poll_options: {
        Row: {
          created_at: string | null
          id: string
          option_text: string
          poll_id: string
          user_id: string
          vote_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_text: string
          poll_id: string
          user_id: string
          vote_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_text?: string
          poll_id?: string
          user_id?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gd_poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "gd_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      gd_poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_id: string
          poll_id: string
          voter_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: string
          poll_id: string
          voter_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string
          poll_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gd_poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "gd_poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gd_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "gd_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      gd_polls: {
        Row: {
          created_at: string | null
          expires_at: string
          gd_id: string
          id: string
          is_active: boolean | null
          message_id: string | null
          poll_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          gd_id: string
          id?: string
          is_active?: boolean | null
          message_id?: string | null
          poll_type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          gd_id?: string
          id?: string
          is_active?: boolean | null
          message_id?: string | null
          poll_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gd_polls_gd_id_fkey"
            columns: ["gd_id"]
            isOneToOne: false
            referencedRelation: "group_discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gd_polls_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "gd_chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      gd_registrations: {
        Row: {
          attended: boolean | null
          cancellation_reason: string | null
          cancellation_type: string | null
          cancelled_at: string | null
          gd_id: string
          id: string
          noc_accepted: boolean | null
          noc_accepted_at: string | null
          participant_email: string | null
          participant_name: string | null
          participant_occupation: string | null
          participant_occupation_other: string | null
          participant_phone: string | null
          professional_company: string | null
          professional_role: string | null
          registered_at: string | null
          self_employed_profession: string | null
          student_institution: string | null
          student_year: string | null
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          cancellation_reason?: string | null
          cancellation_type?: string | null
          cancelled_at?: string | null
          gd_id: string
          id?: string
          noc_accepted?: boolean | null
          noc_accepted_at?: string | null
          participant_email?: string | null
          participant_name?: string | null
          participant_occupation?: string | null
          participant_occupation_other?: string | null
          participant_phone?: string | null
          professional_company?: string | null
          professional_role?: string | null
          registered_at?: string | null
          self_employed_profession?: string | null
          student_institution?: string | null
          student_year?: string | null
          user_id: string
        }
        Update: {
          attended?: boolean | null
          cancellation_reason?: string | null
          cancellation_type?: string | null
          cancelled_at?: string | null
          gd_id?: string
          id?: string
          noc_accepted?: boolean | null
          noc_accepted_at?: string | null
          participant_email?: string | null
          participant_name?: string | null
          participant_occupation?: string | null
          participant_occupation_other?: string | null
          participant_phone?: string | null
          professional_company?: string | null
          professional_role?: string | null
          registered_at?: string | null
          self_employed_profession?: string | null
          student_institution?: string | null
          student_year?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gd_registrations_gd_id_fkey"
            columns: ["gd_id"]
            isOneToOne: false
            referencedRelation: "group_discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      group_discussions: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          meet_link: string | null
          moderator_id: string | null
          scheduled_date: string
          session_type: string | null
          slot_capacity: number | null
          topic_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          meet_link?: string | null
          moderator_id?: string | null
          scheduled_date: string
          session_type?: string | null
          slot_capacity?: number | null
          topic_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          meet_link?: string | null
          moderator_id?: string | null
          scheduled_date?: string
          session_type?: string | null
          slot_capacity?: number | null
          topic_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      media_content: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          media_type: string
          media_url: string
          participant_count: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_duration: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          media_type: string
          media_url: string
          participant_count?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_duration?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          media_type?: string
          media_url?: string
          participant_count?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_duration?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_global: boolean
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_global?: boolean
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_global?: boolean
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      predefined_tags: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          profile_picture_url: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          profile_picture_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          profile_picture_url?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reward_points: {
        Row: {
          awarded_by: string | null
          created_at: string | null
          gd_date: string | null
          id: string
          points: number
          reason: string
          type: string
          user_id: string
        }
        Insert: {
          awarded_by?: string | null
          created_at?: string | null
          gd_date?: string | null
          id?: string
          points?: number
          reason: string
          type: string
          user_id: string
        }
        Update: {
          awarded_by?: string | null
          created_at?: string | null
          gd_date?: string | null
          id?: string
          points?: number
          reason?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      site_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          page_path: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          page_path?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          page_path?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          rating: number
          updated_at: string
          user_id: string
          user_name: string
          user_role: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          rating: number
          updated_at?: string
          user_id: string
          user_name: string
          user_role?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          rating?: number
          updated_at?: string
          user_id?: string
          user_name?: string
          user_role?: string | null
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_gd_registration: {
        Args: { p_gd_id: string; p_user_id: string }
        Returns: Json
      }
      create_best_speaker_poll: { Args: { p_gd_id: string }; Returns: string }
      create_notification: {
        Args: {
          p_expires_at?: string
          p_is_global?: boolean
          p_message: string
          p_metadata?: Json
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      get_analytics_summary: { Args: never; Returns: Json }
      get_user_total_points: { Args: { _user_id: string }; Returns: number }
      get_verified_users_count: { Args: never; Returns: number }
      get_verified_users_paginated: {
        Args: { end_index: number; start_index: number }
        Returns: {
          created_at: string
          date_of_birth: string
          email: string
          full_name: string
          id: string
          is_admin: boolean
          profile_picture_url: string
          tags: string[]
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_download_count: {
        Args: { resource_id: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      mark_all_notifications_read: {
        Args: { p_user_id: string }
        Returns: number
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      register_for_gd_atomic: {
        Args: {
          p_gd_id: string
          p_participant_email: string
          p_participant_name: string
          p_participant_occupation?: string
          p_participant_occupation_other?: string
          p_participant_phone: string
          p_professional_company?: string
          p_professional_role?: string
          p_self_employed_profession?: string
          p_student_institution?: string
          p_student_year?: string
          p_user_id: string
        }
        Returns: Json
      }
      track_page_view: {
        Args: {
          p_ip_address?: string
          p_page_path: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      vote_in_poll: {
        Args: { p_option_id: string; p_poll_id: string; p_voter_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
