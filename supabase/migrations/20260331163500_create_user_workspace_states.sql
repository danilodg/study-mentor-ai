create table if not exists public.user_workspace_states (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  plan_code text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_workspace_states enable row level security;

create policy "Users can read own workspace state"
  on public.user_workspace_states
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own workspace state"
  on public.user_workspace_states
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own workspace state"
  on public.user_workspace_states
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own workspace state"
  on public.user_workspace_states
  for delete
  to authenticated
  using (auth.uid() = user_id);
