-- Allow authenticated users to insert/update/delete series
CREATE POLICY "Admins can insert series"
  ON series FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update series"
  ON series FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete series"
  ON series FOR DELETE USING (auth.role() = 'authenticated');

-- Also ensure videos table has these policies
CREATE POLICY "Admins can insert videos"
  ON videos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update videos"
  ON videos FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete videos"
  ON videos FOR DELETE USING (auth.role() = 'authenticated');
