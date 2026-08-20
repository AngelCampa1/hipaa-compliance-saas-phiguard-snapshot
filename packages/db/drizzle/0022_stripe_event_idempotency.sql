CREATE TABLE IF NOT EXISTS "processed_stripe_events" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
