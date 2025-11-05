-- Promptopedia Database Schema

-- prompts table
create table prompts (
  id uuid primary key default gen_random_uuid(),
  title text,
  prompt text,
  category text,
  type text, -- e.g. "image", "music", "text"
  example_url text, -- link to generated output (image/audio)
  model text,
  tags text[],
  user_id uuid references auth.users(id) on delete set null,
  is_public boolean default true,
  is_pro boolean default false,
  created_at timestamp default now()
);

-- favorites table
create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  prompt_id uuid references prompts(id) on delete cascade,
  created_at timestamp default now(),
  unique(user_id, prompt_id)
);

-- Create indexes for better query performance
create index idx_prompts_category on prompts(category);
create index idx_prompts_type on prompts(type);
create index idx_prompts_is_public on prompts(is_public);
create index idx_prompts_is_pro on prompts(is_pro);
create index idx_prompts_created_at on prompts(created_at desc);
create index idx_favorites_user_id on favorites(user_id);
create index idx_favorites_prompt_id on favorites(prompt_id);

-- Enable Row Level Security (RLS)
alter table prompts enable row level security;
alter table favorites enable row level security;

-- Policies for prompts table
-- Anyone can read public prompts
create policy "Public prompts are viewable by everyone"
  on prompts for select
  using (is_public = true);

-- Users can create their own prompts
create policy "Users can create prompts"
  on prompts for insert
  with check (true);

-- Users can update their own prompts
create policy "Users can update their own prompts"
  on prompts for update
  using (auth.uid() = user_id);

-- Policies for favorites table
-- Users can view their own favorites
create policy "Users can view their own favorites"
  on favorites for select
  using (auth.uid() = user_id);

-- Users can create their own favorites
create policy "Users can create their own favorites"
  on favorites for insert
  with check (auth.uid() = user_id);

-- Users can delete their own favorites
create policy "Users can delete their own favorites"
  on favorites for delete
  using (auth.uid() = user_id);



