alter table jobs 
add column if not exists completed_at timestamp with time zone;
