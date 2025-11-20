-- Add new columns to jobs table
alter table jobs 
add column if not exists claimed_by uuid references auth.users,
add column if not exists g_code_url text,
add column if not exists drawing_url text,
add column if not exists completion_image_url text,
add column if not exists est_hours int default 0,
add column if not exists est_minutes int default 0;

-- Update RLS policies to allow claiming
create policy "Users can update jobs they have claimed." on jobs
  for update using (
    (select auth.uid()) = claimed_by
  );

create policy "Users can claim pending jobs." on jobs
  for update using (
    status = 'Pending'
  )
  with check (
    (select auth.uid()) = claimed_by
  );

-- Allow anyone to read profiles (already exists but ensuring)
-- Ensure storage buckets are public (this usually needs to be done in UI, but we can try to set policies if bucket exists)
-- We assume bucket 'job-files' exists.

-- Policy to allow authenticated users to upload files to 'job-files' bucket
-- Note: You might need to run this in the Storage > Policies section or SQL editor if you have storage schema access.
-- insert into storage.buckets (id, name, public) values ('job-files', 'job-files', true) on conflict do nothing;

-- create policy "Authenticated users can upload job files"
-- on storage.objects for insert
-- with check ( bucket_id = 'job-files' and auth.role() = 'authenticated' );

-- create policy "Anyone can view job files"
-- on storage.objects for select
-- using ( bucket_id = 'job-files' );
