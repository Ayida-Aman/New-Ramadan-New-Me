-- ============================================================================
-- NEW RAMADAN NEW ME — Complete Database Schema
-- ============================================================================
-- Run this migration against your Supabase project.
-- All tables live in the `public` schema and reference `auth.users`.
-- ============================================================================

-- 0. Extensions
-- ============================================================================
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 1. PROFILES (extends auth.users)
-- ============================================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null default '',
  display_name  text not null default '',
  avatar_url    text,
  bio           text default '',
  timezone      text not null default 'UTC',
  preferred_lang text not null default 'en' check (preferred_lang in ('en', 'ar')),
  onboarded     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
-- Public read for community features (display_name + avatar only via RPC)
create policy "Authenticated users can view all profiles"
  on public.profiles for select using (auth.role() = 'authenticated');

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();


-- 2. WEEKLY THEMES
-- ============================================================================
create table public.weekly_themes (
  id            uuid primary key default uuid_generate_v4(),
  week_number   int not null unique check (week_number between 1 and 4),
  title         text not null,
  title_ar      text not null default '',
  subtitle      text not null default '',
  description   text not null default '',
  gradient_from text not null default '#0A2540',
  gradient_to   text not null default '#1a3a5c',
  icon          text not null default 'sparkles',
  created_at    timestamptz not null default now()
);

alter table public.weekly_themes enable row level security;

create policy "Anyone can read weekly themes"
  on public.weekly_themes for select using (true);


-- 3. DAILY CHALLENGES
-- ============================================================================
create table public.daily_challenges (
  id              uuid primary key default uuid_generate_v4(),
  day_number      int not null unique check (day_number between 1 and 30),
  week_number     int not null references public.weekly_themes(week_number),
  title           text not null,
  title_ar        text not null default '',
  description     text not null default '',
  category        text not null default 'general'
                    check (category in ('gratitude', 'charity', 'kindness', 'worship', 'community', 'self-improvement', 'general')),
  icon            text not null default 'star',
  points          int not null default 10,
  created_at      timestamptz not null default now()
);

alter table public.daily_challenges enable row level security;

create policy "Anyone can read daily challenges"
  on public.daily_challenges for select using (true);


-- 4. QURAN GOALS
-- ============================================================================
create type public.quran_goal_type as enum ('1x', '2x', '3x', 'custom');

create table public.quran_goals (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  goal_type       public.quran_goal_type not null default '1x',
  total_pages     int not null default 604 check (total_pages > 0),
  ramadan_days    int not null default 30 check (ramadan_days between 28 and 30),
  daily_target    int not null generated always as (
                    ceil(total_pages::numeric / ramadan_days)::int
                  ) stored,
  -- Per-prayer page distribution (JSON: {fajr: N, dhuhr: N, asr: N, maghrib: N, isha: N})
  prayer_distribution jsonb not null default '{"fajr": 0, "dhuhr": 0, "asr": 0, "maghrib": 0, "isha": 0}',
  ramadan_year    int not null default extract(year from now()),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(user_id, ramadan_year)
);

alter table public.quran_goals enable row level security;

create policy "Users can manage own quran goals"
  on public.quran_goals for all using (auth.uid() = user_id);
-- Peers can view each other's goals (via peer_connections)
create policy "Peers can view goals"
  on public.quran_goals for select using (
    exists (
      select 1 from public.peer_connections pc
      where pc.status = 'accepted'
        and (
          (pc.user_id = auth.uid() and pc.peer_id = quran_goals.user_id)
          or (pc.peer_id = auth.uid() and pc.user_id = quran_goals.user_id)
        )
    )
  );

create trigger quran_goals_updated_at
  before update on public.quran_goals
  for each row execute function public.set_updated_at();


-- 5. READING LOGS
-- ============================================================================
create table public.reading_logs (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  goal_id             uuid not null references public.quran_goals(id) on delete cascade,
  log_date            date not null default current_date,
  pages_read          int not null default 0 check (pages_read >= 0),
  -- Which prayers were the reading done in
  prayers_completed   jsonb not null default '{"fajr": false, "dhuhr": false, "asr": false, "maghrib": false, "isha": false}',
  notes               text default '',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(user_id, goal_id, log_date)
);

alter table public.reading_logs enable row level security;

create policy "Users can manage own reading logs"
  on public.reading_logs for all using (auth.uid() = user_id);
create policy "Peers can view reading logs"
  on public.reading_logs for select using (
    exists (
      select 1 from public.peer_connections pc
      where pc.status = 'accepted'
        and (
          (pc.user_id = auth.uid() and pc.peer_id = reading_logs.user_id)
          or (pc.peer_id = auth.uid() and pc.user_id = reading_logs.user_id)
        )
    )
  );

create index reading_logs_user_date on public.reading_logs(user_id, log_date);
create index reading_logs_goal on public.reading_logs(goal_id);

create trigger reading_logs_updated_at
  before update on public.reading_logs
  for each row execute function public.set_updated_at();


-- 6. PEER CONNECTIONS
-- ============================================================================
create type public.peer_status as enum ('pending', 'accepted', 'declined');

create table public.peer_connections (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  peer_id       uuid not null references public.profiles(id) on delete cascade,
  status        public.peer_status not null default 'pending',
  message       text default '',
  ramadan_year  int not null default extract(year from now()),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (user_id <> peer_id),
  unique(user_id, peer_id, ramadan_year)
);

alter table public.peer_connections enable row level security;

create policy "Users can view own peer connections"
  on public.peer_connections for select using (
    auth.uid() = user_id or auth.uid() = peer_id
  );
create policy "Users can create peer requests"
  on public.peer_connections for insert with check (auth.uid() = user_id);
create policy "Users can update connections they're part of"
  on public.peer_connections for update using (
    auth.uid() = user_id or auth.uid() = peer_id
  );
create policy "Users can delete own connections"
  on public.peer_connections for delete using (
    auth.uid() = user_id or auth.uid() = peer_id
  );

create trigger peer_connections_updated_at
  before update on public.peer_connections
  for each row execute function public.set_updated_at();


-- 7. USER CHALLENGE COMPLETIONS
-- ============================================================================
create table public.user_challenge_completions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  challenge_id    uuid not null references public.daily_challenges(id) on delete cascade,
  completed_at    timestamptz not null default now(),
  notes           text default '',
  ramadan_year    int not null default extract(year from now()),
  unique(user_id, challenge_id, ramadan_year)
);

alter table public.user_challenge_completions enable row level security;

create policy "Users can manage own challenge completions"
  on public.user_challenge_completions for all using (auth.uid() = user_id);
create policy "Peers can view challenge completions"
  on public.user_challenge_completions for select using (
    exists (
      select 1 from public.peer_connections pc
      where pc.status = 'accepted'
        and (
          (pc.user_id = auth.uid() and pc.peer_id = user_challenge_completions.user_id)
          or (pc.peer_id = auth.uid() and pc.user_id = user_challenge_completions.user_id)
        )
    )
  );


-- 8. REFLECTIONS (Journal)
-- ============================================================================
create type public.mood_type as enum ('grateful', 'peaceful', 'hopeful', 'determined', 'struggling', 'reflective');

create table public.reflections (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  reflection_date date not null default current_date,
  prompt        text not null default '',
  content       text not null default '',
  mood          public.mood_type,
  is_private    boolean not null default true,
  ramadan_year  int not null default extract(year from now()),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(user_id, reflection_date, ramadan_year)
);

alter table public.reflections enable row level security;

create policy "Users can manage own reflections"
  on public.reflections for all using (auth.uid() = user_id);

create index reflections_user_date on public.reflections(user_id, reflection_date);

create trigger reflections_updated_at
  before update on public.reflections
  for each row execute function public.set_updated_at();


-- 9. COMMUNITY POSTS
-- ============================================================================
create type public.post_type as enum ('progress', 'encouragement', 'kindness');

create table public.community_posts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  post_type     public.post_type not null default 'encouragement',
  content       text not null check (char_length(content) <= 1000),
  likes_count   int not null default 0,
  comments_count int not null default 0,
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.community_posts enable row level security;

create policy "Authenticated users can read all posts"
  on public.community_posts for select using (auth.role() = 'authenticated');
create policy "Users can create posts"
  on public.community_posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts"
  on public.community_posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts"
  on public.community_posts for delete using (auth.uid() = user_id);

create index community_posts_created on public.community_posts(created_at desc);

create trigger community_posts_updated_at
  before update on public.community_posts
  for each row execute function public.set_updated_at();


-- 10. COMMUNITY POST LIKES
-- ============================================================================
create table public.post_likes (
  id        uuid primary key default uuid_generate_v4(),
  post_id   uuid not null references public.community_posts(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy "Authenticated users can read likes"
  on public.post_likes for select using (auth.role() = 'authenticated');
create policy "Users can manage own likes"
  on public.post_likes for insert with check (auth.uid() = user_id);
create policy "Users can remove own likes"
  on public.post_likes for delete using (auth.uid() = user_id);

-- Trigger to update likes_count
create or replace function public.update_post_likes_count()
returns trigger
language plpgsql security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.community_posts set likes_count = likes_count + 1 where id = new.post_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.community_posts set likes_count = likes_count - 1 where id = old.post_id;
    return old;
  end if;
end;
$$;

create trigger on_post_like_change
  after insert or delete on public.post_likes
  for each row execute function public.update_post_likes_count();


-- 11. COMMUNITY POST COMMENTS
-- ============================================================================
create table public.post_comments (
  id        uuid primary key default uuid_generate_v4(),
  post_id   uuid not null references public.community_posts(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  content   text not null check (char_length(content) <= 500),
  created_at timestamptz not null default now()
);

alter table public.post_comments enable row level security;

create policy "Authenticated users can read comments"
  on public.post_comments for select using (auth.role() = 'authenticated');
create policy "Users can create comments"
  on public.post_comments for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments"
  on public.post_comments for delete using (auth.uid() = user_id);

-- Trigger to update comments_count
create or replace function public.update_post_comments_count()
returns trigger
language plpgsql security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.community_posts set comments_count = comments_count + 1 where id = new.post_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.community_posts set comments_count = comments_count - 1 where id = old.post_id;
    return old;
  end if;
end;
$$;

create trigger on_post_comment_change
  after insert or delete on public.post_comments
  for each row execute function public.update_post_comments_count();


-- 12. BADGES
-- ============================================================================
create table public.badges (
  id            uuid primary key default uuid_generate_v4(),
  slug          text not null unique,
  title         text not null,
  title_ar      text not null default '',
  description   text not null default '',
  icon          text not null default 'award',
  category      text not null default 'general'
                  check (category in ('quran', 'challenge', 'streak', 'community', 'general')),
  requirement   jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

alter table public.badges enable row level security;

create policy "Anyone can read badges"
  on public.badges for select using (true);


-- 13. USER BADGES
-- ============================================================================
create table public.user_badges (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  badge_id    uuid not null references public.badges(id) on delete cascade,
  earned_at   timestamptz not null default now(),
  unique(user_id, badge_id)
);

alter table public.user_badges enable row level security;

create policy "Users can view own badges"
  on public.user_badges for select using (auth.uid() = user_id);
create policy "Authenticated users can view all badges"
  on public.user_badges for select using (auth.role() = 'authenticated');
create policy "System can insert badges"
  on public.user_badges for insert with check (auth.uid() = user_id);


-- 14. NOTIFICATIONS
-- ============================================================================
create type public.notification_type as enum (
  'peer_request', 'peer_accepted', 'peer_encouragement',
  'badge_earned', 'streak_reminder', 'community_like', 'community_comment',
  'system'
);

create table public.notifications (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  type          public.notification_type not null,
  title         text not null,
  body          text not null default '',
  data          jsonb default '{}',
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);
create policy "System can insert notifications"
  on public.notifications for insert with check (true);

create index notifications_user_unread on public.notifications(user_id, is_read, created_at desc);


-- 15. PEER ENCOURAGEMENTS
-- ============================================================================
create table public.peer_encouragements (
  id              uuid primary key default uuid_generate_v4(),
  connection_id   uuid not null references public.peer_connections(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  receiver_id     uuid not null references public.profiles(id) on delete cascade,
  message_type    text not null default 'custom'
                    check (message_type in ('mashaallah', 'dua', 'keep_going', 'custom')),
  custom_message  text default '',
  created_at      timestamptz not null default now()
);

alter table public.peer_encouragements enable row level security;

create policy "Users can view own encouragements"
  on public.peer_encouragements for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );
create policy "Users can send encouragements"
  on public.peer_encouragements for insert with check (auth.uid() = sender_id);


-- 16. Realtime publication
-- ============================================================================
alter publication supabase_realtime add table public.reading_logs;
alter publication supabase_realtime add table public.peer_encouragements;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.community_posts;


-- 17. Helper views / functions
-- ============================================================================

-- Get user's total pages read for current Ramadan
create or replace function public.get_user_reading_stats(p_user_id uuid, p_year int default extract(year from now())::int)
returns table (
  total_pages_read bigint,
  days_logged bigint,
  current_streak int,
  longest_streak int
)
language plpgsql security definer
as $$
declare
  v_streak int := 0;
  v_longest int := 0;
  v_prev_date date;
  r record;
begin
  -- Calculate streaks
  for r in
    select log_date from public.reading_logs rl
    join public.quran_goals qg on rl.goal_id = qg.id
    where rl.user_id = p_user_id
      and qg.ramadan_year = p_year
      and rl.pages_read > 0
    order by log_date desc
  loop
    if v_prev_date is null then
      -- First iteration: check if it's today or yesterday
      if r.log_date >= current_date - interval '1 day' then
        v_streak := 1;
      else
        v_streak := 0;
      end if;
    elsif v_prev_date - r.log_date = 1 then
      v_streak := v_streak + 1;
    else
      exit;
    end if;
    v_prev_date := r.log_date;
    if v_streak > v_longest then
      v_longest := v_streak;
    end if;
  end loop;

  return query
  select
    coalesce(sum(rl.pages_read), 0)::bigint as total_pages_read,
    count(distinct rl.log_date)::bigint as days_logged,
    v_streak as current_streak,
    greatest(v_streak, v_longest) as longest_streak
  from public.reading_logs rl
  join public.quran_goals qg on rl.goal_id = qg.id
  where rl.user_id = p_user_id
    and qg.ramadan_year = p_year;
end;
$$;
