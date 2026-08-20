CREATE UNIQUE INDEX IF NOT EXISTS nurture_sends_enrollment_step_unique
  ON nurture_sends (enrollment_id, step_id);
