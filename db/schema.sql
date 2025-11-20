-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  role text default 'user' check (role in ('user', 'admin')),
  is_approved boolean default false,
  
  constraint full_name_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- Create a table for jobs
create table jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text check (type in ('CAM', 'Machining')) not null,
  part_name text not null,
  requester text not null,
  description text,
  status text default 'Pending' check (status in ('Pending', 'In Progress', 'Completed', 'Failed')),
  est_time text,
  user_id uuid references auth.users not null
);

-- Set up RLS for jobs
alter table jobs enable row level security;

create policy "Jobs are viewable by everyone." on jobs
  for select using (true);

create policy "Authenticated users can insert jobs." on jobs
  for insert with check (auth.role() = 'authenticated');

create policy "Admins can update jobs." on jobs
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
  
-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
