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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      affiliates: {
        Row: {
          affiliate_url: string | null
          category: string[] | null
          commission_type: string | null
          commission_value: number | null
          cookie_days: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          affiliate_url?: string | null
          category?: string[] | null
          commission_type?: string | null
          commission_value?: number | null
          cookie_days?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          affiliate_url?: string | null
          category?: string[] | null
          commission_type?: string | null
          commission_value?: number | null
          cookie_days?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          prompt_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          prompt_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          prompt_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_collection_items: {
        Row: {
          created_at: string | null
          id: string
          collection_id: string | null
          prompt_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          collection_id?: string | null
          prompt_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          collection_id?: string | null
          prompt_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "prompt_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_collection_items_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saved_prompts: {
        Row: {
          created_at: string | null
          id: string
          prompt_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          prompt_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          prompt_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_prompts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          audio_preview_url: string | null
          category: string | null
          created_at: string | null
          description: string | null
          example_url: string | null
          id: string
          is_pro: boolean | null
          is_public: boolean | null
          model: string | null
          prompt: string | null
          slug: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audio_preview_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          example_url?: string | null
          id?: string
          is_pro?: boolean | null
          is_public?: boolean | null
          model?: string | null
          prompt?: string | null
          slug?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audio_preview_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          example_url?: string | null
          id?: string
          is_pro?: boolean | null
          is_public?: boolean | null
          model?: string | null
          prompt?: string | null
          slug?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
