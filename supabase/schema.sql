create table entries (
  id text primary key,
  player text not null,
  team text not null,
  date text not null,
  activities jsonb not null default '[]',
  bonuses jsonb not null default '[]',
  total_pts integer not null default 0,
  note text default '',
  attachments jsonb default '[]',
  links jsonb default '[]',
  logged_at bigint,
  type text,
  created_at timestamptz default now()
);
alter table entries enable row level security;
create policy "Allow all" on entries for all using (true) with check (true);

create table challenge_entries (
  id text primary key,
  challenge_id text not null,
  player text not null,
  date text not null,
  value numeric not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table challenge_entries enable row level security;
create policy "Allow all" on challenge_entries for all using (true) with check (true);
