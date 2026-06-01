-- PostgREST executes INSERT...RETURNING which triggers a SELECT policy check.
-- Anon users need SELECT to complete the INSERT successfully.
CREATE POLICY "Anyone can view found reports"
  ON found_reports FOR SELECT TO anon
  USING (true);
