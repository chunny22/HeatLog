-- Run this in your Supabase project's SQL Editor (Project -> SQL Editor -> New query).
-- Safe to re-run in full any time this file changes -- every statement is idempotent.
create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  date date not null,
  notes text,
  entries jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 'planned' = scheduled but not yet done (no RPE on its sets yet);
-- 'completed' = actually performed. Added after the table already existed
-- for some users, hence the separate ALTER rather than a column above.
alter table workout_sessions add column if not exists status text not null default 'completed';
alter table workout_sessions drop constraint if exists workout_sessions_status_check;
alter table workout_sessions add constraint workout_sessions_status_check check (status in ('planned', 'completed'));

-- Cascade so an admin deleting a user (see the admin-delete-user function)
-- doesn't hit a foreign-key violation from that user's leftover sessions.
alter table workout_sessions drop constraint if exists workout_sessions_user_id_fkey;
alter table workout_sessions add constraint workout_sessions_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table workout_sessions enable row level security;

drop policy if exists "Users manage their own sessions" on workout_sessions;
create policy "Users manage their own sessions"
  on workout_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists workout_sessions_user_date_idx
  on workout_sessions (user_id, date);

-- Profile info (name, weight, height) collected at sign-up. Kept in its own
-- table (rather than auth user metadata) so it's easy to query and extend
-- later, e.g. for AI-personalized workout plans. Weight/height each store
-- their unit alongside the value, same pattern as workout_sessions' sets.
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  weight numeric not null,
  weight_unit text not null check (weight_unit in ('lb', 'kg')),
  height numeric not null,
  height_unit text not null check (height_unit in ('in', 'cm')),
  updated_at timestamptz default now()
);

-- Fitness goals, collected at sign-up, drive the AI day-insight feature.
-- Multi-select, so this is an array rather than a single value. Originally
-- shipped as a single `goal` column; this migrates any existing data over
-- and drops it, guarded so it's a no-op once already migrated.
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'goal') then
    alter table profiles add column if not exists goals text[];
    update profiles set goals = array[goal] where goals is null and goal is not null;
    alter table profiles drop column goal;
  end if;
end $$;

alter table profiles add column if not exists goals text[] not null default array['general_fitness'];

alter table profiles drop constraint if exists profiles_goal_check;
alter table profiles drop constraint if exists profiles_goals_check;
alter table profiles add constraint profiles_goals_check
  check (
    goals <@ array['lose_weight', 'build_muscle', 'lean_tone', 'bulk_strength', 'general_fitness']::text[]
    and array_length(goals, 1) > 0
  );

-- Name was originally a single `full_name`; split into first/last. Backfills
-- existing rows (first word -> first_name, the rest -> last_name) and drops
-- the old column, guarded so it's a no-op once already migrated.
alter table profiles add column if not exists first_name text not null default '';
alter table profiles add column if not exists last_name text not null default '';

do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'full_name') then
    update profiles
    set first_name = split_part(btrim(full_name), ' ', 1),
        last_name = btrim(substr(btrim(full_name), length(split_part(btrim(full_name), ' ', 1)) + 1))
    where first_name = '' and last_name = '';
    alter table profiles drop column full_name;
  end if;
end $$;

-- Default unit for new sets and the Progress charts. Separate from weight_unit
-- (the unit of the stored body weight). Existing rows start from their weight_unit.
alter table profiles add column if not exists unit_preference text;
update profiles set unit_preference = weight_unit where unit_preference is null;
alter table profiles alter column unit_preference set default 'lb';
alter table profiles alter column unit_preference set not null;
alter table profiles drop constraint if exists profiles_unit_preference_check;
alter table profiles add constraint profiles_unit_preference_check check (unit_preference in ('lb', 'kg'));

alter table profiles enable row level security;

drop policy if exists "Users manage their own profile" on profiles;
create policy "Users manage their own profile"
  on profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-creates a profile row from the metadata passed to supabase.auth.signUp(),
-- since the client can't insert directly until email confirmation completes.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, weight, weight_unit, unit_preference, height, height_unit, goals)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    (new.raw_user_meta_data->>'weight')::numeric,
    new.raw_user_meta_data->>'weight_unit',
    new.raw_user_meta_data->>'weight_unit',
    (new.raw_user_meta_data->>'height')::numeric,
    new.raw_user_meta_data->>'height_unit',
    array(select jsonb_array_elements_text(coalesce(new.raw_user_meta_data->'goals', '["general_fitness"]'::jsonb)))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Cached AI "day insight" comment, one per user per date. Regenerated
-- client-side only when sessions_fingerprint no longer matches that day's
-- actual session data (see src/hooks/useDayInsight.ts).
create table if not exists day_insights (
  user_id uuid references auth.users not null default auth.uid(),
  date date not null,
  insight text not null,
  sessions_fingerprint text not null,
  generated_at timestamptz default now(),
  primary key (user_id, date)
);

alter table day_insights drop constraint if exists day_insights_user_id_fkey;
alter table day_insights add constraint day_insights_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table day_insights enable row level security;

drop policy if exists "Users manage their own day insights" on day_insights;
create policy "Users manage their own day insights"
  on day_insights
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Body-weight history for the progress chart. One weigh-in per user per day
-- (logging again on the same day replaces it). Same value+unit pattern as
-- profiles / workout sets.
create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  weight numeric not null check (weight > 0),
  unit text not null check (unit in ('lb', 'kg')),
  unique (user_id, date)
);

alter table weight_logs enable row level security;

drop policy if exists "Users manage their own weight logs" on weight_logs;
create policy "Users manage their own weight logs"
  on weight_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Exercises users add themselves, on top of the built-in list in
-- src/data/exercises.ts. `muscles` is [{ "group": "quads", "role": "primary" }, ...]
-- (same shape as the built-ins) so the heatmap and AI coach treat them alike.
-- Removing one only sets `archived`, so old workouts keep resolving its name.
create table if not exists custom_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 60),
  category text not null check (category in ('push', 'pull', 'legs', 'core', 'cardio')),
  muscles jsonb not null default '[]'::jsonb check (jsonb_typeof(muscles) = 'array'),
  archived boolean not null default false,
  created_at timestamptz default now()
);

-- One active exercise per name per user (case-insensitive).
create unique index if not exists custom_exercises_user_name_idx
  on custom_exercises (user_id, lower(btrim(name))) where not archived;

alter table custom_exercises enable row level security;

drop policy if exists "Users read their own custom exercises" on custom_exercises;
create policy "Users read their own custom exercises"
  on custom_exercises for select using (auth.uid() = user_id);

-- Capped at 100 per user so one account can't fill the table.
drop policy if exists "Users add their own custom exercises" on custom_exercises;
create policy "Users add their own custom exercises"
  on custom_exercises for insert
  with check (
    auth.uid() = user_id
    and (select count(*) from custom_exercises where user_id = auth.uid()) < 100
  );

drop policy if exists "Users edit their own custom exercises" on custom_exercises;
create policy "Users edit their own custom exercises"
  on custom_exercises for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete their own custom exercises" on custom_exercises;
create policy "Users delete their own custom exercises"
  on custom_exercises for delete using (auth.uid() = user_id);
