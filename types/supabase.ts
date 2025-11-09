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
      favorites: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['favorites']['Insert']>;
      };
    };
  };
}

