export type { Database } from '@/types/supabase';
export type Prompt = Database['public']['Tables']['prompts']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];
