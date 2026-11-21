-- animeVS · live Versus rooms (Blind Draft and Auction)
--
-- This file describes the database as it is deployed (checked against the live
-- project on 21 November 2026). The live project already has all of it, so you
-- only need this to set up a NEW Supabase project, or to see what is there.
-- Run it in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Every statement is guarded, so running it again changes nothing.
--
-- The file keeps its original name because the README and an in-game error
-- message point to it. It now covers both room tables.

-- ─── 1. Tables ───────────────────────────────────────────────────────────────

-- Blind Draft: one row per room. A team is stored as a team code and only shown
-- to the other player once both ready flags are true.
create table if not exists public.rooms (
  code           text primary key,
  player_a_ready boolean default false,
  player_b_ready boolean default false,
  player_a_team  text,
  player_b_team  text,
  created_at     timestamptz default now()
);

-- Auction: one row per room. The whole auction lives in `state` (shaped by the
-- pure auction* functions in src/App.jsx). Every write from the game is a
-- compare-and-set on `version`, so two players acting at once can't corrupt it.
create table if not exists public.auction_rooms (
  code       text primary key,
  state      jsonb       not null,
  version    integer     not null default 0,
  created_at timestamptz not null default now()
);

-- ─── 2. Access rules ─────────────────────────────────────────────────────────
-- The game has no accounts. Players use the public key, and the six-character
-- room code is the only thing that identifies a room. The public may create a
-- room, read it and update it, which is everything src/Versus.jsx does.
-- There is deliberately NO delete rule: nothing in the game deletes a room, and
-- old rooms are removed by the scheduled job in section 4.
--
-- Known limit: anyone who knows a room code can still update that room.

alter table public.rooms         enable row level security;
alter table public.auction_rooms enable row level security;

-- the original rules allowed everything, including delete
drop policy if exists "Anyone can read/write rooms"         on public.rooms;
drop policy if exists "Anyone can read/write auction rooms" on public.auction_rooms;

drop policy if exists rooms_public_select on public.rooms;
drop policy if exists rooms_public_insert on public.rooms;
drop policy if exists rooms_public_update on public.rooms;
create policy rooms_public_select on public.rooms for select to anon, authenticated using (true);
create policy rooms_public_insert on public.rooms for insert to anon, authenticated with check (true);
create policy rooms_public_update on public.rooms for update to anon, authenticated using (true) with check (true);

drop policy if exists auction_rooms_public_select on public.auction_rooms;
drop policy if exists auction_rooms_public_insert on public.auction_rooms;
drop policy if exists auction_rooms_public_update on public.auction_rooms;
create policy auction_rooms_public_select on public.auction_rooms for select to anon, authenticated using (true);
create policy auction_rooms_public_insert on public.auction_rooms for insert to anon, authenticated with check (true);
create policy auction_rooms_public_update on public.auction_rooms for update to anon, authenticated using (true) with check (true);

-- ─── 3. Live updates ─────────────────────────────────────────────────────────
-- Each player's browser subscribes to changes on its own room row.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rooms') then
    alter publication supabase_realtime add table public.rooms;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'auction_rooms') then
    alter publication supabase_realtime add table public.auction_rooms;
  end if;
end $$;

-- ─── 4. Daily clean-up ───────────────────────────────────────────────────────
-- The game refuses rooms more than two hours old, so a room older than a day can
-- no longer be played. A scheduled job removes them every day at 04:17 UTC.
-- This is what makes the Privacy page's "rooms are removed periodically" true.
create extension if not exists pg_cron with schema pg_catalog;

select cron.unschedule(jobid) from cron.job where jobname = 'animevs-delete-old-rooms';

select cron.schedule(
  'animevs-delete-old-rooms',
  '17 4 * * *',
  $job$
    delete from public.rooms where created_at < now() - interval '1 day';
    delete from public.auction_rooms where created_at < now() - interval '1 day';
  $job$
);

-- To check the job:      select jobname, schedule, active from cron.job;
-- To see its last runs:  select status, return_message, start_time from cron.job_run_details order by start_time desc limit 5;
