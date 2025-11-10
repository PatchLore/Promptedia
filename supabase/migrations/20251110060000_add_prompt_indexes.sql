create index if not exists prompts_created_at_idx on public.prompts (created_at desc);
create index if not exists prompts_slug_idx on public.prompts (slug);
create index if not exists prompts_category_idx on public.prompts (category);
create index if not exists favorites_user_id_idx on public.favorites (user_id);

