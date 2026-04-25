-- Profiles (extend auth.users)
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  phone text,
  role text default 'customer',
  created_at timestamptz default now()
);

-- Unit PS
create table ps_units (
  id uuid primary key default gen_random_uuid(),
  name text,              -- contoh: "PS5 - Unit 1"
  type text,              -- 'PS4' | 'PS5'
  tv_size text,           -- contoh: "32 inch"
  status text default 'available', -- 'available' | 'rented' | 'maintenance'
  price_per_hour numeric,
  image_url text,
  created_at timestamptz default now()
);

-- Bookings
create table bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id),
  ps_unit_id uuid references ps_units(id),
  start_time timestamptz,
  end_time timestamptz,
  duration_hours numeric,
  total_price numeric,
  status text default 'pending', -- 'pending' | 'active' | 'completed' | 'cancelled'
  notes text,
  created_at timestamptz default now()
);

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  title text,
  message text,
  type text,   -- 'booking_confirmed' | 'booking_reminder' | 'booking_completed'
  is_read boolean default false,
  created_at timestamptz default now()
);

-- RLS Policies
-- Profiles: Users can read their own profile, admin can read all
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Ps Units: Everyone can read, only admin can modify
alter table ps_units enable row level security;
create policy "Anyone can view ps units" on ps_units for select using (true);
create policy "Admins can manage ps units" on ps_units using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Bookings: Users can see own bookings, admins can see all
alter table bookings enable row level security;
create policy "Users can view own bookings" on bookings for select using (auth.uid() = customer_id);
create policy "Users can insert own bookings" on bookings for insert with check (auth.uid() = customer_id);
create policy "Admins can manage bookings" on bookings using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Notifications: Users can see own notifications
alter table notifications enable row level security;
create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);
create policy "Admins can manage notifications" on notifications using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Triggers (optional, for auto creating profile)
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Supabase Realtime
alter publication supabase_realtime add table notifications;
