WITH ranked_training_records AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, course_id
      ORDER BY
        (status = 'completed') DESC,
        completed_at DESC NULLS LAST,
        updated_at DESC NULLS LAST,
        created_at DESC NULLS LAST,
        id ASC
    ) AS row_number
  FROM training_records
)
DELETE FROM training_records
USING ranked_training_records
WHERE training_records.id = ranked_training_records.id
  AND ranked_training_records.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "training_records_user_course_unique"
  ON "training_records" ("user_id", "course_id");
