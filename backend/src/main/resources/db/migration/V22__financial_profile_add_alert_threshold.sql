-- Story 5: user-configurable budget alert threshold. Default 0 (alert when
-- the forecast balance would go negative), consistent with the acceptance
-- criteria's stated default.
ALTER TABLE financial_profiles
    ADD COLUMN IF NOT EXISTS alert_threshold NUMERIC(12,2) NOT NULL DEFAULT 0;
