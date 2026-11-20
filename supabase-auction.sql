-- animeVS · Auction rooms
-- Run once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to run again: every statement is guarded.
--
-- One row per room. The whole auction lives in `state` (shaped by the pure
-- auction* functions in src/App.jsx) and every write from the client is a
-- compare-and-set on `version`, so two players acting at once can't corrupt it.

create table if not exists public.auction_rooms (
  code       text primary key,
  state      jsonb       not null,
  version    integer     not null default 0,
  created_at timestamptz not null default now()
);

-- The game has no accounts: players use the public anon key, and the six-letter
-- room code is the only thing that grants access. These policies allow exactly
-- what src/Versus.jsx does (create a room, read it, advance it) and nothing
-- else — in particular there is no delete policy.
alter table public.auction_rooms enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'auction_rooms' and policyname = 'auction_rooms_select') then
    create policy auction_rooms_select on public.auction_rooms for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'auction_rooms' and policyname = 'auction_rooms_insert') then
    create policy auction_rooms_insert on public.auction_rooms for insert to anon, authenticated with check (version = 0);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'auction_rooms' and policyname = 'auction_rooms_update') then
    create policy auction_rooms_update on public.auction_rooms for update to anon, authenticated using (true) with check (true);
  end if;
end $$;

-- Live updates: the client subscribes to row changes for its room.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'auction_rooms') then
    alter publication supabase_realtime add table public.auction_rooms;
  end if;
end $$;

-- Optional housekeeping: rooms stop being joinable after two hours, so old rows
-- can be cleared whenever you like.
-- delete from public.auction_rooms where created_at < now() - interval '1 day';
