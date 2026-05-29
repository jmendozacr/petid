ALTER TABLE health_records
  ADD COLUMN IF NOT EXISTS next_due_date    DATE,
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_health_records_vaccine_reminders
  ON health_records (type, next_due_date, reminder_sent_at)
  WHERE type = 'vaccine' AND next_due_date IS NOT NULL;
