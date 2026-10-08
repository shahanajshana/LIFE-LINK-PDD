# LifeLink — Supabase Setup Guide

Follow these steps **once** to wire up your Supabase database.

---

## Step 1 — Create a Supabase Project

1. Go to https://supabase.com and sign in (or create a free account).
2. Click **New Project**.
3. Name it `lifelink`, choose a region close to your users, set a strong DB password.
4. Wait ~1 minute for the project to be ready.

---

## Step 2 — Copy Your Credentials into `.env`

1. In your Supabase dashboard: **Settings → API**
2. Copy **Project URL** → paste as `REACT_APP_SUPABASE_URL`
3. Copy **anon / public** key → paste as `REACT_APP_SUPABASE_ANON_KEY`

Your `.env` file (at `frontend/.env`) should look like:

```
REACT_APP_SUPABASE_URL=https://abcdefghijkl.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3 — Run the SQL Schema

Open **SQL Editor** in your Supabase dashboard and run the following script.

```sql
-- ════════════════════════════════════════════════════════════════
--  LifeLink Database Schema
-- ════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── 1. profiles ─────────────────────────────────────────────────
-- Extends the built-in auth.users table with app-specific fields.
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text not null default '',
  email           text,
  phone           text default '',
  blood_group     text default 'A+',
  dob             date,
  gender          text default 'Male',
  city            text default '',
  address         text default '',
  role            text default 'user',        -- 'user' | 'admin'
  status          text default 'Active',      -- 'Active' | 'Blocked'
  donor_status    text default 'Eligible Donor',
  donations_count int  default 0,
  lives_helped    int  default 0,
  reward_points   int  default 0,
  last_donation   date,
  next_eligible   date,
  created_at      timestamptz default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. hospitals ────────────────────────────────────────────────
create table if not exists public.hospitals (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  address           text default '',
  city              text default '',
  phone             text default '',
  email             text default '',
  emergency_contact text default '',
  blood             text default '',          -- e.g. "A+, O+, B+ Available"
  ambulance         text default 'Available', -- 'Available' | 'Not Available'
  type              text default 'General',
  lat               numeric(10,7),
  lng               numeric(10,7),
  available_groups  text[],                   -- e.g. ARRAY['A+','O+']
  status            text default 'Active',
  created_at        timestamptz default now()
);

-- ── 3. donors ───────────────────────────────────────────────────
create table if not exists public.donors (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.profiles(id) on delete set null,
  name            text not null,
  blood_group     text not null,
  city            text default '',
  phone           text default '',
  age             int,
  gender          text default 'Male',
  status          text default 'Available',   -- 'Available' | 'Recently Donated' | 'Unavailable'
  donations_count int default 0,
  last_donation   date,
  distance        text,                       -- optional display string
  created_at      timestamptz default now()
);

-- ── 4. emergency_requests ────────────────────────────────────────
create table if not exists public.emergency_requests (
  id            uuid primary key default uuid_generate_v4(),
  patient       text not null,
  blood_group   text not null,
  units_needed  int  default 1,
  hospital      text default '',
  location      text default '',
  phone         text default '',
  urgency       text default 'Normal',       -- 'Normal' | 'Urgent' | 'Emergency'
  required_date date,
  required_time text,
  message       text default '',
  status        text default 'Pending',      -- 'Pending' | 'Accepted' | 'Completed' | 'Cancelled'
  user_id       uuid references public.profiles(id) on delete set null,
  created_at    timestamptz default now()
);

-- ── 5. blood_requests ───────────────────────────────────────────
create table if not exists public.blood_requests (
  id           uuid primary key default uuid_generate_v4(),
  patient_name text default 'Patient Request',
  blood_group  text not null,
  units        int  default 1,
  hospital     text default '',
  city         text default '',
  phone        text default '',
  urgency      text default 'Normal',
  status       text default 'Pending',       -- 'Pending' | 'Matched' | 'Fulfilled' | 'Cancelled'
  user_id      uuid references public.profiles(id) on delete set null,
  created_at   timestamptz default now()
);

-- ── 6. blood_banks ──────────────────────────────────────────────
create table if not exists public.blood_banks (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  location   text default '',
  city       text default '',
  contact    text default '',
  created_at timestamptz default now()
);

-- ── 7. blood_stock ──────────────────────────────────────────────
-- Each row is one blood group at one facility/bank.
create table if not exists public.blood_stock (
  id            uuid primary key default uuid_generate_v4(),
  blood_bank_id uuid references public.blood_banks(id) on delete cascade,
  blood_group   text not null,               -- 'A+' | 'A-' | etc.
  units         int  default 0,
  status        text default 'Available',    -- 'Available' | 'Low' | 'Critical'
  indicator     text default '🟢',
  facility      text default '',             -- denormalized display name
  city          text default '',
  location      text default '',
  phone         text default '',
  updated_at    timestamptz default now()
);

-- ── 8. donation_history ─────────────────────────────────────────
create table if not exists public.donation_history (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.profiles(id) on delete cascade,
  hospital     text not null,
  blood_group  text not null,
  units        int  default 1,
  lives_helped int  default 3,
  status       text default 'Completed',
  date         date default current_date,
  created_at   timestamptz default now()
);

-- ── 9. donation_pledges ─────────────────────────────────────────
create table if not exists public.donation_pledges (
  id              uuid primary key default uuid_generate_v4(),
  pledge_type     text default 'person',     -- 'person' | 'hospital'
  request_id      uuid,
  patient_name    text,
  blood_group     text not null,
  hospital_name   text default '',
  city            text default '',
  address         text default '',
  donor_user_id   uuid references public.profiles(id) on delete set null,
  donor_name      text not null,
  donor_phone     text not null,
  preferred_date  date,
  preferred_time  text,
  notes           text,
  status          text default 'Pledged / Pending Verification',
  created_at      timestamptz default now()
);

-- ── 10. notifications ───────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.profiles(id) on delete cascade,
  type       text default 'System',          -- 'Emergency' | 'Match' | 'Update' | 'System'
  title      text not null,
  desc       text default '',
  time       text default 'Just now',
  read       boolean default false,
  created_at timestamptz default now()
);

-- ── 11. notification_settings ───────────────────────────────────
create table if not exists public.notification_settings (
  user_id         uuid primary key references public.profiles(id) on delete cascade,
  urgent_requests boolean default true,
  nearby_drives   boolean default true,
  smart_match     boolean default true,
  community       boolean default true,
  weekly_digest   boolean default true,
  push            boolean default true,
  email           boolean default true,
  sms             boolean default false,
  updated_at      timestamptz default now()
);


-- ════════════════════════════════════════════════════════════════
--  Row Level Security (RLS)
--  Users can only read/write their own data.
--  Public tables (hospitals, donors, blood_banks, blood_stock)
--  are readable by everyone.
-- ════════════════════════════════════════════════════════════════

alter table public.profiles              enable row level security;
alter table public.hospitals             enable row level security;
alter table public.donors                enable row level security;
alter table public.emergency_requests    enable row level security;
alter table public.blood_requests        enable row level security;
alter table public.blood_banks           enable row level security;
alter table public.blood_stock           enable row level security;
alter table public.donation_history      enable row level security;
alter table public.donation_pledges      enable row level security;
alter table public.notifications         enable row level security;
alter table public.notification_settings enable row level security;

-- profiles: users can read/update their own row; admins can read all
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- hospitals: public read, authenticated write
create policy "Anyone can read hospitals"
  on public.hospitals for select using (true);
create policy "Authenticated users can manage hospitals"
  on public.hospitals for all using (auth.role() = 'authenticated');

-- donors: public read, authenticated write
create policy "Anyone can read donors"
  on public.donors for select using (true);
create policy "Authenticated users can manage donors"
  on public.donors for all using (auth.role() = 'authenticated');

-- blood_banks & blood_stock: public read
create policy "Anyone can read blood_banks"
  on public.blood_banks for select using (true);
create policy "Authenticated users can manage blood_banks"
  on public.blood_banks for all using (auth.role() = 'authenticated');
create policy "Anyone can read blood_stock"
  on public.blood_stock for select using (true);
create policy "Authenticated users can manage blood_stock"
  on public.blood_stock for all using (auth.role() = 'authenticated');

-- emergency_requests: public read (SOS visible to all), authenticated write
create policy "Anyone can read emergency requests"
  on public.emergency_requests for select using (true);
create policy "Authenticated users can create emergency requests"
  on public.emergency_requests for insert with check (auth.role() = 'authenticated');
create policy "Users can delete own emergency requests"
  on public.emergency_requests for delete using (auth.uid() = user_id);
create policy "Authenticated users can update emergency requests"
  on public.emergency_requests for update using (auth.role() = 'authenticated');

-- blood_requests: users see only their own
create policy "Users can read own blood requests"
  on public.blood_requests for select using (auth.uid() = user_id);
create policy "Users can create blood requests"
  on public.blood_requests for insert with check (auth.role() = 'authenticated');

-- donation_history: users see only their own
create policy "Users can read own donation history"
  on public.donation_history for select using (auth.uid() = user_id);
create policy "Authenticated users can insert donation history"
  on public.donation_history for insert with check (auth.role() = 'authenticated');

-- donation_pledges: users see only their own
create policy "Users can read own pledges"
  on public.donation_pledges for select using (auth.uid() = donor_user_id);
create policy "Users can create pledges"
  on public.donation_pledges for insert with check (auth.role() = 'authenticated');

-- notifications: users see only their own
create policy "Users can read own notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);
create policy "Users can delete own notifications"
  on public.notifications for delete using (auth.uid() = user_id);
create policy "System can insert notifications"
  on public.notifications for insert with check (auth.role() = 'authenticated');

-- notification_settings: users see only their own
create policy "Users can manage own notification settings"
  on public.notification_settings for all using (auth.uid() = user_id);


-- ════════════════════════════════════════════════════════════════
--  Seed Data  —  paste this after the schema to get sample data
-- ════════════════════════════════════════════════════════════════

-- Sample hospitals
insert into public.hospitals (name, address, city, phone, email, blood, ambulance, type, available_groups) values
  ('Apollo Hospital',      '21 Greams Lane, Off Greams Road', 'Chennai',   '+91 9876543210', 'emergency@apollo.com',      'A+, O+, B+ Available',  'Available',     'Multi-speciality', ARRAY['A+','O+','B+','O-']),
  ('City Hospital',        '88 MG Road, Indiranagar',         'Bangalore', '+91 9988776655', 'help@cityhospital.org',      'AB+, O- Available',     'Available',     'Emergency Care',   ARRAY['AB+','O-','B+']),
  ('Red Cross Center',     '4-1-825 Bank Street, Koti',       'Hyderabad', '+91 8877665544', 'info@redcrosshyd.org',       'Emergency Blood Support','Not Available', 'Blood Center',     ARRAY['O-','A-','B-']),
  ('Fortis Healthcare',    'Mulund West',                     'Mumbai',    '+91 9820011223', 'emergency@fortis.com',       'AB+, O+, A+ Available', 'Available',     'Multi-speciality', ARRAY['AB+','O+','A+']),
  ('Max Hospital',         'Press Enclave Road, Saket',       'Delhi',     '+91 9811223344', 'emergency@maxhospital.in',   'A-, B+, O+ Available',  'Available',     'Super-speciality', ARRAY['A-','B+','O+']);

-- Sample blood bank
insert into public.blood_banks (name, location, city, contact) values
  ('Central Blood Bank & Research Center', 'Greams Road', 'Chennai', '+91 44 2829 1100');

-- Sample blood stock (linked to the blood bank above)
-- First get the bank id, then insert stock
do $$
declare
  bank_id uuid;
begin
  select id into bank_id from public.blood_banks where name = 'Central Blood Bank & Research Center' limit 1;

  insert into public.blood_stock (blood_bank_id, blood_group, units, status, indicator, facility, city, location, phone) values
    (bank_id, 'A+',  24, 'Available', '🟢', 'Central Blood Bank', 'Chennai', 'Greams Road', '+91 44 2829 1100'),
    (bank_id, 'A-',   4, 'Low',       '🟡', 'Central Blood Bank', 'Chennai', 'Greams Road', '+91 44 2829 1100'),
    (bank_id, 'B+',  18, 'Available', '🟢', 'Central Blood Bank', 'Chennai', 'Greams Road', '+91 44 2829 1100'),
    (bank_id, 'B-',   2, 'Critical',  '🔴', 'Central Blood Bank', 'Chennai', 'Greams Road', '+91 44 2829 1100'),
    (bank_id, 'O+',  35, 'Available', '🟢', 'Central Blood Bank', 'Chennai', 'Greams Road', '+91 44 2829 1100'),
    (bank_id, 'O-',   1, 'Critical',  '🔴', 'Central Blood Bank', 'Chennai', 'Greams Road', '+91 44 2829 1100'),
    (bank_id, 'AB+', 12, 'Available', '🟢', 'Central Blood Bank', 'Chennai', 'Greams Road', '+91 44 2829 1100'),
    (bank_id, 'AB-',  3, 'Low',       '🟡', 'Central Blood Bank', 'Chennai', 'Greams Road', '+91 44 2829 1100');
end $$;
```

---

## Step 4 — Restart the App

```powershell
cd C:\Users\Chand\OneDrive\Desktop\LifeLink\frontend
npm start
```

The app will open at **http://localhost:3000**. Register a new account — it will be saved to Supabase and all data will be dynamic from this point.

---

## Table Summary

| Table                  | Purpose                                      |
|------------------------|----------------------------------------------|
| `profiles`             | User profiles (extends Supabase auth.users)  |
| `hospitals`            | Hospital directory                           |
| `donors`               | Donor registry                               |
| `emergency_requests`   | SOS / emergency blood requests               |
| `blood_requests`       | Standard blood requests (Find Blood page)    |
| `blood_banks`          | Blood bank facilities                        |
| `blood_stock`          | Blood inventory per facility per blood group |
| `donation_history`     | Completed donation records per user          |
| `donation_pledges`     | Pledge/appointment records (Donate Blood)    |
| `notifications`        | Per-user notifications                       |
| `notification_settings`| Per-user notification preferences            |
