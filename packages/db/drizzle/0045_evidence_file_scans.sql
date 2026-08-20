CREATE TABLE IF NOT EXISTS "evidence_file_scans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "s3_key" text NOT NULL,
  "av_status" "av_status" DEFAULT 'pending' NOT NULL,
  "uploaded_by" uuid REFERENCES "users"("id"),
  "scanned_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "evidence_file_scans_tenant_id_s3_key_unique" UNIQUE("tenant_id", "s3_key")
);
