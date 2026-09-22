CREATE TABLE IF NOT EXISTS approval_state (
  id BIGSERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'redirected', 'expired')),
  decision TEXT CHECK (decision IN ('approve', 'decline', 'redirect')),
  decision_source TEXT,
  user_id TEXT,
  redirect_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS approval_state_status_idx ON approval_state (status);
CREATE INDEX IF NOT EXISTS approval_state_expires_at_idx ON approval_state (expires_at);
