ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'machinist', 'designer', 'admin'));

DROP POLICY IF EXISTS "Admins can update jobs." ON jobs;
DROP POLICY IF EXISTS "Admins can delete jobs." ON jobs;

CREATE POLICY "Privileged users can update jobs." ON jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('machinist', 'designer', 'admin')
    )
  );

CREATE POLICY "Privileged users can delete jobs." ON jobs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('machinist', 'designer', 'admin')
    )
  );
