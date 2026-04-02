ALTER TABLE financial_profiles
    ADD COLUMN IF NOT EXISTS balance_locked BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE financial_profiles
    ADD COLUMN IF NOT EXISTS salary_pending_confirmation BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE financial_profiles
    ADD COLUMN IF NOT EXISTS last_salary_dismissed_date DATE;