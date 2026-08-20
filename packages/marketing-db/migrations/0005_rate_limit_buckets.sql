CREATE TABLE rate_limit_buckets (
  bucket_key  text PRIMARY KEY,
  tokens      integer NOT NULL,
  last_refill text NOT NULL,
  updated_at  text NOT NULL
);
CREATE INDEX rate_limit_buckets_updated_at_idx ON rate_limit_buckets (updated_at);
