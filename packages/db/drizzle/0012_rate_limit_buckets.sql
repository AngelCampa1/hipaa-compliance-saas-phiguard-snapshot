CREATE TABLE "rate_limit_buckets" (
	"bucket_key" text PRIMARY KEY NOT NULL,
	"tokens" integer NOT NULL,
	"last_refill" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_rate_limit_buckets_updated_at" ON "rate_limit_buckets" ("updated_at");
