export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      gd_registrations: {
        Row: {
          attended: boolean | null
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
      get_user_total_points: {
        Args: { _user_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_download_count: {
        Args: { resource_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      register_for_gd_atomic: {
        Args: {
          p_gd_id: string
          p_user_id: string
          p_participant_name: string
          p_participant_email: string
          p_participant_phone: string
          p_participant_occupation?: string
          p_participant_occupation_other?: string
          p_student_institution?: string
          p_student_year?: string
          p_professional_company?: string
          p_professional_role?: string
          p_self_employed_profession?: string
        }
        Returns: Json
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
