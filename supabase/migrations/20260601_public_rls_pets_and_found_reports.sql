-- Allow anyone (including anon) to read pets — required for public /p/[id] page
CREATE POLICY "Anyone can view pets"
  ON pets FOR SELECT
  USING (true);

-- Allow anyone (including anon) to submit found reports
CREATE POLICY "Anyone can insert found reports"
  ON found_reports FOR INSERT
  WITH CHECK (true);

-- Allow pet owners to view reports on their pets
CREATE POLICY "Pet owners can view found reports"
  ON found_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = found_reports.pet_id
        AND pets.user_id = auth.uid()
    )
  );
