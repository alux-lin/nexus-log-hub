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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      inventory_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          archetype_class: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_onboarded: boolean
          updated_at: string
          user_id: string
          xp_base: number
          xp_max_level: number
          xp_ratio: number
        }
        Insert: {
          archetype_class?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_onboarded?: boolean
          updated_at?: string
          user_id: string
          xp_base?: number
          xp_max_level?: number
          xp_ratio?: number
        }
        Update: {
          archetype_class?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_onboarded?: boolean
          updated_at?: string
          user_id?: string
          xp_base?: number
          xp_max_level?: number
          xp_ratio?: number
        }
        Relationships: []
      }
      quarterly_reviews: {
        Row: {
          archived_at: string
          created_at: string
          id: string
          manifesto_data: Json
          quarter_label: string
          user_id: string
          vision_text: string | null
          year: number
        }
        Insert: {
          archived_at?: string
          created_at?: string
          id?: string
          manifesto_data?: Json
          quarter_label: string
          user_id: string
          vision_text?: string | null
          year: number
        }
        Update: {
          archived_at?: string
          created_at?: string
          id?: string
          manifesto_data?: Json
          quarter_label?: string
          user_id?: string
          vision_text?: string | null
          year?: number
        }
        Relationships: []
      }
      quarterly_visions: {
        Row: {
          created_at: string
          id: string
          quarter_label: string
          target_date: string | null
          updated_at: string
          user_id: string
          vision_text: string | null
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          quarter_label: string
          target_date?: string | null
          updated_at?: string
          user_id: string
          vision_text?: string | null
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          quarter_label?: string
          target_date?: string | null
          updated_at?: string
          user_id?: string
          vision_text?: string | null
          year?: number
        }
        Relationships: []
      }
      quest_stat_rewards: {
        Row: {
          created_at: string
          id: string
          quest_id: string
          stat_id: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          quest_id: string
          stat_id: string
          xp_amount?: number
        }
        Update: {
          created_at?: string
          id?: string
          quest_id?: string
          stat_id?: string
          xp_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "quest_stat_rewards_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_stat_rewards_stat_id_fkey"
            columns: ["stat_id"]
            isOneToOne: false
            referencedRelation: "stat_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          category_stat_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          impact: number
          priority: string
          quarter: string | null
          reflection: string | null
          status: string
          target_completion_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_stat_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          impact?: number
          priority?: string
          quarter?: string | null
          reflection?: string | null
          status?: string
          target_completion_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_stat_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          impact?: number
          priority?: string
          quarter?: string | null
          reflection?: string | null
          status?: string
          target_completion_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quests_category_stat_id_fkey"
            columns: ["category_stat_id"]
            isOneToOne: false
            referencedRelation: "stat_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_items: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          rarity: string
          reward_payload: Json | null
          reward_type: string
          title: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          rarity: string
          reward_payload?: Json | null
          reward_type: string
          title: string
          user_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          rarity?: string
          reward_payload?: Json | null
          reward_type?: string
          title?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      reward_log: {
        Row: {
          id: string
          reward_item_id: string | null
          rolled_at: string
          tracker_entry_id: string
          tracker_id: string
          user_id: string
          was_winner: boolean
        }
        Insert: {
          id?: string
          reward_item_id?: string | null
          rolled_at?: string
          tracker_entry_id: string
          tracker_id: string
          user_id: string
          was_winner: boolean
        }
        Update: {
          id?: string
          reward_item_id?: string | null
          rolled_at?: string
          tracker_entry_id?: string
          tracker_id?: string
          user_id?: string
          was_winner?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reward_log_reward_item_id_fkey"
            columns: ["reward_item_id"]
            isOneToOne: false
            referencedRelation: "reward_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_log_tracker_entry_id_fkey"
            columns: ["tracker_entry_id"]
            isOneToOne: false
            referencedRelation: "tracker_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_log_tracker_id_fkey"
            columns: ["tracker_id"]
            isOneToOne: false
            referencedRelation: "trackers"
            referencedColumns: ["id"]
          },
        ]
      }
      stat_definitions: {
        Row: {
          archetype_name: string | null
          color: string | null
          created_at: string
          current_value: number
          icon: string | null
          id: string
          max_value: number
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archetype_name?: string | null
          color?: string | null
          created_at?: string
          current_value?: number
          icon?: string | null
          id?: string
          max_value?: number
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archetype_name?: string | null
          color?: string | null
          created_at?: string
          current_value?: number
          icon?: string | null
          id?: string
          max_value?: number
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tracker_entries: {
        Row: {
          id: string
          logged_at: string
          note: string | null
          tracker_id: string
          user_id: string
          value: number
        }
        Insert: {
          id?: string
          logged_at?: string
          note?: string | null
          tracker_id: string
          user_id: string
          value: number
        }
        Update: {
          id?: string
          logged_at?: string
          note?: string | null
          tracker_id?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "tracker_entries_tracker_id_fkey"
            columns: ["tracker_id"]
            isOneToOne: false
            referencedRelation: "trackers"
            referencedColumns: ["id"]
          },
        ]
      }
      tracker_milestones: {
        Row: {
          id: string
          reward_text: string
          threshold_percent: number
          tracker_id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          reward_text: string
          threshold_percent: number
          tracker_id: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          reward_text?: string
          threshold_percent?: number
          tracker_id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracker_milestones_tracker_id_fkey"
            columns: ["tracker_id"]
            isOneToOne: false
            referencedRelation: "trackers"
            referencedColumns: ["id"]
          },
        ]
      }
      tracker_reward_overrides: {
        Row: {
          excluded: boolean
          id: string
          reward_item_id: string
          tracker_id: string
          user_id: string
          weight_override: number | null
        }
        Insert: {
          excluded?: boolean
          id?: string
          reward_item_id: string
          tracker_id: string
          user_id: string
          weight_override?: number | null
        }
        Update: {
          excluded?: boolean
          id?: string
          reward_item_id?: string
          tracker_id?: string
          user_id?: string
          weight_override?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tracker_reward_overrides_reward_item_id_fkey"
            columns: ["reward_item_id"]
            isOneToOne: false
            referencedRelation: "reward_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracker_reward_overrides_tracker_id_fkey"
            columns: ["tracker_id"]
            isOneToOne: false
            referencedRelation: "trackers"
            referencedColumns: ["id"]
          },
        ]
      }
      trackers: {
        Row: {
          created_at: string
          id: string
          linked_quest_id: string | null
          quarter_label: string
          target_value: number
          title: string
          unit: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          linked_quest_id?: string | null
          quarter_label: string
          target_value: number
          title: string
          unit: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          linked_quest_id?: string | null
          quarter_label?: string
          target_value?: number
          title?: string
          unit?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "trackers_linked_quest_id_fkey"
            columns: ["linked_quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
