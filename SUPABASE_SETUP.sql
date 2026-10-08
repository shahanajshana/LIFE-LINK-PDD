-- ============================================================
--  LifeLink — Supabase Database Setup  (idempotent — safe to re-run)
--  Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT '',
  email           TEXT NOT NULL DEFAULT '',
  phone           TEXT DEFAULT '',
  blood_group     TEXT DEFAULT 'O+',
  dob             DATE,
  gender          TEXT DEFAULT 'Other',
  city            TEXT DEFAULT '',
  address         TEXT DEFAULT '',
  role            TEXT DEFAULT 'user' CHECK (role IN ('user','admin')),
  status          TEXT DEFAULT 'Active' CHECK (status IN ('Active','Blocked')),
  donor_status    TEXT DEFAULT 'Eligible Donor',
  donations_count INT  DEFAULT 0,
  lives_helped    INT  DEFAULT 0,
  reward_points   INT  DEFAULT 100,
  last_donation   TEXT,
  next_eligible   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 2. DONORS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.donors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  blood_group     TEXT NOT NULL,
  city            TEXT NOT NULL,
  phone           TEXT NOT NULL,
  gender          TEXT DEFAULT 'Other',
  age             INT,
  status          TEXT DEFAULT 'Available',
  distance        TEXT DEFAULT 'N/A',
  last_donation   TEXT,
  donations_count INT  DEFAULT 0,
  is_verified     BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 3. HOSPITALS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hospitals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  address           TEXT DEFAULT '',
  city              TEXT NOT NULL,
  phone             TEXT NOT NULL,
  email             TEXT DEFAULT '',
  emergency_contact TEXT DEFAULT '',
  blood             TEXT DEFAULT 'Available on request',
  available_groups  TEXT[] DEFAULT ARRAY['A+','O+','B+'],
  ambulance         TEXT DEFAULT 'Available',
  type              TEXT DEFAULT 'General Hospital',
  lat               DOUBLE PRECISION,
  lng               DOUBLE PRECISION,
  status            TEXT DEFAULT 'Active',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 4. BLOOD BANKS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blood_banks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  location   TEXT DEFAULT '',
  city       TEXT NOT NULL,
  contact    TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 5. BLOOD STOCK
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blood_stock (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id     UUID REFERENCES public.blood_banks(id) ON DELETE CASCADE,
  blood_group TEXT NOT NULL,
  units       INT  DEFAULT 0,
  status      TEXT DEFAULT 'Available',
  indicator   TEXT DEFAULT '🟢',
  facility    TEXT DEFAULT '',
  city        TEXT DEFAULT '',
  location    TEXT DEFAULT '',
  phone       TEXT DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 6. EMERGENCY REQUESTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient       TEXT NOT NULL,
  blood_group   TEXT NOT NULL,
  units_needed  INT  DEFAULT 1,
  hospital      TEXT NOT NULL,
  location      TEXT DEFAULT '',
  phone         TEXT NOT NULL,
  urgency       TEXT DEFAULT 'Emergency',
  required_date DATE,
  required_time TEXT DEFAULT 'Immediate',
  message       TEXT DEFAULT '',
  status        TEXT DEFAULT 'Pending',
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 7. BLOOD REQUESTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blood_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT DEFAULT 'Patient',
  blood_group  TEXT NOT NULL,
  units        INT  DEFAULT 1,
  hospital     TEXT NOT NULL,
  city         TEXT DEFAULT '',
  phone        TEXT DEFAULT '',
  urgency      TEXT DEFAULT 'Normal',
  status       TEXT DEFAULT 'Pending',
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 8. DONATION HISTORY
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.donation_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date         TEXT NOT NULL,
  hospital     TEXT NOT NULL,
  blood_group  TEXT NOT NULL,
  units        INT  DEFAULT 1,
  status       TEXT DEFAULT 'Completed',
  lives_helped INT  DEFAULT 3,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 9. DONATION PLEDGES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.donation_pledges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pledge_type     TEXT DEFAULT 'person' CHECK (pledge_type IN ('person','hospital')),
  request_id      TEXT,
  patient_name    TEXT,
  blood_group     TEXT NOT NULL,
  hospital_name   TEXT,
  city            TEXT,
  address         TEXT,
  donor_user_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_name      TEXT NOT NULL,
  donor_phone     TEXT NOT NULL,
  preferred_date  DATE,
  preferred_time  TEXT,
  notes           TEXT,
  status          TEXT DEFAULT 'Pledged / Pending Verification',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 10. NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT DEFAULT 'General',
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 11. NOTIFICATION SETTINGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  urgent_requests BOOLEAN DEFAULT TRUE,
  nearby_drives   BOOLEAN DEFAULT TRUE,
  smart_match     BOOLEAN DEFAULT TRUE,
  community       BOOLEAN DEFAULT TRUE,
  weekly_digest   BOOLEAN DEFAULT TRUE,
  push            BOOLEAN DEFAULT TRUE,
  email           BOOLEAN DEFAULT TRUE,
  sms             BOOLEAN DEFAULT FALSE,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_banks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_stock           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_pledges      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- ── profiles ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile"      ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"    ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles"    ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles"  ON public.profiles;
DROP POLICY IF EXISTS "Allow insert own profile"        ON public.profiles;

-- Helper function to get current user's role without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.get_my_role() = 'admin');

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.get_my_role() = 'admin');

CREATE POLICY "Allow insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── donors ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone authenticated can read donors"  ON public.donors;
DROP POLICY IF EXISTS "Authenticated users can insert donors" ON public.donors;

CREATE POLICY "Anyone authenticated can read donors"
  ON public.donors FOR SELECT
  TO authenticated USING (TRUE);

CREATE POLICY "Authenticated users can insert donors"
  ON public.donors FOR INSERT
  TO authenticated WITH CHECK (TRUE);

-- ── hospitals ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone authenticated can read hospitals"    ON public.hospitals;
DROP POLICY IF EXISTS "Authenticated users can manage hospitals"   ON public.hospitals;

CREATE POLICY "Anyone authenticated can read hospitals"
  ON public.hospitals FOR SELECT
  TO authenticated USING (TRUE);

CREATE POLICY "Authenticated users can manage hospitals"
  ON public.hospitals FOR ALL
  TO authenticated USING (TRUE);

-- ── blood_banks ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone authenticated can read blood_banks"  ON public.blood_banks;

CREATE POLICY "Anyone authenticated can read blood_banks"
  ON public.blood_banks FOR SELECT
  TO authenticated USING (TRUE);

-- ── blood_stock ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone authenticated can read blood_stock"  ON public.blood_stock;

CREATE POLICY "Anyone authenticated can read blood_stock"
  ON public.blood_stock FOR SELECT
  TO authenticated USING (TRUE);

-- ── emergency_requests ────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can read emergency requests"   ON public.emergency_requests;
DROP POLICY IF EXISTS "Authenticated users can insert emergency requests" ON public.emergency_requests;
DROP POLICY IF EXISTS "Owner can delete own emergency requests"           ON public.emergency_requests;
DROP POLICY IF EXISTS "Admins can update emergency request status"        ON public.emergency_requests;

CREATE POLICY "Authenticated users can read emergency requests"
  ON public.emergency_requests FOR SELECT
  TO authenticated USING (TRUE);

CREATE POLICY "Authenticated users can insert emergency requests"
  ON public.emergency_requests FOR INSERT
  TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Owner can delete own emergency requests"
  ON public.emergency_requests FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update emergency request status"
  ON public.emergency_requests FOR UPDATE
  TO authenticated USING (TRUE);

-- ── blood_requests ────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can read blood requests"   ON public.blood_requests;
DROP POLICY IF EXISTS "Authenticated users can insert blood requests" ON public.blood_requests;

CREATE POLICY "Authenticated users can read blood requests"
  ON public.blood_requests FOR SELECT
  TO authenticated USING (TRUE);

CREATE POLICY "Authenticated users can insert blood requests"
  ON public.blood_requests FOR INSERT
  TO authenticated WITH CHECK (TRUE);

-- ── donation_history ──────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read own donation history"   ON public.donation_history;
DROP POLICY IF EXISTS "Users can insert own donation history" ON public.donation_history;

CREATE POLICY "Users can read own donation history"
  ON public.donation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own donation history"
  ON public.donation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── donation_pledges ──────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read own pledges"             ON public.donation_pledges;
DROP POLICY IF EXISTS "Authenticated users can insert pledges" ON public.donation_pledges;

CREATE POLICY "Users can read own pledges"
  ON public.donation_pledges FOR SELECT
  USING (auth.uid() = donor_user_id);

CREATE POLICY "Authenticated users can insert pledges"
  ON public.donation_pledges FOR INSERT
  TO authenticated WITH CHECK (TRUE);

-- ── notifications ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;

CREATE POLICY "Users can manage own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

-- ── notification_settings ─────────────────────────────────────
DROP POLICY IF EXISTS "Users can manage own notification settings" ON public.notification_settings;

CREATE POLICY "Users can manage own notification settings"
  ON public.notification_settings FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
--  TRIGGER: auto-create profile row on sign-up
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
--  SEED DATA  (safe to re-run — uses ON CONFLICT DO NOTHING)
-- ============================================================

INSERT INTO public.hospitals
  (name, address, city, phone, email, emergency_contact, blood, available_groups, ambulance, type, lat, lng, status)
VALUES
  ('Apollo Hospital',               '21 Greams Lane, Off Greams Road', 'Chennai',   '+91 44 2829 0200', 'emergency@apollo.com',      '+91 44 2829 0200', 'A+, O+, B+ Available',    ARRAY['A+','O+','B+','AB+'],                     'Available',     'Multi-speciality', 13.0604, 80.2496, 'Active'),
  ('City Hospital',                 '88 MG Road, Indiranagar',         'Bangalore', '+91 80 2528 1122', 'help@cityhospital.org',     '+91 80 2528 1122', 'AB+, O- Available',       ARRAY['AB+','O-','A-','B-'],                     'Available',     'Emergency Care',   12.9716, 77.5946, 'Active'),
  ('Red Cross Center',              '4-1-825 Bank Street, Koti',       'Hyderabad', '+91 40 2475 3311', 'info@redcrosshyd.org',      '+91 40 2475 3311', 'Emergency Blood Support', ARRAY['A+','B+','O+','O-'],                      'Not Available', 'Blood Center',     17.3850, 78.4867, 'Active'),
  ('Fortis Healthcare',             'Mulund Goregaon Link Road',       'Mumbai',    '+91 22 6799 4444', 'contact@fortishealth.com',  '+91 22 6799 4444', 'All Groups Available',    ARRAY['A+','A-','B+','B-','O+','O-','AB+','AB-'],'Available',     'Super Speciality', 19.1663, 72.9526, 'Active'),
  ('Max Super Speciality Hospital', '1 Press Enclave Road, Saket',     'Delhi',     '+91 11 2651 5050', 'care@maxhealthcare.com',    '+91 11 2651 5050', 'A-, O+, B- Available',    ARRAY['A-','O+','B-','AB-'],                     'Available',     'Emergency Care',   28.5273, 77.2117, 'Active')
ON CONFLICT DO NOTHING;

INSERT INTO public.donors
  (name, blood_group, city, phone, gender, age, status, distance, last_donation, donations_count, is_verified)
VALUES
  ('Rahul Kumar',  'A+',  'Chennai',   '+91 9876543210', 'Male',   24, 'Available',        '2.5 km', '12 March 2026',    8,  TRUE),
  ('Priya Sharma', 'O-',  'Bangalore', '+91 9988776655', 'Female', 22, 'Available',        '3.2 km', '20 February 2026', 12, TRUE),
  ('Arun Raj',     'B+',  'Hyderabad', '+91 8877665544', 'Male',   25, 'Recently Donated', '5.1 km', '05 May 2026',      5,  FALSE),
  ('Sneha Reddy',  'AB+', 'Mumbai',    '+91 7766554433', 'Female', 23, 'Available',        '4.4 km', '10 April 2026',    10, TRUE),
  ('Kiran Verma',  'A-',  'Chennai',   '+91 9445566778', 'Male',   28, 'Available',        '6.0 km', '01 January 2026',  14, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.blood_banks (id, name, location, city, contact)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Central Blood Bank & Research Center', 'Greams Road', 'Chennai',   '+91 44 2829 1100'),
  ('a1000000-0000-0000-0000-000000000002', 'Rotary Lions Emergency Blood Bank',    'Indiranagar', 'Bangalore', '+91 80 2525 9900')
ON CONFLICT DO NOTHING;

INSERT INTO public.blood_stock (bank_id, blood_group, units, status, indicator, facility, city, location, phone)
VALUES
  ('a1000000-0000-0000-0000-000000000001','A+',  24, 'Available', '🟢', 'Central Blood Bank & Research Center', 'Chennai',   'Greams Road, Chennai',   '+91 44 2829 1100'),
  ('a1000000-0000-0000-0000-000000000001','A-',   4, 'Low',       '🟡', 'Central Blood Bank & Research Center', 'Chennai',   'Greams Road, Chennai',   '+91 44 2829 1100'),
  ('a1000000-0000-0000-0000-000000000001','B+',  18, 'Available', '🟢', 'Central Blood Bank & Research Center', 'Chennai',   'Greams Road, Chennai',   '+91 44 2829 1100'),
  ('a1000000-0000-0000-0000-000000000001','B-',   2, 'Critical',  '🔴', 'Central Blood Bank & Research Center', 'Chennai',   'Greams Road, Chennai',   '+91 44 2829 1100'),
  ('a1000000-0000-0000-0000-000000000001','O+',  35, 'Available', '🟢', 'Central Blood Bank & Research Center', 'Chennai',   'Greams Road, Chennai',   '+91 44 2829 1100'),
  ('a1000000-0000-0000-0000-000000000001','O-',   1, 'Critical',  '🔴', 'Central Blood Bank & Research Center', 'Chennai',   'Greams Road, Chennai',   '+91 44 2829 1100'),
  ('a1000000-0000-0000-0000-000000000001','AB+', 12, 'Available', '🟢', 'Central Blood Bank & Research Center', 'Chennai',   'Greams Road, Chennai',   '+91 44 2829 1100'),
  ('a1000000-0000-0000-0000-000000000001','AB-',  3, 'Low',       '🟡', 'Central Blood Bank & Research Center', 'Chennai',   'Greams Road, Chennai',   '+91 44 2829 1100'),
  ('a1000000-0000-0000-0000-000000000002','A+',  15, 'Available', '🟢', 'Rotary Lions Emergency Blood Bank',    'Bangalore', 'Indiranagar, Bangalore', '+91 80 2525 9900'),
  ('a1000000-0000-0000-0000-000000000002','A-',   8, 'Available', '🟢', 'Rotary Lions Emergency Blood Bank',    'Bangalore', 'Indiranagar, Bangalore', '+91 80 2525 9900'),
  ('a1000000-0000-0000-0000-000000000002','B+',   6, 'Low',       '🟡', 'Rotary Lions Emergency Blood Bank',    'Bangalore', 'Indiranagar, Bangalore', '+91 80 2525 9900'),
  ('a1000000-0000-0000-0000-000000000002','B-',   1, 'Critical',  '🔴', 'Rotary Lions Emergency Blood Bank',    'Bangalore', 'Indiranagar, Bangalore', '+91 80 2525 9900'),
  ('a1000000-0000-0000-0000-000000000002','O+',  28, 'Available', '🟢', 'Rotary Lions Emergency Blood Bank',    'Bangalore', 'Indiranagar, Bangalore', '+91 80 2525 9900'),
  ('a1000000-0000-0000-0000-000000000002','O-',   5, 'Low',       '🟡', 'Rotary Lions Emergency Blood Bank',    'Bangalore', 'Indiranagar, Bangalore', '+91 80 2525 9900'),
  ('a1000000-0000-0000-0000-000000000002','AB+',  9, 'Available', '🟢', 'Rotary Lions Emergency Blood Bank',    'Bangalore', 'Indiranagar, Bangalore', '+91 80 2525 9900'),
  ('a1000000-0000-0000-0000-000000000002','AB-',  0, 'Critical',  '🔴', 'Rotary Lions Emergency Blood Bank',    'Bangalore', 'Indiranagar, Bangalore', '+91 80 2525 9900')
ON CONFLICT DO NOTHING;
