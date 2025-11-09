import type { Database } from '@/lib/database.types';

export type Prompt = Database['public']['Tables']['prompts']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];
