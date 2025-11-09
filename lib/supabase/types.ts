import type { Database } from '@/lib/database.types';

export type { Database };
export type Prompt = Database['public']['Tables']['prompts']['Row'];
export type PromptInsert = Database['public']['Tables']['prompts']['Insert'];
export type PromptUpdate = Database['public']['Tables']['prompts']['Update'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];
