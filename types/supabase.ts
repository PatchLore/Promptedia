export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      favorites: {
        Row: {
          id: string;
          user_id: string | null;
          prompt_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          prompt_id?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['favorites']['Insert']>;
      };
      prompt_collection_items: {
        Row: {
          id: string;
          collection_id: string | null;
          prompt_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          collection_id?: string | null;
          prompt_id?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['prompt_collection_items']['Insert']>;
      };
      prompt_collections: {
        Row: {
          id: string;
          user_id: string | null;
          name: string | null;
          description: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name?: string | null;
          description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['prompt_collections']['Insert']>;
      };
      prompts: {
        Row: {
          id: string;
          title: string | null;
          slug: string | null;
          prompt: string | null;
          category: string | null;
          type: string | null;
          audio_preview_url: string | null;
          thumbnail_url: string | null;
          description: string | null;
          model: string | null;
          tags: string[] | null;
          is_public: boolean | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title?: string | null;
          slug?: string | null;
          prompt?: string | null;
          category?: string | null;
          type?: string | null;
          audio_preview_url?: string | null;
          thumbnail_url?: string | null;
          description?: string | null;
          model?: string | null;
          tags?: string[] | null;
          is_public?: boolean | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string | null;
          slug?: string | null;
          prompt?: string | null;
          category?: string | null;
          type?: string | null;
          audio_preview_url?: string | null;
          thumbnail_url?: string | null;
          description?: string | null;
          model?: string | null;
          tags?: string[] | null;
          is_public?: boolean | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      saved_prompts: {
        Row: {
          id: string;
          user_id: string | null;
          prompt_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          prompt_id?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['saved_prompts']['Insert']>;
      };
    };
  };
}

