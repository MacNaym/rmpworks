-- B6 preparation only. Do not apply to production before approved public-form rollout.
-- Intended binding: existing RMP_LEADS Cloudflare D1 database (verify exact target before applying).
CREATE TABLE IF NOT EXISTS creator_request_limits (
  bucket_key TEXT NOT NULL CHECK (length(bucket_key) = 64),
  window_start INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  hits INTEGER NOT NULL DEFAULT 1 CHECK(hits >= 1),
  PRIMARY KEY (bucket_key, window_start)
);
CREATE INDEX IF NOT EXISTS creator_request_limits_expiry_idx
  ON creator_request_limits(expires_at);
-- Planned cleanup with a scheduled task: DELETE FROM creator_request_limits WHERE expires_at < unixepoch();
-- Never store raw IP, email, or full user agents in this table.
