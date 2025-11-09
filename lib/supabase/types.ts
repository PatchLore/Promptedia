export type Database = {
  public: {
    Tables: {
      prompts: {
        Row: {
          id: string;
          slug: string | null;
          title: string | null;
          prompt: string | null;
          category: string | null;
          type: string | null;
          example_url: string | null;
          model: string | null;
          tags: string[] | null;
          user_id: string | null;
          audio_preview_url: string | null;
          is_public: boolean;
          is_pro: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug?: string | null;
          title?: string | null;
          prompt?: string | null;
          category?: string | null;
          type?: string | null;
          example_url?: string | null;
          model?: string | null;
          tags?: string[] | null;
          user_id?: string | null;
          audio_preview_url?: string | null;
          is_public?: boolean;
          is_pro?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string | null;
          title?: string | null;
          prompt?: string | null;
          category?: string | null;
          type?: string | null;
          example_url?: string | null;
          model?: string | null;
          tags?: string[] | null;
          user_id?: string | null;
          audio_preview_url?: string | null;
          is_public?: boolean;
          is_pro?: boolean;
          created_at?: string;
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
        Update: {
          id?: string;
          user_id?: string;
          prompt_id?: string;
          created_at?: string;
        };
      };
    };
  };
};

export type Prompt = Database['public']['Tables']['prompts']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];



