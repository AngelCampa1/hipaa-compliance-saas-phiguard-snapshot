CREATE TABLE IF NOT EXISTS "processed_webhook_events" (
  "provider" text NOT NULL,
  "event_id" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("provider", "event_id")
);
