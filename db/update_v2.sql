alter table jobs 
add column if not exists claimed_by uuid references auth.users,
add column if not exists g_code_url text,
add column if not exists drawing_url text,
add column if not exists completion_image_url text,
add column if not exists est_hours int default 0,
add column if not exists est_minutes int default 0;

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