ALTER TABLE jobs ADD COLUMN IF NOT EXISTS priority text DEFAULT 'Medium' 
  CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent'));

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS display_order integer;

CREATE INDEX IF NOT EXISTS idx_jobs_display_order ON jobs(display_order);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
